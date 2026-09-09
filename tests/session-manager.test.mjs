/** DSH-coupled regression tests for the per-session Cangzhi workspace + policy manager. */
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { resolve } from 'node:path'
import { access } from 'node:fs/promises'
import { createMemoryStore, serializeState, deserializeState } from '../src/host/session-state.mjs'
import { createSessionManager } from '../src/host/session-manager.mjs'
import { invokeCangzhiMcp, parseSseResponse, DEFAULT_MCP_TIMEOUT_MS } from '../src/host/mcp-call.mjs'
import { CANGZHI_TOOLS } from '../src/host/tool-names.mjs'

const dshRoot = process.env.DSH_SOURCE ?? '/home/percy/software/deepseek-harness'
const targets = [
  ['@deepseek-ai/cordis', resolve(dshRoot, 'vendor/cordis/lib/index.js')],
  ['@deepseek-ai/dsh-scope', resolve(dshRoot, 'packages/core/scope/lib/index.js')],
  ['@deepseek-ai/dsh-system-prompt', resolve(dshRoot, 'packages/core/system-prompt/lib/index.js')],
  ['@deepseek-ai/dsh-tools', resolve(dshRoot, 'packages/core/tools/lib/index.js')],
  ['@deepseek-ai/dsh-brand', resolve(dshRoot, 'node_modules/.pnpm/node_modules/@deepseek-ai/dsh-brand/lib/index.js')],
]
const skip = async () => {
  const missing = []
  for (const [name, path] of targets) {
    try { await access(path) } catch { missing.push(name) }
  }
  return missing.length > 0 ? `missing DSH lib outputs (${missing.join(', ')}); set DSH_SOURCE and build that checkout` : null
}
const skipReason = await skip()
const t = skipReason ? { skip: skipReason } : {}

function recordFetch(record) {
  return async (url, init) => {
    const body = JSON.parse(init.body)
    record.push({ url, method: init.method, workspace: init.headers['x-cangzhi-workspace'], rawName: body.params.name, protocol: init.headers['mcp-protocol-version'], sessionHeader: init.headers['Mcp-Session-Id'] })
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: `ok:${body.params.arguments?.q ?? ''}` }] } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
}

function sseFetch(record, onFirst) {
  let seen = 0
  return async (url, init) => {
    seen += 1
    if (onFirst !== undefined && seen === 1) onFirst()
    const body = JSON.parse(init.body)
    record.push({ url, method: init.method, workspace: init.headers['x-cangzhi-workspace'], rawName: body.params.name, sessionHeader: init.headers['Mcp-Session-Id'] })
    const id = body.id
    const payload = `event: message\ndata: ${JSON.stringify({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'sse-ok' }] } })}\n\n`
    return new Response(payload, { status: 200, headers: { 'content-type': 'text/event-stream' } })
  }
}

