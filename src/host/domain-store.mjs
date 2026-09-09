/**
 * Durable store adapter over a DSH storage-domain `KvTable`.
 *
 * `createDomainStore` is deliberately dependency-free: it turns a pair of
 * `KvTable`-shaped handles (each exposing synchronous `get`/`entries` and
 * durable async `put`/`delete`, both resolving only after the write lands on
 * the medium) into the store shape that `session-state.mjs` resolving helpers
 * consume. Reads stay synchronous from the domain's authoritative in-memory
 * view; writes await backend durability. This keeps the pure rules testable
 * with a tiny fake table and lets the Host wire the real storage-domain tables.
 *
 * An explicit record is only written when the caller supplies a non-empty
 * value; clearing a slot deletes the record so a later resolve can inherit an
 * ancestor's choice instead of being pinned by a stale value.
 */

/** Store name: must match the storage-domain UNBart_NAME_RE. */
export const SESSION_STATE_STORE_PREFIX = 'cangzhi_session'

/**
 * Build a store over two table handles.
 * @param {{workspaces: object, policies: object}} tables - table handles with
 *   `get(key)`, `entries()`, `put(key,value):Promise`, `delete(key):Promise`.
 * @returns a store matching `createMemoryStore`'s shape (writes return promises).
 */
export function createDomainStore(tables) {
  const workspaces = tables.workspaces
  const policies = tables.policies
  return {
    getWorkspace(id) {
      return workspaces.get(id)
    },
    setWorkspace(id, slug) {
      if (slug === undefined || slug === '') {
        return workspaces.delete(id).then(() => undefined)
      }
      return workspaces.put(id, slug)
    },
    hasWorkspace(id) {
      return workspaces.get(id) !== undefined
    },
    getPolicy(id) {
      return policies.get(id)
    },
    setPolicy(id, policy) {
      if (policy === undefined || policy === '') {
        return policies.delete(id).then(() => undefined)
      }
      return policies.put(id, policy)
    },
    entries() {
      return {
        workspaces: [...workspaces.entries()],
        policies: [...policies.entries()],
      }
    },
    /** Durability is the domain's job (writes already await the medium). */
    persist() {
      return Promise.resolve()
    },
    /** The domain preloads from the medium at open; nothing to hydrate. */
    load() {},
  }
}