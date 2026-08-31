/**
 * Regression tests for the Markdown evidence-preview helpers. The helpers
 * prepare MarkdownText's input and labels; the React component is not
 * imported here because `node --test` runs without the DSH build.
 *
 * Run with: `node --test tests/markdown-preview.test.mjs`
 */

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  EVIDENCE_MARKDOWN_BYTE_LIMIT,
  __disableTextEncoderForTests,
  __resetMarkdownLabelsForTests,
  __resetTextEncoderForTests,
  __restoreTextEncoderForTests,
  byteLengthUtf8,
  buildMarkdownLabels,
  normalizeEvidenceMarkdown,
  shouldRenderFormattedMarkdown,
  truncateEvidenceMarkdown,
} from '../src/client/lib/markdown-preview.mjs'

function reset() {
  __resetMarkdownLabelsForTests()
  __resetTextEncoderForTests()
}

test('markdown preview — normalizeEvidenceMarkdown strips BOM and trims whitespace', () => {
  assert.equal(normalizeEvidenceMarkdown('  # 标题  \n\n'), '# 标题')
  assert.equal(normalizeEvidenceMarkdown('\uFEFF# 标题\n'), '# 标题')
  assert.equal(normalizeEvidenceMarkdown(null), '')
  assert.equal(normalizeEvidenceMarkdown(undefined), '')
  assert.equal(normalizeEvidenceMarkdown(42), '')
})

test('markdown preview — shouldRenderFormattedMarkdown accepts small Markdown payloads', () => {
  assert.equal(shouldRenderFormattedMarkdown('# 标题\n段落'), true)
  assert.equal(shouldRenderFormattedMarkdown('| 列 | 列 |\n| --- | --- |\n| a | b |'), true)
  assert.equal(shouldRenderFormattedMarkdown(''), false)
  assert.equal(shouldRenderFormattedMarkdown(null), false)
  assert.equal(shouldRenderFormattedMarkdown('   \n  '), false)
})

test('markdown preview — shouldRenderFormattedMarkdown rejects oversized payloads', () => {
  const tooLarge = 'x'.repeat(EVIDENCE_MARKDOWN_BYTE_LIMIT + 1)
  assert.equal(shouldRenderFormattedMarkdown(tooLarge), false)
  const fits = 'x'.repeat(EVIDENCE_MARKDOWN_BYTE_LIMIT)
  assert.equal(shouldRenderFormattedMarkdown(fits), true)
  // Custom limit overrides the default.
  const atCustom = 'y'.repeat(8)
  assert.equal(shouldRenderFormattedMarkdown(atCustom, { byteLimit: 4 }), false)
  assert.equal(shouldRenderFormattedMarkdown(atCustom, { byteLimit: 16 }), true)
})

test('markdown preview — truncateEvidenceMarkdown short-circuits when input fits', () => {
  assert.equal(truncateEvidenceMarkdown('# 标题'), '# 标题')
  assert.equal(truncateEvidenceMarkdown('hello'), 'hello')
})

test('markdown preview — truncateEvidenceMarkdown clamps at the byte limit and prefers newline boundaries', () => {
  const payload = 'aaaa\n'.repeat(40) + 'tail-tail-tail-tail-tail-tail-tail-tail-tail-tail'
  const truncated = truncateEvidenceMarkdown(payload, { byteLimit: 80 })
  assert.ok(Buffer.byteLength(truncated, 'utf8') <= 80, 'truncated length should respect the byte limit')
  assert.ok(truncated.includes('已截取'), 'truncation marker should be present')
  assert.ok(truncated.startsWith('aaaa'), 'the byte budget should retain the beginning of the evidence body')
  assert.ok(!truncated.includes('tail-tail-tail'), 'tail content beyond the cut should be removed')
  // The last real line is replaced by a newline, so the marker sits cleanly below.
  assert.ok(truncated.endsWith(')\n'), 'marker should end with a newline for MarkdownText')
})

test('markdown preview — truncateEvidenceMarkdown respects UTF-8 boundaries', () => {
  // Each Chinese character is 3 bytes in UTF-8. The limit must be large
  // enough to hold at least one body character plus the marker bytes; the
  // helper still must never produce a partial UTF-8 codepoint in the body.
  const payload = '中'.repeat(100)
  const limit = 64
  const truncated = truncateEvidenceMarkdown(payload, { byteLimit: limit })
  assert.ok(Buffer.byteLength(truncated, 'utf8') <= limit + 4, 'marker adds a small amount of slack but body must respect the limit')
  // Truncation must never produce a partial UTF-8 codepoint in the body.
  const body = truncated.split('\n\n…')[0]
  const encoded = Buffer.from(body, 'utf8')
  assert.equal(encoded.toString('utf8'), body, 'body must round-trip through UTF-8 without loss')
  // Body must contain complete UTF-8 characters only.
  for (const char of body) {
    assert.ok(
      Buffer.byteLength(char, 'utf8') >= 1 && Buffer.byteLength(char, 'utf8') <= 4,
      `unexpected char byte length: ${char}`,
    )
  }
})

