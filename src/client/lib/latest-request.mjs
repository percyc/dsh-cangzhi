/**
 * "Latest request wins" gate for async client work.
 *
 * A management-console view often issues async fetches (body download,
 * pipeline refresh, token refreshes) where the user can move on to a newer
 * action before the older one settles. Committing the result of a stale
 * request races with the newer one and can clobber fresh state.
 *
 * `createLatestRequest()` holds a single logical "current" request scope.
 * Every `begin()` supersedes — and aborts — whatever scope was current
 * before it, and `invalidate()` expires the current scope without starting
 * a new one (used on unmount / navigation). A scope handed out by `begin()`
 * reports whether it is still the latest via `isCurrent()` and throws an
 * `AbortError` from `assertCurrent()` once it has been superseded, so
 * long-running `await` bodies can re-check before committing.
 *
 * Depends only on the standard library (`AbortController`,
 * `DOMException`), so it runs under plain `node --test` with no DOM.
 */

/**
 * Create a gate that keeps at most one async request "current".
 *
 * @returns {{
 *   begin: () => {{
 *     signal: AbortSignal,
 *     isCurrent: () => boolean,
 *     assertCurrent: () => void,
 *   }},
 *   invalidate: () => void,
 * }}
 */
export function createLatestRequest() {
  let current = null
  let generation = 0

  function invalidate() {
    const prev = current
    current = null
    generation += 1
    if (prev && prev.controller) prev.controller.abort()
  }

  function begin() {
    invalidate()
    const controller = new AbortController()
    const ticket = { controller }
    current = ticket
    return {
      signal: controller.signal,
      isCurrent: () => current === ticket,
      assertCurrent: () => {
        if (current !== ticket) {
          throw new DOMException('request superseded by a newer request', 'AbortError')
        }
      },
    }
  }

  return { begin, invalidate }
}