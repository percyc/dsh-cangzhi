/** Check a saved retrieval PAT without exposing its value to the browser. */
export async function checkStoredToken(credentials, ref, validationUrl, workspace, fetcher = fetch) {
  const resolved = await credentials.resolve(ref)
  if (resolved === undefined) return { configured: false, valid: false }
  const response = await fetcher(validationUrl, {
    headers: {
      authorization: `Bearer ${resolved.value}`,
      'x-cangzhi-workspace': workspace,
    },
    signal: AbortSignal.timeout(5000),
  })
  if (response.status === 401 || response.status === 403) return { configured: true, valid: false }
  if (!response.ok) throw new Error(`藏知令牌校验失败（HTTP ${response.status}）`)
  return { configured: true, valid: true }
}
