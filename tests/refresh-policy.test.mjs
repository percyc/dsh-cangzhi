/**
 * Pure-function regression tests for the management console refresh policy.
 *
 * These cover only the helpers in `src/client/lib/refresh-policy.mjs`:
 * the actual fetch loop is exercised by the DSH host when the console
 * is open. Keeping the policy pure means `node --test` is enough — no
 * React, no fetch mock, no DOM — and the tests stay stable even when
 * the surrounding component is refactored.
 *
 * Run with: `node --test tests/refresh-policy.test.mjs`
 */

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  REFRESH_CONSTANTS,
  REFRESH_FAILURE_BASE_MS,
  REFRESH_FAILURE_MAX_MS,
  REFRESH_INTERVAL_ACTIVE_MS,
  REFRESH_INTERVAL_HIDDEN_MS,
  REFRESH_INTERVAL_IDLE_MS,
  buildOverviewParams,
  hasMoreOverviewPages,
  hasRunningProcessing,
  mergeSystemStatus,
  parseTotalCount,
  resolveRefreshInterval,
  shouldLightweightPoll,
} from '../src/client/lib/refresh-policy.mjs'

test('resolveRefreshInterval — 3s while processing, 15s when idle', () => {
  assert.equal(resolveRefreshInterval({ active: 0, waiting: 0 }), REFRESH_INTERVAL_IDLE_MS)
  assert.equal(resolveRefreshInterval({ active: 1, waiting: 0 }), REFRESH_INTERVAL_ACTIVE_MS)
  assert.equal(resolveRefreshInterval({ active: 0, waiting: 3 }), REFRESH_INTERVAL_ACTIVE_MS)
  assert.equal(resolveRefreshInterval({ active: 2, waiting: 5 }), REFRESH_INTERVAL_ACTIVE_MS)
})

test('resolveRefreshInterval — hidden tab always throttles to the hidden cadence', () => {
  assert.equal(
    resolveRefreshInterval({ active: 0, waiting: 0, hidden: true }),
    REFRESH_INTERVAL_HIDDEN_MS,
  )
  // Even when something is processing, the hidden cadence wins so we
  // do not wake the tab every three seconds while the user is away.
  assert.equal(
    resolveRefreshInterval({ active: 4, waiting: 0, hidden: true }),
    REFRESH_INTERVAL_HIDDEN_MS,
  )
})

test('resolveRefreshInterval — exponential back-off on failure, capped at 30s', () => {
  assert.equal(
    resolveRefreshInterval({ active: 0, waiting: 0, hasFailure: true, failureStreak: 0 }),
    REFRESH_FAILURE_BASE_MS,
  )
  assert.equal(
    resolveRefreshInterval({ active: 0, waiting: 0, hasFailure: true, failureStreak: 1 }),
    REFRESH_FAILURE_BASE_MS * 2,
  )
  assert.equal(
    resolveRefreshInterval({ active: 0, waiting: 0, hasFailure: true, failureStreak: 2 }),
    REFRESH_FAILURE_BASE_MS * 4,
  )
  // The cap kicks in before the natural exponential series exceeds it.
  assert.equal(
    resolveRefreshInterval({ active: 0, waiting: 0, hasFailure: true, failureStreak: 10 }),
    REFRESH_FAILURE_MAX_MS,
  )
})

test('resolveRefreshInterval — accepts garbage without throwing', () => {
  assert.equal(resolveRefreshInterval(null), REFRESH_INTERVAL_IDLE_MS)
  assert.equal(resolveRefreshInterval(undefined), REFRESH_INTERVAL_IDLE_MS)
  // Non-numeric processing counts collapse to zero, so this returns the
  // idle cadence rather than crashing the loop.
  assert.equal(resolveRefreshInterval({ active: 'soon' }), REFRESH_INTERVAL_IDLE_MS)
})

test('hasRunningProcessing — treats zero/NaN/negative as idle', () => {
  assert.equal(hasRunningProcessing({ active: 0, waiting: 0 }), false)
  assert.equal(hasRunningProcessing({ active: 0, waiting: 4 }), true)
  assert.equal(hasRunningProcessing({ active: -1, waiting: 0 }), false)
  assert.equal(hasRunningProcessing({ active: Number.NaN, waiting: 0 }), false)
  assert.equal(hasRunningProcessing(null), false)
})

