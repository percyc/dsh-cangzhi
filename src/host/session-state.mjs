/**
 * Pure session-scoped knowledge workspace & capability policy.
 *
 * This module owns every DECISION about which Cangzhi workspace a given DSH
 * session must use and whether the session may call Cangzhi tools at all. It is
 * deliberately dependency-free so `node --test` can exercise the isolation,
 * parent/child inheritance and no-sessionId degradation rules without a live
 * DSH, React, or MCP stack.
 *
 * The store is a plain key→value map: `workspaces: Map<sessionId, slug>` and
 * `policies: Map<sessionId, 'on'|'off'>`. Only an *explicit* per-session value
 * is persisted; every other read is resolved by walking up the parent chain and
 * finally falling back to the process default. That is what makes parent→child
 * inheritance correct by construction (a child inherits a parent's choice until
 * it pins its own) while keeping child→parent isolation (a child pin never
 * affects its parent or siblings).
 *
 * The resolution result returns `bound: boolean`. `bound: true` means the
 * workspace came from a session-scoped binding (the session or one of its
 * ancestors). `bound: false` means we fell back to the process-global default,
 * i.e. a degraded mode that MUST NOT be presented as "session isolation".
 *
 * Persistence is NOT this module's job: callers inject a store (memory in
 * tests, a durable file/DSH-backed adapter in the Host) and this module only
 * reads/writes it. `serializeState` / `deserializeState` provide a lossless
 * round-trip for callers that want an on-disk snapshot.
 */

/** Durable format version stamped onto persisted snapshots. */
export const SESSION_STATE_VERSION = 1

export const POLICY_VALUES = Object.freeze(['on', 'off'])

/** Default capability policy when no session, ancestor, or stored value exists. */
export const DEFAULT_POLICY = 'on'

/** Is a value a valid knowledge capability policy? */
export function isPolicy(value) {
  return (POLICY_VALUES).includes(value)
}

/** Is a value a plausible workspace slug? (mirrors the Host's slug rule) */
export function isWorkspaceSlug(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value)
}

/**
 * Create an in-memory store. The returned object is the shape every adapter
 * satisfies; production may attach durable read/write underneath it.
 */
export function createMemoryStore() {
  const workspaces = new Map()
  const policies = new Map()
  return {
    getWorkspace(id) {
      return workspaces.get(id)
    },
    setWorkspace(id, slug) {
      if (slug === undefined || slug === '') {
        workspaces.delete(id)
      } else {
        workspaces.set(id, slug)
      }
    },
    hasWorkspace(id) {
      return workspaces.has(id)
    },
    getPolicy(id) {
      return policies.get(id)
    },
    setPolicy(id, policy) {
      if (policy === undefined || policy === '') {
        policies.delete(id)
      } else {
        policies.set(id, policy)
      }
    },
    /** Snapshot for persistence. */
    entries() {
      return { workspaces: [...workspaces.entries()], policies: [...policies.entries()] }
    },
    load(source) {
      for (const [id, slug] of source?.workspaces ?? []) {
        if (isWorkspaceSlug(slug)) workspaces.set(id, slug)
      }
      for (const [id, policy] of source?.policies ?? []) {
        if (isPolicy(policy)) policies.set(id, policy)
      }
    },
    clear() {
      workspaces.clear()
      policies.clear()
    },
  }
}

/**
 * Walk from `id` up the parent chain. Returns the nearest explicit stored value
 * for the key accessor, or `undefined` when no session in the chain pinned one.
 * The chain is read through the injected `parentOf` callback so this module
 * never reaches into DSH agent internals (tests stub it with a simple map).
 */
export function firstExplicitInChain(store, id, accessor, parentOf) {
  let current = id
  const seen = new Set()
  while (current !== undefined && current !== null && !seen.has(current)) {
    seen.add(current)
    const value = accessor(current)
    if (value !== undefined) return { value, source: current }
    current = parentOf(current)
  }
  return undefined
}

/**
 * Resolve the effective workspace for a session.
 *
 * @param {object} store - store with getWorkspace/hasWorkspace.
 * @param {string} id - the executing session id (exec.agent.id).
 * @param {object} options
 * @param {(id:string)=>string|undefined} options.parentOf - parent session id.
 * @param {string} options.defaultWorkspace - process-global fallback slug.
 * @returns {{ workspace:string, bound:boolean, source?:string }}
 *   `bound:true` when the value is session-scoped; `bound:false` means it is
 *   the process default (degraded, not isolated).
 */
export function resolveWorkspace(store, id, { parentOf, defaultWorkspace }) {
  const found = firstExplicitInChain(store, id, store.getWorkspace, parentOf)
  if (found === undefined) {
    return { workspace: defaultWorkspace, bound: false }
  }
  return { workspace: found.value, bound: true, source: found.source }
}

/**
 * Resolve the effective capability policy for a session. Falling back to a
 * parent's stored policy is correct only for policy "off" (a parent that turned
 * off the capability should not have an unconfigured child silently re-enable
 * the tools); a parent that left its child unconfigured also leaves it to the
 * process default.
 */
export function resolvePolicy(store, id, { parentOf }) {
  const found = firstExplicitInChain(store, id, store.getPolicy, parentOf)
  if (found === undefined) return { policy: DEFAULT_POLICY, bound: false }
  return { policy: found.value, bound: true, source: found.source }
}

/**
 * Serialize the store to a lossless, versioned JSON doc for durable snapshots.
 * @param {object} store - store with `.entries()`.
 * @returns {object} a JSON-serializable snapshot.
 */
export function serializeState(store) {
  const { workspaces, policies } = store.entries()
  return {
    version: SESSION_STATE_VERSION,
    workspaces: workspaces.map(([id, slug]) => [String(id), slug]),
    policies: policies.map(([id, policy]) => [String(id), policy]),
  }
}

/**
 * Load a serialized snapshot (from {@link serializeState}) into a fresh store,
 * tolerating absent/older shapes. Invalid records are skipped, never thrown.
 * @param {unknown} doc - raw JSON value.
 * @returns {object} a store populated from the snapshot.
 */
export function deserializeState(doc) {
  const store = createMemoryStore()
  if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) return store
  const source = {
    workspaces: Array.isArray(doc.workspaces) ? doc.workspaces : [],
    policies: Array.isArray(doc.policies) ? doc.policies : [],
  }
  store.load(source)
  return store
}