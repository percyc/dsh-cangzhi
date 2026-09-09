/**
 * One-leaf Cangzhi MCP `tools/call` over the plugin's own loopback proxy.
 *
 * The generic DSH MCP bridge (`cangzhi-mcp`) connects to the plugin's internal
 * proxy with a single, process-wide header set — it cannot express which
 * session the call belongs to. The per-session scoped tool override therefore
 * talks to the SAME loopback proxy itself, but annotates each request with the
 * workspace resolved for the executing session (`x-cangzhi-workspace`). The
 * proxy owns authentication (Bearer PAT is resolved Host-side and never reaches
 * the browser), so this module only needs to marshal the MCP `tools/call`
 * envelope and project the result. That keeps the tool schema, result shape and
 * cancellation semantics identical to the generic bridge.
 *
 * The default wall-clock bound per call is 120_000 ms, matching the Cangzhi
 * knowledge service's expected latency budget for `knowledge_ask` and dataset
 * queries. The DSH mcp-client's built-in default is 60_000 ms; the longer
 * bound here is the contract this plugin's overrides preserve. When the
 * caller supplies an `exec.signal` (the model's tool-run signal), the bound
 * is layered on top of that signal so a model-side cancellation still wins
 * over the wall-clock bound, and either aborting will tear down the in-flight
 * fetch.
 *
 * `fetch` is injectable for `node --test`; it defaults to the global fetch.
 */

/** Wall-clock bound for a single MCP `tools/call`; layered on top of `exec.signal`. */
export const DEFAULT_MCP_TIMEOUT_MS = 120_000

/** MCP protocol version pinned by the DSH mcp-client transport. */
export const MCP_PROTOCOL_VERSION = '2025-03-26'

/** JSON content type and accepted response kinds for a streamable-http POST. */
const ACCEPT_JSON_SSE = 'application/json, text/event-stream'

/**
 * Per-workspace MCP session ids so one-shot requests behave like a persistent
 * streamable-http connection. A real server may require an `Mcp-Session-Id`;
 * we mirror the SDK by storing the one the proxy returns and resending it.
 */
const sessionIds = new Map()

/** Monotonic JSON-RPC id so the response can be matched to the request. */
let nextRequestId = 1

/** Keep a module scoped table observable only for diagnostics/tests. */
export function _mcpReservedForTest() {
  return { sessionIds, nextRequestId }
}

/** Extract the raw MCP tool name from a public `mcp__cangzhi__<raw>` name. */
export function rawToolName(publicName, serverName = 'cangzhi') {
  const prefix = `mcp__${serverName}__`
  return publicName.startsWith(prefix) ? publicName.slice(prefix.length) : publicName
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Parse an `application/json` MCP JSON-RPC response body. */
function parseJsonResponse(body) {
  if (typeof body === 'string') {
    if (body.trim().length === 0) return undefined
    return JSON.parse(body)
  }
  return body
}

/**
 * Parse a streamable-http text/event-stream body into an array of SSE data
 * payloads, coalescing multi-line `data:` blocks.
 * @param {string} text - the SSE payload.
 * @returns {Array<unknown>} parsed JSON data payloads.
 */
export function parseSseResponse(text) {
  const messages = []
  let currentData = ''
  let currentEvent = ''
  const flush = () => {
    if (currentData.length === 0) return
    const trimmed = currentData.replace(/\n$/, '')
    try {
      messages.push(JSON.parse(trimmed))
    } catch {
      messages.push({ __raw: trimmed, __event: currentEvent })
    }
    currentData = ''
    currentEvent = ''
  }
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith(':')) continue
    if (line === '') {
      flush()
      continue
    }
    if (line.startsWith('event:')) {
      currentEvent = line.slice('event:'.length).trim()
      continue
    }
    if (line.startsWith('data:')) {
      currentData += `${line.slice('data:'.length).replace(/^ /, '')}\n`
      continue
    }
    // comment / unsupported fields are ignored
  }
  flush()
  return messages
}

/** Find the JSON-RPC result/error for a matched id across JSON and SSE payloads. */
function extractForId(payloads, id) {
  for (const payload of payloads) {
    if (!isRecord(payload)) continue
    if ('id' in payload && payload.id !== id) continue
    if ('result' in payload) return { kind: 'result', payload: payload.result }
    if ('error' in payload) return { kind: 'error', payload: payload.error }
  }
  return undefined
}

function responseTextToMessages(text, contentType) {
  if (contentType.includes('text/event-stream')) {
    return parseSseResponse(text)
  }
  const parsed = parseJsonResponse(text)
  return parsed === undefined ? [] : [parsed]
}

/**
 * Compose the in-flight AbortSignal: any signal the caller supplied is
 * respected (caller cancellation wins), and a wall-clock bound is layered on
 * top via a fresh controller. Either side aborting tears down the fetch and
 * the controller's timer is cleared so the process never leaks a hanging
 * timer.
 */
