import assert from 'node:assert/strict'
import { test } from 'node:test'

import { checkStoredToken } from '../src/host/token-health.mjs'

const url = new URL('http://127.0.0.1:8000/api/v1/knowledge/scopes')

test('saved PAT is reused only after upstream validates it', async () => {
  const requests = []
  const result = await checkStoredToken(
    { resolve: async () => ({ value: 'private-token' }) }, 'CANGZHI_TOKEN', url, 'default',
    async (_url, init) => { requests.push(init); return { ok: true, status: 200 } },
  )
  assert.deepEqual(result, { configured: true, valid: true })
  assert.equal(requests.length, 1)
  assert.equal(requests[0].headers['x-cangzhi-workspace'], 'default')
  assert.equal(requests[0].headers.authorization, 'Bearer private-token')
  assert.ok(requests[0].signal)
})

test('missing and revoked PATs are reported without exposing their values', async () => {
  const missing = await checkStoredToken({ resolve: async () => undefined }, 'CANGZHI_TOKEN', url, 'default',
    async () => { throw new Error('should not fetch') })
  assert.deepEqual(missing, { configured: false, valid: false })
  const revoked = await checkStoredToken({ resolve: async () => ({ value: 'private-token' }) }, 'CANGZHI_TOKEN', url, 'default',
    async () => ({ ok: false, status: 401 }))
  assert.deepEqual(revoked, { configured: true, valid: false })
  assert.equal(JSON.stringify(revoked).includes('private-token'), false)
})

test('upstream failure is not mistaken for a revoked PAT', async () => {
  await assert.rejects(
    checkStoredToken({ resolve: async () => ({ value: 'private-token' }) }, 'CANGZHI_TOKEN', url, 'default',
      async () => ({ ok: false, status: 503 })),
    /HTTP 503/,
  )
})
