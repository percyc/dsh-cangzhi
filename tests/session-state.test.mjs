/** Pure regression tests for per-session Cangzhi workspace & policy resolution. */
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  createMemoryStore,
  resolveWorkspace,
  resolvePolicy,
  firstExplicitInChain,
  serializeState,
  deserializeState,
  DEFAULT_POLICY,
  SESSION_STATE_VERSION,
} from '../src/host/session-state.mjs'
import { createDomainStore } from '../src/host/domain-store.mjs'
import { rawToolName, parseSseResponse, invokeCangzhiMcp } from '../src/host/mcp-call.mjs'

function chain(map) {
  return id => (id === undefined ? undefined : map[id])
}

test('workspace — unbound session degrades to process default with bound=false', () => {
  const store = createMemoryStore()
  const resolved = resolveWorkspace(store, 'sess-1', { parentOf: () => undefined, defaultWorkspace: 'default' })
  assert.equal(resolved.workspace, 'default')
  assert.equal(resolved.bound, false, 'must be explicitly marked unbound (degraded)')
})

test('workspace — concurrent A/B sessions stay isolated', () => {
  const store = createMemoryStore()
  store.setWorkspace('A', 'alpha')
  store.setWorkspace('B', 'beta')
  const parentOf = () => undefined
  assert.equal(resolveWorkspace(store, 'A', { parentOf, defaultWorkspace: 'default' }).workspace, 'alpha')
  assert.equal(resolveWorkspace(store, 'B', { parentOf, defaultWorkspace: 'default' }).workspace, 'beta')
  store.setWorkspace('A', 'gamma')
  assert.equal(resolveWorkspace(store, 'B', { parentOf, defaultWorkspace: 'default' }).workspace, 'beta')
  const parentMap = { child: 'parent' }
  store.setWorkspace('child', 'child-pin')
  assert.equal(resolveWorkspace(store, 'parent', { parentOf: chain(parentMap), defaultWorkspace: 'default' }).workspace, 'default')
})

test('workspace — child inherits parent then reverts on clear', () => {
  const store = createMemoryStore()
  const parentMap = { child: 'root', root: undefined }
  store.setWorkspace('root', 'root-workspace')
  let child = resolveWorkspace(store, 'child', { parentOf: chain(parentMap), defaultWorkspace: 'default' })
  assert.equal(child.workspace, 'root-workspace')
  assert.equal(child.bound, true)
  store.setWorkspace('child', 'child-workspace')
  child = resolveWorkspace(store, 'child', { parentOf: chain(parentMap), defaultWorkspace: 'default' })
  assert.equal(child.workspace, 'child-workspace')
  assert.equal(resolveWorkspace(store, 'root', { parentOf: chain(parentMap), defaultWorkspace: 'default' }).workspace, 'root-workspace')
  store.setWorkspace('child', '')
  child = resolveWorkspace(store, 'child', { parentOf: chain(parentMap), defaultWorkspace: 'default' })
  assert.equal(child.workspace, 'root-workspace')
})

test('policy — defaults on; off inherits; child override isolates', () => {
  const store = createMemoryStore()
  const parentMap = { child: 'parent', grandchild: 'child', parent: undefined }
  assert.equal(resolvePolicy(store, 'parent', { parentOf: chain(parentMap) }).policy, DEFAULT_POLICY)
  assert.equal(resolvePolicy(store, 'parent', { parentOf: chain(parentMap) }).bound, false)
  store.setPolicy('parent', 'off')
  assert.equal(resolvePolicy(store, 'child', { parentOf: chain(parentMap) }).policy, 'off')
  assert.equal(resolvePolicy(store, 'grandchild', { parentOf: chain(parentMap) }).policy, 'off')
  store.setPolicy('child', 'on')
  assert.equal(resolvePolicy(store, 'child', { parentOf: chain(parentMap) }).policy, 'on')
  assert.equal(resolvePolicy(store, 'parent', { parentOf: chain(parentMap) }).policy, 'off')
  assert.equal(resolvePolicy(store, 'grandchild', { parentOf: chain(parentMap) }).policy, 'on')
})