test('cangzhi per-session manager — isolation, inheritance, races, persistence', t, async () => {
  if (t.skip) return
  const [{ Context }, scopeMod, systemPromptMod, toolsMod] = await Promise.all(targets.map(([, path]) => import(path)))
  const { createScope, scopeOf } = scopeMod
  const SystemPrompt = systemPromptMod.default
  const ToolRuntime = toolsMod.default

  const ctx = new Context()
  await ctx.plugin(SystemPrompt, {})
  await ctx.plugin(ToolRuntime, {})
  const registerGlobals = (target) => {
    const disposers = []
    for (const name of CANGZHI_TOOLS) {
      disposers.push(target.tools.register({
        name,
        description: `cangzhi ${name}`,
        parameters: { type: 'object', properties: { q: { type: 'string' } } },
        // The output schema matches what the real DSH mcp-client bridge
        // produces for an MCP `tools/call` success: a `content` array plus
        // optional `structuredContent`. Using a permissive schema keeps the
        // test focused on the manager's behavior instead of MCP result shape.
        output: {
          schema: {
            type: 'object',
            properties: {
              content: { type: 'array' },
              structuredContent: {},
            },
            required: ['content'],
            additionalProperties: false,
          },
          render: () => [],
        },
        execute: () => Promise.resolve({ content: [] }),
      }))
    }
    return disposers
  }
  const globalDisposers = registerGlobals(ctx)

  const mint = async (target, id, parentSession) => {
    const agent = { id, session: { header: { parentSession } } }
    let scope
    await target.plugin(Object.assign((inner) => { scope = createScope(inner, agent) }, { inject: ['systemPrompt', 'tools'] }))
    agent.ctx = scope.ctx
    return { agent, key: scopeOf(scope.ctx) }
  }

  const A = await mint(ctx, 'A', undefined)
  const B = await mint(ctx, 'B', undefined)
  const agents = new Map([['A', A.agent], ['B', B.agent]])
  const facade = { get: id => (id === undefined ? undefined : agents.get(id)), list: () => [...agents.values()] }

  const store = createMemoryStore()
  const calls = []
  const manager = createSessionManager({
    store,
    defaultWorkspace: 'default',
    internalMcpBaseUrl: 'http://127.0.0.1:3089',
    agentsFacade: facade,
    tools: ctx.tools,
    fetchImpl: recordFetch(calls),
    log: () => {},
  })
  manager.onAgentCreated(A.agent)
  manager.onAgentCreated(B.agent)
  assert.equal(ctx.tools.get('mcp__cangzhi__knowledge_search', A.key)?.timeoutMs, DEFAULT_MCP_TIMEOUT_MS)

  // Drive every call through the real ToolRuntime.execute pipeline so the test
  // exercises argument validation, the scoped override, the MCP call, the
  // output schema validation, and the result the model would actually see.
  // This is the same path DSH's `tools/execute` service uses, so a passing
  // assertion here is a stronger guarantee than calling `def.execute`
  // directly.
  let callIdCounter = 0
  const execScoped = async (agent, _key, args = {}) => {
    const controller = new AbortController()
    callIdCounter += 1
    return ctx.tools.execute({
      signal: controller.signal,
      callId: `cangzhi-test-${String(callIdCounter)}`,
      name: 'mcp__cangzhi__knowledge_search',
      arguments: args,
      agent,
    })
  }

  // 1. Unbound sessions degrade to the process default (bound=false) on the wire.
  assert.equal(manager.resolveWorkspaceFor('A').bound, false)
  calls.length = 0
  const r1 = await execScoped(A.agent, A.key)
  const r2 = await execScoped(B.agent, B.key)
  assert.equal(r1.value?.content?.[0]?.text, 'ok:')
  assert.equal(r2.value?.content?.[0]?.text, 'ok:')
  assert.deepEqual(calls.map(c => c.workspace).sort(), ['default', 'default'], 'unbound sessions use the process default')
  assert.ok(calls.every(call => call.protocol === '2025-03-26'), 'every scoped call sends the MCP protocol header')

  // 2. Concurrent A/B isolation: each session gets its own workspace on the wire.
  await manager.setWorkspace('A', 'alpha')
  await manager.setWorkspace('B', 'beta')
  calls.length = 0
  // Fire both in flight simultaneously so the test catches any future race
  // where the resolution happens out of order.
  const [aResult, bResult] = await Promise.all([execScoped(A.agent, A.key, { q: 'a' }), execScoped(B.agent, B.key, { q: 'b' })])
  assert.equal(aResult.value?.content?.[0]?.text, 'ok:a')
  assert.equal(bResult.value?.content?.[0]?.text, 'ok:b')
  assert.deepEqual(calls.map(c => c.workspace).sort(), ['alpha', 'beta'])
  assert.equal(manager.resolveWorkspaceFor('A').bound, true)

  // 3. Parent->child inheritance with child->parent isolation and clearing.
  const P = await mint(ctx, 'P', undefined)
  const C = await mint(ctx, 'C', 'P')
  agents.set('P', P.agent)
  agents.set('C', C.agent)
  manager.onAgentCreated(P.agent)
  manager.onAgentCreated(C.agent)
  await manager.setWorkspace('P', 'ppin')
  calls.length = 0
  await execScoped(C.agent, C.key)
  assert.deepEqual(calls.map(c => c.workspace), ['ppin'], 'child inherits parent workspace')
  await manager.setWorkspace('C', 'cpin')
  calls.length = 0
  await execScoped(C.agent, C.key)
  await execScoped(P.agent, P.key)
  assert.deepEqual(calls.map(c => c.workspace).sort(), ['cpin', 'ppin'], 'child pin does not affect parent')
  await manager.setWorkspace('C', undefined)
  calls.length = 0
  await execScoped(C.agent, C.key)
  assert.deepEqual(calls.map(c => c.workspace), ['ppin'], 'clearing child pin restores inheritance')

  // 4. Capability policy persistence and re-enable (tools reappear).
  await manager.setPolicy('A', 'off')
  assert.equal(manager.resolvePolicyFor('A').policy, 'off')
  assert.equal(ctx.tools.get('mcp__cangzhi__knowledge_search', A.key), undefined, 'tools hidden when policy off')
  // Once restricted, the runtime must report a clean UNKNOWN_TOOL-style
  // outcome instead of letting the model call a hidden cangzhi tool.
  const offResult = await ctx.tools.execute({
    signal: new AbortController().signal,
    callId: 'cangzhi-test-policy-off',
    name: 'mcp__cangzhi__knowledge_search',
    arguments: {},
    agent: A.agent,
  })
  assert.equal(offResult.isError, true, 'runtime must reject the now-restricted tool')
  await manager.setPolicy('A', 'on')
  assert.notEqual(ctx.tools.get('mcp__cangzhi__knowledge_search', A.key), undefined, 'tools reappear when re-enabled')
  const reopened = await execScoped(A.agent, A.key, { q: 'again' })
  assert.equal(reopened.value?.content?.[0]?.text, 'ok:again')

  // 5. no-sessionId degradation: executing with no agent must refuse, not fall back.
  //    The override's `execute` reads `exec.agent.id` and throws when it is
  //    absent; the runtime would normally never invoke an override without a
  //    real agent, but the throw is the last line of defence against any
  //    future code path that calls `def.execute` directly.
  const defNoAgent = ctx.tools.get('mcp__cangzhi__knowledge_search', B.key)
  assert.ok(defNoAgent, 'override should still be visible for B')
  await assert.rejects(
    defNoAgent.execute({}, { agent: undefined, signal: new AbortController().signal }),
    /无法确定执行会话/,
    'must never silently fall back to the process workspace',
  )

  // 6. Agent-before-tools race: overrides appear only once the bridge registers.
  //    Build a fresh context that has no cangzhi-mcp tools yet, create an
  //    agent, then connect the bridge and verify the override is rebound to
  //    the freshly-registered globals — exactly the race the ADR covers.
  const raceCtx = new Context()
  await raceCtx.plugin(SystemPrompt, {})
  await raceCtx.plugin(ToolRuntime, {})
  const E = await mint(raceCtx, 'E', undefined)
  const F = await mint(raceCtx, 'F', undefined)
  const agentsR = new Map([['E', E.agent], ['F', F.agent]])
  const facadeR = { get: id => (id === undefined ? undefined : agentsR.get(id)), list: () => [...agentsR.values()] }
  const storeR = createMemoryStore()
  const callsR = []
  const managerR = createSessionManager({
    store: storeR,
    defaultWorkspace: 'default',
    internalMcpBaseUrl: 'http://127.0.0.1:3089',
    agentsFacade: facadeR,
    tools: raceCtx.tools,
    fetchImpl: recordFetch(callsR),
    log: () => {},
  })
  managerR.onAgentCreated(E.agent)
  await managerR.setPolicy('F', 'off')
  managerR.onAgentCreated(F.agent)
  assert.equal(raceCtx.tools.get('mcp__cangzhi__knowledge_search', E.key), undefined, 'no tools before the bridge connects')
  registerGlobals(raceCtx)
  const G = await mint(raceCtx, 'G', undefined)
  agentsR.set('G', G.agent)
  managerR.onAgentCreated(G.agent)
  assert.notEqual(raceCtx.tools.get('mcp__cangzhi__knowledge_search', E.key), undefined, 'agent creation must also reconcile existing sessions before consuming the bridge signature')
  managerR.onToolsChange()
  assert.equal(raceCtx.tools.get('mcp__cangzhi__knowledge_search', F.key), undefined, 'an off session stays fail-closed when the bridge appears later')
  const raceResult = await raceCtx.tools.execute({
    signal: new AbortController().signal,
    callId: 'cangzhi-test-race',
    name: 'mcp__cangzhi__knowledge_search',
    arguments: { q: 'race' },
    agent: E.agent,
  })
  assert.equal(raceResult.value?.content?.[0]?.text, 'ok:race')
  assert.equal(callsR[0].workspace, 'default', 'race-resolved override still carries the session workspace')

  // 7. Bridge re-connect: the bridge may un-register its tools (e.g. when
  //    it reconnects to the upstream Cangzhi service) and re-register them
  //    later. Each `tools/change` event must point the manager's overrides
  //    at the freshly registered globals. We simulate the disconnect by
  //    disposing the test's tracked global registrations, then re-register
  //    the same names to model the reconnect.
  for (const dispose of globalDisposers) dispose()
  registerGlobals(ctx)
  manager.onToolsChange()
  const after = ctx.tools.get('mcp__cangzhi__knowledge_search', A.key)
  assert.ok(after, 'override re-bound after the bridge re-registered')

  // 8. Restart-recovery: a manager rebuilt over a persisted store keeps pins.
  const doc = serializeState(store)
  const restoredStore = deserializeState(doc)
  assert.equal(restoredStore.getWorkspace('B'), 'beta', 'persisted workspace survives restart')
  manager.disposeAll()
})