test('shouldLightweightPoll — only when authenticated and not unmounted', () => {
  assert.equal(shouldLightweightPoll({ authenticated: true }), true)
  assert.equal(shouldLightweightPoll({ authenticated: true, busy: true }), false)
  assert.equal(shouldLightweightPoll({ authenticated: false }), false)
  assert.equal(shouldLightweightPoll({ authenticated: true, unmounted: true }), false)
  assert.equal(shouldLightweightPoll({ authenticated: true, hidden: true }), true)
  // Hidden tabs still poll, just at the throttled cadence.
  assert.equal(shouldLightweightPoll(null), false)
})

test('mergeSystemStatus — prefers next snapshot, but keeps prev fallbacks', () => {
  const merged = mergeSystemStatus(
    { status: 'ok', uptime_seconds: 10, processing: { active: 1, waiting: 0, failed: 0 } },
    { status: 'ok', uptime_seconds: 25, processing: { active: 0, waiting: 0, failed: 0 } },
  )
  assert.equal(merged.uptime_seconds, 25)
  assert.equal(merged.processing.active, 0)
  // Failed count was not in the next payload, so the previous value sticks.
  assert.equal(merged.processing.failed, 0)
  assert.equal(mergeSystemStatus(null, null), null)
  assert.equal(mergeSystemStatus(null, { status: 'ok' }).status, 'ok')
  assert.equal(mergeSystemStatus({ status: 'ok' }, null).status, 'ok')
})

test('parseTotalCount — handles missing, malformed and zero headers', () => {
  const headers = {
    get(name) {
      if (name.toLowerCase() !== 'x-total-count') return null
      return '128'
    },
  }
  assert.equal(parseTotalCount(headers), 128)
  assert.equal(parseTotalCount({ get: () => null }), 0)
  assert.equal(parseTotalCount({ get: () => 'abc' }), 0)
  assert.equal(parseTotalCount({ get: () => '-1' }), 0)
  assert.equal(parseTotalCount(null), 0)
  assert.equal(parseTotalCount({}), 0)
})

test('hasMoreOverviewPages — stops at the X-Total-Count boundary', () => {
  assert.equal(hasMoreOverviewPages({ offset: 0, limit: 200, total: 250 }), true)
  assert.equal(hasMoreOverviewPages({ offset: 200, limit: 200, total: 250 }), true)
  assert.equal(hasMoreOverviewPages({ offset: 250, limit: 200, total: 250 }), false)
  assert.equal(hasMoreOverviewPages({ offset: 400, limit: 200, total: 250 }), false)
  // Total of 0 with a positive limit still means "no more pages".
  assert.equal(hasMoreOverviewPages({ offset: 0, limit: 200, total: 0 }), false)
  // Zero limit would loop forever; guard against it.
  assert.equal(hasMoreOverviewPages({ offset: 0, limit: 0, total: 100 }), false)
})

test('buildOverviewParams — always sends include_processing=true and the workspace', () => {
  const params = buildOverviewParams({ workspace: 'research', limit: 200, offset: 0 })
  assert.equal(params.get('limit'), '200')
  assert.equal(params.get('offset'), '0')
  assert.equal(params.get('include_processing'), 'true')
  assert.equal(params.get('workspace'), 'research')
})

test('buildOverviewParams — omits workspace when not provided', () => {
  const params = buildOverviewParams({ limit: 60, offset: 60 })
  assert.equal(params.get('workspace'), null)
  assert.equal(params.get('include_processing'), 'true')
})

test('buildOverviewParams — clamps negative/zero values to safe minimums', () => {
  const params = buildOverviewParams({ workspace: 'default', limit: 0, offset: -5 })
  assert.equal(params.get('limit'), '1')
  assert.equal(params.get('offset'), '0')
})

test('refresh-policy constants are exposed and frozen', () => {
  assert.equal(REFRESH_CONSTANTS.REFRESH_INTERVAL_ACTIVE_MS, 3_000)
  assert.equal(REFRESH_CONSTANTS.REFRESH_INTERVAL_IDLE_MS, 15_000)
  assert.equal(REFRESH_CONSTANTS.REFRESH_INTERVAL_HIDDEN_MS, 60_000)
  assert.equal(Object.isFrozen(REFRESH_CONSTANTS), true)
})