function composeSignal(callerSignal, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort(new DOMException('cangzhi MCP call exceeded the wall-clock bound', 'TimeoutError'))
  }, timeoutMs)
  const onCallerAbort = () => {
    controller.abort(callerSignal?.reason)
  }
  if (callerSignal?.aborted === true) {
    onCallerAbort()
  } else if (callerSignal !== undefined) {
    callerSignal.addEventListener('abort', onCallerAbort, { once: true })
  }
  return {
    signal: controller.signal,
    cancel: () => {
      clearTimeout(timer)
      if (callerSignal !== undefined && !callerSignal.aborted) {
        callerSignal.removeEventListener('abort', onCallerAbort)
      }
    },
  }
}

/**
 * Invoke one MCP `tools/call` through the plugin's loopback proxy with an
 * explicit workspace header.
 *
 * @param {object} options
 * @param {string} options.internalMcpBaseUrl - e.g. `http://127.0.0.1:3081`.
 * @param {string} options.workspace - resolved session workspace slug.
 * @param {string} options.rawName - raw MCP tool name (e.g. `knowledge_search`).
 * @param {Record<string, unknown>} options.args - parsed tool arguments.
 * @param {AbortSignal} [options.signal] - caller cancellation signal.
 * @param {number} [options.timeoutMs=DEFAULT_MCP_TIMEOUT_MS] - wall-clock bound.
 * @param {typeof fetch} [options.fetch] - fetch implementation (injectable).
 * @returns {Promise<{content: unknown[], structuredContent?: unknown}>}
 *   the canonical MCP result value, matching the generic bridge's shape.
 */
export async function invokeCangzhiMcp({ internalMcpBaseUrl, workspace, rawName, args, signal, timeoutMs = DEFAULT_MCP_TIMEOUT_MS, fetch: fetchImpl = globalThis.fetch }) {
  const id = nextRequestId++
  const request = {
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: { name: rawName, arguments: args ?? {} },
  }
  const headers = {
    'content-type': 'application/json',
    accept: ACCEPT_JSON_SSE,
    'mcp-protocol-version': MCP_PROTOCOL_VERSION,
    'x-cangzhi-workspace': workspace,
  }
  const sessionId = sessionIds.get(workspace)
  if (sessionId !== undefined) headers['Mcp-Session-Id'] = sessionId

  const base = internalMcpBaseUrl.replace(/\/$/, '')
  const composed = composeSignal(signal, timeoutMs)
  let response
  let text
  try {
    response = await fetchImpl(`${base}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: composed.signal,
    })
    // Keep the wall-clock/caller signal active until the response body is
    // completely consumed. `fetch()` resolves as soon as headers arrive; an
    // SSE body can otherwise stall forever after that point.
    text = await response.text()
  } finally {
    composed.cancel()
  }

  const contentType = String(response.headers.get('content-type') ?? 'application/json')

  if (!response.ok) {
    // Any 4xx/5xx invalidates the cached session id: the streamable session
    // is gone and a stale id would only ever be re-rejected. Forget the id
    // before the error propagates so the next call opens a fresh session.
    sessionIds.delete(workspace)
    if (response.status === 401 || response.status === 403) {
      throw new Error(`cangzhi MCP authentication failed (HTTP ${String(response.status)}); check CANGZHI_TOKEN`)
    }
    throw new Error(`cangzhi MCP call failed (HTTP ${String(response.status)})`)
  }

  // The proxy may start a session on the first request; remember it so the
  // next call for this workspace continues the same streamable session.
  const newSessionId = response.headers.get('mcp-session-id')
  if (newSessionId) sessionIds.set(workspace, newSessionId)
  else sessionIds.delete(workspace)

  const matched = extractForId(responseTextToMessages(text, contentType), id)
  if (matched === undefined) {
    throw new Error('cangzhi MCP call returned no matching result')
  }
  if (matched.kind === 'error') {
    const message = typeof matched.payload?.message === 'string'
      ? matched.payload.message
      : 'cangzhi MCP tool error'
    throw new Error(message)
  }
  const result = matched.payload
  if (!isRecord(result)) {
    throw new Error('cangzhi MCP call returned a malformed result')
  }
  const content = Array.isArray(result.content) ? result.content : []
  if (result.isError === true) {
    const textValue = content
      .map(block => isRecord(block) && typeof block.text === 'string' ? block.text : '')
      .join('\n')
    throw new Error(textValue || 'cangzhi MCP tool returned an error')
  }
  const value = { content }
  if (result.structuredContent !== undefined) value.structuredContent = result.structuredContent
  return value
}

/** Drop any cached session id for a workspace (used on a 4xx/5xx reset). */
export function forgetMcpSession(workspace) {
  sessionIds.delete(workspace)
}