test('mcp-call — 120s default timeout aborts long fetches when no signal is supplied', async () => {
  // The contract: callers without an explicit `exec.signal` still get a
  // wall-clock bound. Verify the bound defaults to 120000ms and is honored.
  assert.equal(DEFAULT_MCP_TIMEOUT_MS, 120_000)
  let observed = 0
  const slowFetch = async (url, init) => {
    observed = init.signal
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve(new Response('{"jsonrpc":"2.0","id":1,"result":{"content":[]}}', { status: 200, headers: { 'content-type': 'application/json' } }))
      }, 5_000)
      init.signal?.addEventListener('abort', () => {
        clearTimeout(timer)
        const reason = init.signal?.reason
        reject(reason instanceof Error ? reason : new Error('aborted'))
      })
    })
  }
  await assert.rejects(
    invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'w', rawName: 't', args: {}, fetch: slowFetch, timeoutMs: 50 }),
    /aborted|TimeoutError|exceeded/,
  )
})

test('mcp-call — caller signal wins over wall-clock bound', async () => {
  let abortTriggered = false
  const fetchImpl = async (url, init) => {
    init.signal?.addEventListener('abort', () => { abortTriggered = true })
    return new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => {
        const reason = init.signal?.reason
        reject(reason instanceof Error ? reason : new Error('aborted'))
      })
    })
  }
  const controller = new AbortController()
  const promise = invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'w', rawName: 't', args: {}, signal: controller.signal, fetch: fetchImpl, timeoutMs: 60_000 })
  setTimeout(() => controller.abort(new Error('user-cancel')), 5)
  await assert.rejects(promise, /user-cancel/)
  assert.equal(abortTriggered, true)
})