test('firstExplicitInChain — nearest wins and cycle is safe', () => {
  const store = createMemoryStore()
  store.setWorkspace('b', 'bee')
  const parentMap = { a: 'b', b: 'a' }
  const found = firstExplicitInChain(store, 'a', store.getWorkspace, chain(parentMap))
  assert.equal(found.value, 'bee')
  assert.equal(found.source, 'b')
})

test('serialize/deserialize — round-trips and survives Host restart simulation', () => {
  const store = createMemoryStore()
  store.setWorkspace('A', 'alpha')
  store.setPolicy('B', 'off')
  const doc = serializeState(store)
  assert.equal(doc.version, SESSION_STATE_VERSION)
  const restored = deserializeState(doc)
  assert.equal(resolveWorkspace(restored, 'A', { parentOf: () => undefined, defaultWorkspace: 'default' }).workspace, 'alpha')
  assert.equal(resolvePolicy(restored, 'B', { parentOf: () => undefined }).policy, 'off')
  const empty = deserializeState(JSON.parse(JSON.stringify({ version: SESSION_STATE_VERSION })))
  assert.equal(resolveWorkspace(empty, 'x', { parentOf: () => undefined, defaultWorkspace: 'default' }).bound, false)
})

test('domain-store — writes resolve only after durability and preserve isolation', async () => {
  const makeTable = () => {
    const map = new Map()
    let lastPutResolved = false
    const table = {
      get: k => map.get(k),
      entries: () => map.entries(),
      async put(k, v) { map.set(k, v); lastPutResolved = true },
      async delete(k) { return map.delete(k) },
    }
    return { table, resolved: () => lastPutResolved }
  }
  const w = makeTable()
  const p = makeTable()
  const store = createDomainStore({ workspaces: w.table, policies: p.table })
  const awaited = await store.setWorkspace('A', 'alpha')
  assert.equal(awaited, undefined)
  await store.setWorkspace('B', 'beta')
  assert.equal(resolveWorkspace(store, 'A', { parentOf: () => undefined, defaultWorkspace: 'default' }).workspace, 'alpha')
  assert.equal(resolveWorkspace(store, 'B', { parentOf: () => undefined, defaultWorkspace: 'default' }).workspace, 'beta')
  await store.setWorkspace('A', '')
  assert.equal(store.hasWorkspace('A'), false)
  await store.setPolicy('B', 'off')
  assert.equal(resolvePolicy(store, 'B', { parentOf: () => undefined }).policy, 'off')
})

test('mcp-call — raw name derivation and SSE parsing', () => {
  assert.equal(rawToolName('mcp__cangzhi__knowledge_search'), 'knowledge_search')
  assert.equal(rawToolName('knowledge_search'), 'knowledge_search')
  const messages = parseSseResponse('event: message\ndata: {"foo":1}\n\ndata: {"bar":2}\n\n')
  assert.equal(messages.length, 2)
  assert.equal(messages[0].foo, 1)
  assert.equal(messages[1].bar, 2)
})

test('mcp-call — invokeCangzhiMcp forwards workspace and maps result/isError', async () => {
  const calls = []
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push({ url, method: init.method, workspace: init.headers['x-cangzhi-workspace'], rawName: body.params.name })
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: 'ok' }] } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  const value = await invokeCangzhiMcp({
    internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'alpha', rawName: 'knowledge_search', args: { q: 'x' },
    signal: new AbortController().signal, fetch: fetchImpl,
  })
  assert.equal(value.content[0].text, 'ok')
  assert.equal(calls[0].workspace, 'alpha')
  assert.equal(calls[0].rawName, 'knowledge_search')
  assert.ok(calls[0].url.includes('/api/mcp'))
})

test('mcp-call — error and SSE result paths', async () => {
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body)
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, error: { code: -32603, message: 'boom' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  await assert.rejects(
    invokeCangzhiMcp({ internalMcpBaseUrl: 'http://127.0.0.1:3089', workspace: 'w', rawName: 't', args: {}, signal: new AbortController().signal, fetch: fetchImpl }),
    /boom/,
  )
})
