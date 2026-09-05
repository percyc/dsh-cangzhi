/**
 * Pure helpers for the Markdown evidence preview in the Cangzhi workbench.
 *
 * The DSH `MarkdownText` component (in `@deepseek-ai/dsh-client-ui-primitives`)
 * is the rendering engine: it parses CommonMark + GFM (and TeX math), allows
 * only `http(s)` / `mailto` link destinations, and renders raw HTML as
 * literal text so an untrusted evidence payload never reaches the DOM. The
 * helpers in this file prepare its inputs from the workbench payload and
 * provide a stable, reference-stable label object so the streaming parser's
 * memoization is preserved across re-renders.
 *
 * Kept dependency-free so `node --test` can import it directly without
 * touching the React tree or any DSH workspace package.
 */

/**
 * Count UTF-8 bytes of a JavaScript string. The workbench payload is measured
 * in bytes (not characters) so a runaway payload cannot exhaust the renderer;
 * we use {@link TextEncoder} on the standard global when present (every
 * modern browser and Node ≥ 11) and fall back to a hand-rolled counter that
 * follows RFC 3629, including the surrogate-pair rule, when the encoder is
 * missing. Exported so tests can pin the contract against the Node reference
 * implementation and so the workbench bundle never depends on `Buffer`.
 *
 * @param text - already-validated UTF-16 string.
 * @returns the number of UTF-8 bytes required to encode `text`.
 */
export function byteLengthUtf8(text) {
  if (typeof text !== 'string' || text.length === 0) return 0
  if (textEncoderSingleton !== null) {
    return textEncoderSingleton.encode(text).length
  }
  // Manual UTF-8 counter. Matches RFC 3629; never produces overlong forms
  // and treats surrogate pairs as a single 4-byte sequence.
  let bytes = 0
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const trail = text.charCodeAt(i + 1)
      if (trail >= 0xdc00 && trail <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (trail - 0xdc00)
        i += 1
        bytes += 4
        continue
      }
    }
    if (code < 0x80) bytes += 1
    else if (code < 0x800) bytes += 2
    else if (code < 0x10000) bytes += 3
    else bytes += 4
  }
  return bytes
}

let textEncoderSingleton = null
if (typeof TextEncoder !== 'undefined') {
  textEncoderSingleton = new TextEncoder()
}

/**
 * Reset the cached `TextEncoder` singleton; tests use it to force the
 * manual-counter fallback path so the contract is verified end-to-end.
 */
export function __resetTextEncoderForTests() {
  if (typeof TextEncoder !== 'undefined') {
    textEncoderSingleton = new TextEncoder()
  } else {
    textEncoderSingleton = null
  }
}

/** Force the manual UTF-8 counter; used by tests to exercise the fallback. */
export function __disableTextEncoderForTests() {
  textEncoderSingleton = null
}

/** Restore normal operation after `__disableTextEncoderForTests`. */
export function __restoreTextEncoderForTests() {
  if (typeof TextEncoder !== 'undefined') {
    textEncoderSingleton = new TextEncoder()
  }
}

/** Maximum number of bytes we will hand to MarkdownText from one evidence payload. */
export const EVIDENCE_MARKDOWN_BYTE_LIMIT = 64 * 1024

/**
 * Strip evidence-payload prefixes that occasionally wrap a Markdown string
 * (e.g. an MCP result that arrives as `\u0000` then JSON) and trim trailing
 * whitespace, but never rewrite inside the body — MarkdownText owns parsing.
 *
 * @param value - raw `context_markdown` from the evidence payload.
 * @returns the cleaned string, or an empty string when nothing renderable remains.
 */
export function normalizeEvidenceMarkdown(value) {
  if (typeof value !== 'string') return ''
  let text = value
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return text.trim()
}