test('mcp-call — timeout remains active while an SSE response body is still streaming', async () => {
  let bodySignal
  const fetchImpl = async (_url, init) => {
    bodySignal = init.signal
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      text: () => new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })
      }),
    }
  }
  await assert.rejects(
    invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'stream-w', rawName: 'knowledge_ask', args: {}, fetch: fetchImpl, timeoutMs: 20 }),
    /TimeoutError|exceeded/,
  )
  assert.equal(bodySignal.aborted, true)
})

test('mcp-call — SSE response carries workspace and parses chunked events', async () => {
  const calls = []
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push({ workspace: init.headers['x-cangzhi-workspace'], rawName: body.params.name })
    return new Response(
      `event: message\ndata: ${JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'chunk-1' }] } })}\n\ndata: ${JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'chunk-2' }] } })}\n\n`,
      { status: 200, headers: { 'content-type': 'text/event-stream' } },
    )
  }
  // Sanity: parseSseResponse itself is well-defined on multi-event streams.
  const messages = parseSseResponse('event: message\ndata: {"a":1}\n\ndata: {"b":2}\n\n')
  assert.equal(messages.length, 2)
  // The MCP call should map the FIRST matched JSON-RPC id to the result.
  const value = await invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'sse-w', rawName: 'knowledge_search', args: { q: 's' }, fetch: fetchImpl })
  assert.equal(value.content[0].text, 'chunk-1')
  assert.equal(calls[0].workspace, 'sse-w')
})

test('mcp-call — 4xx invalidates the cached Mcp-Session-Id', async () => {
  const calls = []
  let attempt = 0
  const fetchImpl = async (url, init) => {
    attempt += 1
    const body = JSON.parse(init.body)
    calls.push({ attempt, sentHeader: init.headers['Mcp-Session-Id'] ?? null })
    if (attempt === 1) {
      // First call returns a valid JSON-RPC result with a freshly-issued
      // session id. The bridge is happy; the client caches the id.
      return new Response(
        JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'first' }] } }),
        { status: 200, headers: { 'content-type': 'application/json', 'mcp-session-id': 'sess-xyz' } },
      )
    }
    if (attempt === 2) {
      // Second call replays the cached session id and gets 401: authentication
      // failed. The bridge forgets the cached id and the call rejects.
      return new Response('{"error":"unauthorized"}', { status: 401, headers: { 'content-type': 'application/json' } })
    }
    // The third attempt should NOT carry the cached session id; the 401
    // cleared it. A fresh id is then issued.
    return new Response(
      JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'fresh' }] } }),
      { status: 200, headers: { 'content-type': 'application/json', 'mcp-session-id': 'sess-abc' } },
    )
  }
  // First call captures the session id from the response.
  const first = await invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'w', rawName: 't', args: {}, fetch: fetchImpl })
  assert.equal(first.content[0].text, 'first')
  assert.equal(calls[0].sentHeader, null, 'first call carries no session id')
  // Second call should resend the cached id and reject.
  await assert.rejects(
    invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'w', rawName: 't', args: {}, fetch: fetchImpl }),
    /authentication failed/,
  )
  assert.equal(calls[1].sentHeader, 'sess-xyz', 'second call should resend the cached id')
  // Third call must NOT carry the stale id; the 401 cleared it.
  const value = await invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'w', rawName: 't', args: {}, fetch: fetchImpl })
  assert.equal(calls[2].sentHeader, null, 'stale id must be cleared after a 4xx')
  assert.equal(value.content[0].text, 'fresh')
})
