/**
 * Regression tests for the "latest request wins" gate.
 *
 * These cover the helpers in `src/client/lib/latest-request.mjs` in
 * isolation. The helper depends only on the JS standard library, so
 * `node --test` is enough — no React, no fetch mock, no DOM.
 *
 * Run with: `node --test tests/latest-request.test.mjs`
 */

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { createLatestRequest } from '../src/client/lib/latest-request.mjs'

function assertThrowsAbortError(fn) {
  assert.throws(fn, (error) => {
    assert.equal(error.name, 'AbortError')
    return true
  })
}

test('a new request cancels the previous signal', () => {
  const latest = createLatestRequest()
  const first = latest.begin()
  assert.equal(first.isCurrent(), true)
  assert.equal(first.signal.aborted, false)

  const second = latest.begin()
  assert.equal(first.signal.aborted, true)
  assert.equal(second.signal.aborted, false)

  assert.equal(first.isCurrent(), false)
  assert.equal(second.isCurrent(), true)
})

test('an old task that completes late cannot commit', async () => {
  const latest = createLatestRequest()
  const first = latest.begin()
  const second = latest.begin()

  const staleBody = await asyncBody(() => 'old payload')
  assert.equal(staleBody, 'old payload')
  assertThrowsAbortError(() => first.assertCurrent())

  await asyncBody(() => second.assertCurrent())
})

test('invalidate cancels the current signal and expires the ticket', () => {
  const latest = createLatestRequest()
  const ticket = latest.begin()
  assert.equal(ticket.isCurrent(), true)

  latest.invalidate()
  assert.equal(ticket.signal.aborted, true)
  assert.equal(ticket.isCurrent(), false)
  assertThrowsAbortError(() => ticket.assertCurrent())
})

test('invalidate with no active request is a no-op', () => {
  const latest = createLatestRequest()
  assert.doesNotThrow(() => latest.invalidate())
})

test('begin works again after invalidate', () => {
  const latest = createLatestRequest()
  latest.invalidate()

  const ticket = latest.begin()
  assert.equal(ticket.isCurrent(), true)
  assert.equal(ticket.signal.aborted, false)
  assert.doesNotThrow(() => ticket.assertCurrent())
})

test('an expired ticket stays expired across subsequent requests', () => {
  const latest = createLatestRequest()
  const first = latest.begin()
  const second = latest.begin()
  const third = latest.begin()

  assert.equal(first.isCurrent(), false)
  assert.equal(second.isCurrent(), false)
  assert.equal(third.isCurrent(), true)
  assertThrowsAbortError(() => first.assertCurrent())
  assertThrowsAbortError(() => second.assertCurrent())
  assert.doesNotThrow(() => third.assertCurrent())
})

test('async body parse finishes -> assertCurrent rejects for a stale ticket', async () => {
  const latest = createLatestRequest()
  const ticket = latest.begin()

  const settle = asyncBody(() => {
    ticket.assertCurrent()
    return 'parsed-body'
  })

  latest.invalidate()

  await assert.rejects(async () => {
    await settle
  }, (error) => {
    assert.equal(error.name, 'AbortError')
    return true
  })
})

async function asyncBody(work) {
  await new Promise((resolve) => setTimeout(resolve, 2))
  return work()
}