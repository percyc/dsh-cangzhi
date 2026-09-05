/**
 * Pure helpers for the management console's adaptive refresh loop.
 *
 * The console polls two endpoints while the page is open:
 *   1. `documents/overview?include_processing=true` — used to surface
 *      per-document pipeline status and the running total.
 *   2. `system/status` — used to surface server-side processing counters.
 *
 * Neither request synchronises the model workspace and neither calls the
 * full `refresh()` that re-reads categories/workspaces, so external tasks
 * started from a different surface (e.g. another tab in the console or a
 * background worker) become visible without disturbing the user's current
 * selection. The cadence adapts to:
 *
 *   - active processing → poll every 3 seconds so the count and the rows
 *     update at near-realtime speed;
 *   - idle queue → poll every 15 seconds, which is still well below the
 *     time a real ingestion job takes to spin up;
 *   - hidden tab (document.visibilityState === 'hidden') → back off to
 *     60 seconds, matching the previous health-check cadence. The browser
 *     will throttle timers in hidden tabs anyway, so this is mostly a
 *     declarative cap;
 *   - transient HTTP failure → exponential back-off up to 30 seconds.
 *
 * Every helper is intentionally side-effect free so it can be exercised
 * by `node --test` without a DOM, React, or a fetch implementation.
 */

export const REFRESH_INTERVAL_ACTIVE_MS = 3_000
export const REFRESH_INTERVAL_IDLE_MS = 15_000
export const REFRESH_INTERVAL_HIDDEN_MS = 60_000
export const REFRESH_FAILURE_BASE_MS = 5_000
export const REFRESH_FAILURE_MAX_MS = 30_000
export const REFRESH_FAILURE_MAX_ATTEMPTS = 4

export const OVERVIEW_DEFAULT_LIMIT = 200

/**
 * @typedef {Object} RefreshInput
 * @property {number} active        Documents currently reporting a `processing` job.
 * @property {number} waiting       Documents reporting `created` / `retry` only.
 * @property {boolean} [hidden]     Whether the hosting page is currently hidden.
 * @property {boolean} [hasFailure] Whether the last poll ended in an HTTP failure.
 * @property {number} [failureStreak] Consecutive failure count, used for back-off.
 */

export function hasRunningProcessing(input) {
  if (!input || typeof input !== 'object') return false
  const active = Number(input.active) || 0
  const waiting = Number(input.waiting) || 0
  return active > 0 || waiting > 0
}

export function resolveRefreshInterval(input) {
  if (!input || typeof input !== 'object') return REFRESH_INTERVAL_IDLE_MS
  if (input.hasFailure === true) {
    const streak = Math.max(0, Number(input.failureStreak) || 0)
    const cappedStreak = Math.min(streak, REFRESH_FAILURE_MAX_ATTEMPTS)
    const backoff = REFRESH_FAILURE_BASE_MS * Math.pow(2, cappedStreak)
    return Math.min(REFRESH_FAILURE_MAX_MS, Math.max(REFRESH_FAILURE_BASE_MS, backoff))
  }
  if (input.hidden === true) return REFRESH_INTERVAL_HIDDEN_MS
  if (hasRunningProcessing(input)) return REFRESH_INTERVAL_ACTIVE_MS
  return REFRESH_INTERVAL_IDLE_MS
}

/**
 * The lightweight refresh only fetches overview and system/status. The
 * full workspace refresh (categories, workspaces, current workspace) is
 * left to `refresh()` and the user-driven controls; the polling loop
 * must never call it because doing so would race with workspace switches
 * and reset the user's tab selection. `busy` is the full-refresh gate.
 */
export function shouldLightweightPoll(input) {
  if (!input || typeof input !== 'object') return false
  if (input.authenticated !== true) return false
  if (input.busy === true) return false
  if (input.unmounted === true) return false
  return true
}

/**
 * Merge a fresh `system/status` snapshot with the previous one. Only the
 * fields we actually consume are merged; everything else falls through so
 * the result type stays compatible with the existing UI.
 */
export function mergeSystemStatus(prev, next) {
  if (next === null || next === undefined) return prev
  if (prev === null || prev === undefined) return next
  return {
    ...prev,
    ...next,
    processing: {
      ...(prev.processing ?? {}),
      ...(next.processing ?? {}),
    },
  }
}

/**
 * Parse the `X-Total-Count` header into a non-negative integer. Anything
 * missing or malformed collapses to zero so the caller can fall back to
 * the response length.
 */
export function parseTotalCount(headers) {
  if (!headers || typeof headers.get !== 'function') return 0
  const raw = headers.get('x-total-count')
  if (raw === null || raw === undefined) return 0
  const parsed = Number.parseInt(String(raw), 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

/**
 * Decide whether an extra overview page is still needed.
 */
export function hasMoreOverviewPages({ offset, limit, total }) {
  const safeOffset = Math.max(0, Number(offset) || 0)
  const safeLimit = Math.max(0, Number(limit) || 0)
  const safeTotal = Math.max(0, Number(total) || 0)
  if (safeLimit === 0) return false
  return safeOffset < safeTotal
}

/**
 * Normalise the overview query string. The `include_processing=true`
 * flag is the single most important piece — without it the server drops
 * the pipeline status that the console relies on for the running count.
 */
export function buildOverviewParams({ workspace, limit = OVERVIEW_DEFAULT_LIMIT, offset = 0 } = {}) {
  const params = new URLSearchParams()
  params.set('limit', String(Math.max(1, limit)))
  params.set('offset', String(Math.max(0, offset)))
  params.set('include_processing', 'true')
  if (typeof workspace === 'string' && workspace.length > 0) {
    params.set('workspace', workspace)
  }
  return params
}

export const REFRESH_CONSTANTS = Object.freeze({
  REFRESH_INTERVAL_ACTIVE_MS,
  REFRESH_INTERVAL_IDLE_MS,
  REFRESH_INTERVAL_HIDDEN_MS,
  REFRESH_FAILURE_BASE_MS,
  REFRESH_FAILURE_MAX_MS,
  REFRESH_FAILURE_MAX_ATTEMPTS,
  OVERVIEW_DEFAULT_LIMIT,
})