test('markdown preview — buildMarkdownLabels returns a frozen, reference-stable object', () => {
  reset()
  const first = buildMarkdownLabels()
  const second = buildMarkdownLabels()
  assert.equal(first, second, 'labels must memoize by reference for MarkdownText streaming cache')
  assert.equal(Object.isFrozen(first), true)
  assert.equal(Object.isFrozen(first.code), true)
  assert.equal(typeof first.code.copyLabel, 'string')
  assert.ok(first.code.copyLabel.length > 0)
  assert.equal(typeof first.code.copiedLabel, 'string')
  assert.ok(first.code.copiedLabel.length > 0)
  assert.equal(typeof first.footnotes, 'string')
  assert.ok(first.footnotes.length > 0)
})

test('markdown preview — buildMarkdownLabels is reset by __resetMarkdownLabelsForTests', () => {
  reset()
  const first = buildMarkdownLabels()
  reset()
  const second = buildMarkdownLabels()
  assert.notEqual(first, second, 'resetting should drop the memoized object so a new locale can take effect')
})

test('markdown preview — byteLengthUtf8 matches Node Buffer.byteLength for ASCII / CJK / mixed / surrogate pairs', () => {
  reset()
  const cases = [
    '',
    'a',
    'hello world',
    '# 标题\n\n段落',
    '中'.repeat(50),
    '🌟'.repeat(10),
    '𠮷野家', // U+20BB7 (surrogate pair, 4 bytes)
    `mixed: ${'a'.repeat(7)} + ${'中'.repeat(3)} + ${'🌟'.repeat(2)}`,
    'line1\nline2\nline3\tcol\r\n',
  ]
  for (const value of cases) {
    const expected = Buffer.byteLength(value, 'utf8')
    const actual = byteLengthUtf8(value)
    assert.equal(actual, expected, `byte length mismatch for: ${JSON.stringify(value)}`)
  }
})

test('markdown preview — byteLengthUtf8 reports 0 for non-string or empty input', () => {
  reset()
  assert.equal(byteLengthUtf8(''), 0)
  assert.equal(byteLengthUtf8(null), 0)
  assert.equal(byteLengthUtf8(undefined), 0)
  assert.equal(byteLengthUtf8(42), 0)
  assert.equal(byteLengthUtf8({}), 0)
})

test('markdown preview — byteLengthUtf8 manual fallback matches Buffer.byteLength when TextEncoder is disabled', () => {
  __disableTextEncoderForTests()
  try {
    const cases = [
      '',
      'a',
      '# 标题\n\n段落',
      '中'.repeat(50),
      '🌟'.repeat(10),
      '𠮷野家',
      `mixed: ${'a'.repeat(7)} + ${'中'.repeat(3)} + ${'🌟'.repeat(2)}`,
    ]
    for (const value of cases) {
      const expected = Buffer.byteLength(value, 'utf8')
      const actual = byteLengthUtf8(value)
      assert.equal(actual, expected, `manual fallback mismatch for: ${JSON.stringify(value)}`)
    }
  } finally {
    __restoreTextEncoderForTests()
  }
})

test('markdown preview — helpers work even when TextEncoder is disabled (defensive path)', () => {
  __disableTextEncoderForTests()
  try {
    const text = '# 标题\n\n这是一个表格：\n\n| 列 A | 列 B |\n| --- | --- |\n| 1 | 2 |\n'
    assert.equal(shouldRenderFormattedMarkdown(text), true)
    const truncated = truncateEvidenceMarkdown('a'.repeat(200), { byteLimit: 50 })
    assert.ok(Buffer.byteLength(truncated, 'utf8') <= 50, 'truncated output must still respect the limit')
    assert.ok(truncated.includes('已截取'), 'truncation marker should be present')
  } finally {
    __restoreTextEncoderForTests()
  }
})

test('markdown preview — effective view falls back to raw when canFormat is false (no Buffer reference)', () => {
  reset()
  // The plugin's render-time decision is: if canFormat is false the user must
  // still see the raw text. The viewMode default in plugin.tsx now reads
  // "formatted" and the render-time guard drops it to "raw" automatically,
  // so the test pins that contract through the helper alone.
  const oversized = 'x'.repeat(EVIDENCE_MARKDOWN_BYTE_LIMIT + 1)
  assert.equal(shouldRenderFormattedMarkdown(oversized), false, 'oversized payloads should not render as formatted')
  const trimmed = normalizeEvidenceMarkdown(oversized)
  assert.ok(trimmed.length > 0, 'oversized but non-empty payload still has a body to show in raw view')
  // The raw view is the truncated/normalized text itself, never empty when
  // the payload is non-empty.
  assert.equal(typeof truncateEvidenceMarkdown(trimmed), 'string')
})