/**
 * Decide whether the workbench should fall back to the snippet / raw text
 * path instead of routing the payload through MarkdownText. The renderer is
 * safe to call with arbitrary input, but very large or entirely non-Markdown
 * strings waste cycles and visually break inside the formatted view.
 *
 * @param text - normalized markdown text.
 * @param options - render-time knobs. `byteLimit` caps payload size; the
 * default matches {@link EVIDENCE_MARKDOWN_BYTE_LIMIT}.
 * @returns true when the payload should be rendered as formatted Markdown.
 */
export function shouldRenderFormattedMarkdown(text, options = {}) {
  if (typeof text !== 'string') return false
  const trimmed = text.trim()
  if (trimmed.length === 0) return false
  const limit = Number.isFinite(options.byteLimit) && options.byteLimit > 0
    ? Math.floor(options.byteLimit)
    : EVIDENCE_MARKDOWN_BYTE_LIMIT
  // The DSH parser measures characters, but UTF-8 byte length is the safe
  // proxy against memory pressure from a runaway payload.
  if (byteLengthUtf8(text) > limit) return false
  return true
}

/**
 * Clamp an evidence payload to {@link EVIDENCE_MARKDOWN_BYTE_LIMIT} and
 * annotate it with a truncation marker so the UI can show why the body
 * stops mid-sentence. The marker is itself valid Markdown (a horizontal
 * rule plus a labelled paragraph) so MarkdownText renders it consistently
 * with the rest of the document.
 *
 * @param text - normalized markdown text.
 * @param options.byteLimit - override the truncation threshold; default
 * 64 KiB matches {@link EVIDENCE_MARKDOWN_BYTE_LIMIT}.
 * @returns the original text when it fits, otherwise a truncated copy with
 * a trailing `…(已截取)` marker.
 */
export function truncateEvidenceMarkdown(text, options = {}) {
  if (typeof text !== 'string') return ''
  const limit = Number.isFinite(options.byteLimit) && options.byteLimit > 0
    ? Math.floor(options.byteLimit)
    : EVIDENCE_MARKDOWN_BYTE_LIMIT
  if (byteLengthUtf8(text) <= limit) return text
  // Compute the marker length so the body never pushes the total past the limit.
  const marker = `…(已截取，超过 ${limit} 字节)`
  const markerBlock = `\n\n${marker}\n`
  const bodyBudget = Math.max(0, limit - byteLengthUtf8(markerBlock))
  // Find the largest fitting UTF-16 slice in O(log n). The previous
  // character-by-character loop repeatedly encoded the whole prefix and
  // could freeze the UI for large tables before MarkdownText even rendered.
  let low = 0
  let high = text.length
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (byteLengthUtf8(text.slice(0, middle)) <= bodyBudget) low = middle
    else high = middle - 1
  }
  let end = low
  // Do not split a UTF-16 surrogate pair at the chosen boundary.
  if (end > 0 && end < text.length) {
    const leading = text.charCodeAt(end - 1)
    const trailing = text.charCodeAt(end)
    if (leading >= 0xd800 && leading <= 0xdbff && trailing >= 0xdc00 && trailing <= 0xdfff) end -= 1
  }
  // Prefer cutting on a newline so the trailing marker sits on its own line.
  const newline = text.lastIndexOf('\n', end)
  if (newline > end * 0.5) end = newline
  const body = text.slice(0, end).trimEnd()
  return `${body}${markerBlock}`
}

/**
 * Build the localized labels MarkdownText bakes into cached streaming
 * elements. The renderer only treats the object as a memoization key — the
 * strings only surface in copy-button tooltips and a footnote-section
 * heading — but a new identity per render would discard the streaming cache
 * mid-message, so callers must pass a stable reference (this module memoizes
 * the result).
 */
let cachedLabels = null
export function buildMarkdownLabels() {
  if (cachedLabels !== null) return cachedLabels
  cachedLabels = Object.freeze({
    code: Object.freeze({
      copyLabel: '复制代码',
      copiedLabel: '已复制',
    }),
    footnotes: '脚注',
  })
  return cachedLabels
}

/** Reset the memoized label object; tests use it to keep assertions stable. */
export function __resetMarkdownLabelsForTests() {
  cachedLabels = null
}
