/**
 * Per-session Cangzhi workspace + capability wiring over DSH agents.
 *
 * This is the DSH-coupled half of `session-state.mjs`: it turns a session's
 * resolved policy/workspace into real enforcement. For each live agent it
 * shadows the global `mcp__cangzhi__*` tools with SCOPED overrides whose
 * `execute` resolves the workspace for the EXECUTING session
 * (`exec.agent.id`, parent-inherited) at call time — so two concurrent A/B
 * sessions use their own workspace no matter when they were created, and a
 * workspace switch takes effect on the very next call.
 *
 * Race handling:
 * - agent created before the generic `cangzhi-mcp` bridge has registered tools
 *   (or before it reconnects) → the scoped overrides register with zero tools;
 *   a `tools/change` signature check re-points every live "on" session at the
 *   current global set the moment the bridge appears.
 * - global tools disappear (bridge down) → overrides are disposed for "on"
 *   sessions so a stale-schema tool can never execute; nothing falls back to
 *   the process-global workspace because once the bridge is down there are no
 *   tools to call, and once it returns the overrides re-register with the
 *   freshly resolved per-session workspace.
 *
 * All decisions come from `store` (a `session-state` store) with
 * `parentOf` walking live agents, so this module never ships a browser-side
 * security boundary.
 */

import { resolvePolicy, resolveWorkspace, DEFAULT_POLICY } from './session-state.mjs'
import { DEFAULT_MCP_TIMEOUT_MS, invokeCangzhiMcp } from './mcp-call.mjs'
import { rawToolName } from './mcp-call.mjs'
import { CANGZHI_TOOLS } from './tool-names.mjs'

/**
 * Build a session manager.
 * @param {object} opts
 * @param {object} opts.store - session-state store (memory or domain-backed).
 * @param {string} opts.defaultWorkspace - process-global fallback slug.
 * @param {string} opts.internalMcpBaseUrl - loopback proxy base, e.g. `http://127.0.0.1:3081`.
 * @param {object} opts.agentsFacade - `{ get(id), list() }` over live agents.
 * @param {object} opts.tools - the global `ctx.tools` used to copy schemas and
 *   to subscribe to `tools/change` (event wiring is done by the Host).
 * @param {typeof fetch} [opts.fetchImpl] - fetch for the MCP call (injectable).
 * @param {(...a:unknown[])=>void} [opts.log] - logger.
 * @returns a session manager handle.
 */
export function createSessionManager({ store, defaultWorkspace, internalMcpBaseUrl, agentsFacade, tools, fetchImpl, log = () => {} }) {
  const entries = new Map()
  const cangzhiTools = CANGZHI_TOOLS
  const definitionIds = new WeakMap()
  let nextDefinitionId = 1
  let lastSignature = ''

  const parentOf = (id) => {
    if (id === undefined) return undefined
    const agent = agentsFacade.get(id)
    return agent?.session?.header?.parentSession
  }

  const definitionId = (definition) => {
    if ((typeof definition !== 'object' || definition === null) && typeof definition !== 'function') return 'missing'
    let id = definitionIds.get(definition)
    if (id === undefined) {
      id = nextDefinitionId++
      definitionIds.set(definition, id)
    }
    return String(id)
  }

  const cangzhiSignature = () => cangzhiTools
    .map(name => [name, tools.get(name)])
    .filter(([, definition]) => definition !== undefined)
    .map(([name, definition]) => `${name}:${definitionId(definition)}`)
    .sort()
    .join(',')

  function registerRestriction(agent) {
    const deny = cangzhiTools.filter(name => tools.get(name) !== undefined)
    return deny.length === 0 ? () => {} : agent.ctx.tools.restrict({ deny })
  }

  function registerOverrides(agent) {
    const disposers = []
    try {
      for (const name of cangzhiTools) {
        const global = tools.get(name)
        if (global === undefined) continue
        const raw = rawToolName(name)
        const timeoutMs = global.timeoutMs ?? DEFAULT_MCP_TIMEOUT_MS
        const def = {
          name: global.name,
          description: global.description,
          parameters: global.parameters,
          output: global.output,
          timeoutMs,
          ...(typeof global.presentCall === 'function' ? { presentCall: global.presentCall } : {}),
          ...(typeof global.presentResult === 'function' ? { presentResult: global.presentResult } : {}),
          ...(typeof global.isConcurrencySafe === 'function' ? { isConcurrencySafe: global.isConcurrencySafe } : {}),
          execute: async (args, exec) => {
            const sessionId = exec?.agent?.id
            if (sessionId === undefined) {
              throw new Error('cangzhi: 无法确定执行会话，拒绝降级到进程级知识空间')
            }
            const { workspace } = resolveWorkspace(store, sessionId, { parentOf, defaultWorkspace })
            return invokeCangzhiMcp({ internalMcpBaseUrl, workspace, rawName: raw, args, signal: exec.signal, timeoutMs, fetch: fetchImpl })
          },
        }
        disposers.push(agent.ctx.tools.register(def))
      }
    } catch (error) {
      for (const dispose of disposers.reverse()) dispose()
      throw error
    }
    return {
      count: disposers.length,
      dispose: () => { for (const d of disposers) d() },
    }
  }

  function syncSession(agent) {
    const id = agent.id
    const prev = entries.get(id)
    const { policy } = resolvePolicy(store, id, { parentOf })
    if (prev !== undefined && prev.policy === policy) {
      // Policy unchanged. Keep overrides present-for-policy in sync with the
      // current global tool availability (idempotent; a no-op when aligned).
      if (policy === 'on' && !prev.overridesActive) {
        try {
          const r = registerOverrides(agent)
          prev.overridesActive = r.count > 0
          prev.disposeOverrides = r.dispose
        } catch (error) {
          log(`cangzhi: register overrides failed for ${String(id)}: ${String(error)}`)
        }
      }
      return
    }
    prev?.dispose?.()
    const entry = { id, agent, policy, overridesActive: false }
    entry.disposeRestriction = registerRestriction(agent)
    if (policy === 'on') {
      try {
        const r = registerOverrides(agent)
        entry.overridesActive = r.count > 0
        entry.disposeOverrides = r.dispose
      } catch (error) {
        log(`cangzhi: register overrides failed for ${String(id)}: ${String(error)}`)
      }
    } else {
      entry.disposePrompt = agent.ctx.systemPrompt.section({
        name: 'integration:cangzhi',
        order: 155,
        text: '',
      })
    }
    entry.dispose = () => {
      entry.disposePrompt?.()
      entry.disposeRestriction?.()
      entry.disposeOverrides?.()
    }
    entries.set(id, entry)
  }

  /** Re-point one session's fail-closed mask and optional overrides. */
  function resyncEntry(entry, agent) {
    entry.disposeOverrides?.()
    entry.disposeOverrides = undefined
    entry.overridesActive = false
    entry.disposeRestriction?.()
    entry.disposeRestriction = registerRestriction(agent)
    if (entry.policy !== 'on') return
    try {
      const r = registerOverrides(agent)
      entry.disposeOverrides = r.dispose
      entry.overridesActive = r.count > 0
    } catch (error) {
      log(`cangzhi: resync overrides failed for ${String(agent.id)}: ${String(error)}`)
    }
  }

  /** Called on every `tools/change`; only reacts when the cangzhi set changed. */
  function onToolsChange() {
    const sig = cangzhiSignature()
    if (sig === lastSignature) return
    lastSignature = sig
    for (const agent of agentsFacade.list()) {
      const entry = entries.get(agent.id)
      if (entry === undefined) continue
      resyncEntry(entry, agent)
    }
  }

  function onAgentCreated(agent) {
    // Refresh the signature once before registering overrides so a bridge that
    // appeared between the manager's construction and this agent's creation
    // is picked up even before the next `tools/change` event lands.
    onToolsChange()
    syncSession(agent)
  }

  function onAgentDisposed(agent) {
    const entry = entries.get(agent.id)
    entry?.dispose?.()
    entries.delete(agent.id)
  }

  function setWorkspace(id, slug) {
    // Destroying a pin (restoring inheritance) is an explicit empty value.
    if (slug === undefined || slug === null) {
      return Promise.resolve(store.setWorkspace(id, '')).then(() => true)
    }
    // Otherwise the value must be a valid slug so it never starts routing calls
    // to a bogus workspace.
    if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(slug)) {
      return Promise.resolve(false)
    }
    return Promise.resolve(store.setWorkspace(id, slug)).then(() => true)
  }

  function setPolicy(id, policy) {
    const normalized = policy === 'off' ? 'off' : policy === 'on' ? 'on' : undefined
    if (normalized === undefined) return Promise.resolve(false)
    return Promise.resolve(store.setPolicy(id, normalized)).then(() => {
      const agent = agentsFacade.get(id)
      if (agent !== undefined) syncSession(agent)
      // Descendants that pinned nothing inherit the change; unpinned descendants
      // re-resolve against the parent. Re-syncing all live sessions is idempotent.
      for (const candidate of agentsFacade.list()) syncSession(candidate)
      return true
    })
  }

  function resolveWorkspaceFor(id) {
    return resolveWorkspace(store, id, { parentOf, defaultWorkspace })
  }

  function resolvePolicyFor(id) {
    return resolvePolicy(store, id, { parentOf })
  }

  /** Snapshot live sessions with resolved workspace/policy for diagnostics/status. */
  function snapshot() {
    const out = {}
    for (const [id, entry] of entries) {
      const ws = resolveWorkspace(store, id, { parentOf, defaultWorkspace })
      const pol = entry.policy
      out[id] = { policy: pol, defaultedPolicy: pol === DEFAULT_POLICY, workspace: ws.workspace, bound: ws.bound, overridesActive: entry.overridesActive }
    }
    return out
  }

  function disposeAll() {
    for (const entry of entries.values()) entry.dispose?.()
    entries.clear()
  }

  return {
    onAgentCreated,
    onAgentDisposed,
    onToolsChange,
    setWorkspace,
    setPolicy,
    resolveWorkspaceFor,
    resolvePolicyFor,
    snapshot,
    disposeAll,
  }
}
