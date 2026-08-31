/**
 * Regression tests for the workbench size presets and the structured
 * evidence extractor. Both helpers are intentionally pure and dependency
 * free so they can be loaded directly by `node --test` without bundling
 * the React client.
 *
 * Run with: `node --test tests/workbench-and-evidence.test.mjs`
 */

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  WORKBENCH_FULLSCREEN_MAX,
  WORKBENCH_SIZE_MAX,
  WORKBENCH_SIZE_MIN,
  WORKBENCH_SIZE_TABLE,
  WORKBENCH_SIZES,
  clampWorkbenchWidth,
  detectWorkbenchSize,
  isWorkbenchSize,
  readWorkbenchFullscreenFromStorage,
  readWorkbenchInitialState,
  readWorkbenchSizeFromStorage,
  readWorkbenchWidthFromStorage,
  sizeGlyph,
  sizeLabel,
} from '../src/client/lib/workbench-size.mjs'
import {
  answerEvidence,
  collectStructuredEvidence,
  dedupeEvidenceLinks,
  fallbackAnswerEvidence,
  formatEvidenceLink,
  idNumber,
} from '../src/client/lib/evidence.mjs'

function makeStorage(values) {
  const map = new Map(Object.entries(values))
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null },
    setItem(key, value) { map.set(key, String(value)) },
  }
}

test('workbench size — table covers the legacy 360..760 range with three named presets', () => {
  for (const size of WORKBENCH_SIZES) {
    const width = WORKBENCH_SIZE_TABLE[size]
    assert.ok(width >= WORKBENCH_SIZE_MIN, `${size} preset is below the legacy min`)
    assert.ok(width <= WORKBENCH_SIZE_MAX, `${size} preset is above the legacy max`)
    assert.ok(detectWorkbenchSize(width) === size, `detectWorkbenchSize should pick ${size} for ${width}`)
  }
  assert.ok(WORKBENCH_FULLSCREEN_MAX > WORKBENCH_SIZE_MAX, 'fullscreen cap must exceed standard width cap so the toggle is visible')
})

test('workbench size — labels and glyphs cover every preset', () => {
  for (const size of WORKBENCH_SIZES) {
    assert.ok(sizeLabel(size).length > 0, `label for ${size} is empty`)
    assert.ok(sizeGlyph(size).length > 0, `glyph for ${size} is empty`)
  }
  assert.equal(sizeLabel('narrow'), '窄')
  assert.equal(sizeLabel('standard'), '标准')
  assert.equal(sizeLabel('wide'), '宽')
})

test('workbench size — isWorkbenchSize only accepts the three presets', () => {
  for (const size of WORKBENCH_SIZES) assert.ok(isWorkbenchSize(size))
  assert.ok(!isWorkbenchSize('extra-wide'))
  assert.ok(!isWorkbenchSize(undefined))
  assert.ok(!isWorkbenchSize(720))
})

test('workbench size — clampWorkbenchWidth respects the legacy 360..760 window', () => {
  assert.equal(clampWorkbenchWidth(0), WORKBENCH_SIZE_MIN)
  assert.equal(clampWorkbenchWidth(100), WORKBENCH_SIZE_MIN)
  assert.equal(clampWorkbenchWidth(420.4), 420)
  assert.equal(clampWorkbenchWidth(800), WORKBENCH_SIZE_MAX)
  assert.equal(clampWorkbenchWidth(NaN), WORKBENCH_SIZE_TABLE.standard)
})

test('workbench size — detectWorkbenchSize falls back to standard outside the window', () => {
  assert.equal(detectWorkbenchSize(WORKBENCH_SIZE_MIN), 'narrow')
  assert.equal(detectWorkbenchSize(WORKBENCH_SIZE_MAX), 'wide')
  assert.equal(detectWorkbenchSize(WORKBENCH_SIZE_TABLE.standard), 'standard')
})

test('workbench size — storage readers fall back to safe defaults', () => {
  const empty = makeStorage({})
  assert.equal(readWorkbenchWidthFromStorage(empty), WORKBENCH_SIZE_TABLE.standard)
  assert.equal(readWorkbenchSizeFromStorage(empty), 'standard')
  assert.equal(readWorkbenchFullscreenFromStorage(empty), false)
})

test('workbench size — storage readers migrate legacy width only when in range', () => {
  const ok = makeStorage({ 'cangzhi-workbench-width': '500' })
  assert.equal(readWorkbenchWidthFromStorage(ok), 500)
  const tooSmall = makeStorage({ 'cangzhi-workbench-width': '200' })
  assert.equal(readWorkbenchWidthFromStorage(tooSmall), WORKBENCH_SIZE_TABLE.standard)
  const tooBig = makeStorage({ 'cangzhi-workbench-width': '900' })
  assert.equal(readWorkbenchWidthFromStorage(tooBig), WORKBENCH_SIZE_TABLE.standard)
  const junk = makeStorage({ 'cangzhi-workbench-width': 'abc' })
  assert.equal(readWorkbenchWidthFromStorage(junk), WORKBENCH_SIZE_TABLE.standard)
})

test('workbench size — fullscreen persistence is a strict string match', () => {
  assert.equal(readWorkbenchFullscreenFromStorage(makeStorage({ 'cangzhi-workbench-fullscreen': 'true' })), true)
  assert.equal(readWorkbenchFullscreenFromStorage(makeStorage({ 'cangzhi-workbench-fullscreen': 'TRUE' })), false)
  assert.equal(readWorkbenchFullscreenFromStorage(makeStorage({ 'cangzhi-workbench-fullscreen': '1' })), false)
})

test('workbench size — readWorkbenchInitialState lets the preset own both width and size', () => {
  const wide = readWorkbenchInitialState(makeStorage({
    'cangzhi-workbench-size': 'wide',
    'cangzhi-workbench-width': '500',
    'cangzhi-workbench-fullscreen': 'false',
  }))
  assert.deepEqual(wide, { size: 'wide', width: WORKBENCH_SIZE_TABLE.wide, fullscreen: false })
  const narrow = readWorkbenchInitialState(makeStorage({
    'cangzhi-workbench-size': 'narrow',
    'cangzhi-workbench-fullscreen': 'true',
  }))
  assert.deepEqual(narrow, { size: 'narrow', width: WORKBENCH_SIZE_TABLE.narrow, fullscreen: true })
})

test('workbench size — readWorkbenchInitialState infers the preset from a legacy width only', () => {
  const dragged = readWorkbenchInitialState(makeStorage({ 'cangzhi-workbench-width': '500' }))
  assert.equal(dragged.size, 'standard')
  assert.equal(dragged.width, 500)
  assert.equal(dragged.fullscreen, false)
  const empty = readWorkbenchInitialState(makeStorage({}))
  assert.equal(empty.size, 'standard')
  assert.equal(empty.width, WORKBENCH_SIZE_TABLE.standard)
  assert.equal(empty.fullscreen, false)
})

test('workbench size — readWorkbenchInitialState rejects an invalid size and falls back to width', () => {
  const junk = readWorkbenchInitialState(makeStorage({
    'cangzhi-workbench-size': 'extra-wide',
    'cangzhi-workbench-width': '420',
  }))
  assert.equal(junk.size, 'narrow')
  assert.equal(junk.width, 420)
})

test('evidence — idNumber normalises string and number ids and rejects junk', () => {
  assert.equal(idNumber(42), 42)
  assert.equal(idNumber('42'), 42)
  assert.equal(idNumber('0'), null)
  assert.equal(idNumber('-1'), null)
  assert.equal(idNumber('1.5'), null)
  assert.equal(idNumber('abc'), null)
  assert.equal(idNumber(null), null)
  assert.equal(idNumber({}), null)
  assert.equal(idNumber(0), null)
})

test('evidence — collectStructuredEvidence walks the MCP wrapper layers', () => {
  const wrapper = {
    content: [{ type: 'text', text: JSON.stringify({
      result: {
        rows: [
          { document_id: 7, dataset_id: 12, title: 'Q1 财务表', snippet: '第一行' },
          { document_id: 7, dataset_id: 12, title: 'Q1 财务表', snippet: '重复' },
          { document_id: 8, dataset_id: 13, title: 'Q2 财务表' },
        ],
      },
    }) }],
  }
  const flat = JSON.parse(wrapper.content[0].text)
  const links = collectStructuredEvidence(flat)
  assert.equal(links.length, 3)
  assert.equal(links[0].documentId, 7)
  assert.equal(links[0].datasetId, 12)
  assert.equal(links[0].title, 'Q1 财务表')
  assert.equal(links[0].snippet, '第一行')
  assert.equal(links[2].documentId, 8)
})

test('evidence — collectStructuredEvidence accepts camelCase keys as well', () => {
  const links = collectStructuredEvidence({ rows: [{ documentId: 1, datasetId: 2, title: '订单' }] })
  assert.equal(links.length, 1)
  assert.equal(links[0].documentId, 1)
  assert.equal(links[0].datasetId, 2)
  assert.equal(links[0].title, '订单')
})

test('evidence — dedupeEvidenceLinks collapses by document + dataset', () => {
  const links = [
    { documentId: 1, datasetId: 2, title: 'a' },
    { documentId: 1, datasetId: 2, title: 'a again' },
    { documentId: 1, datasetId: 3, title: 'b' },
    { documentId: 2, datasetId: null, title: 'c' },
    { documentId: 2, datasetId: null, title: 'c again' },
  ]
  const deduped = dedupeEvidenceLinks(links)
  assert.equal(deduped.length, 3)
  assert.equal(deduped[0].title, 'a')
  assert.equal(deduped[1].datasetId, 3)
  assert.equal(deduped[2].title, 'c')
})

test('evidence — dedupeEvidenceLinks honours a limit', () => {
  const links = [
    { documentId: 1, datasetId: 1, title: 'a' },
    { documentId: 2, datasetId: 2, title: 'b' },
    { documentId: 3, datasetId: 3, title: 'c' },
  ]
  assert.equal(dedupeEvidenceLinks(links, 2).length, 2)
  assert.equal(dedupeEvidenceLinks(links, 1).length, 1)
  assert.equal(dedupeEvidenceLinks(links).length, 3)
})

test('evidence — fallback regex still finds the legacy inline citation format', () => {
  const link = fallbackAnswerEvidence('请参考文档《Q1 报表》document_id: 7 dataset_id: 12 中的数据。')
  assert.ok(link !== null)
  assert.equal(link.documentId, 7)
  assert.equal(link.datasetId, 12)
  assert.equal(link.title, 'Q1 报表')
})

test('evidence — fallback recognises natural-language document numbers in final answers', () => {
  const answer = '数据来源：藏知文档 387《指标数据更新明细》dataset_id=354。'
  const link = fallbackAnswerEvidence(answer)
  assert.ok(link !== null)
  assert.equal(link.documentId, 387)
  assert.equal(link.datasetId, 354)
  assert.equal(link.title, '指标数据更新明细')
})

test('evidence — fallback accepts dataset-first and markdown-bold ids', () => {
  const answer = '数据集 ID 是 **354**，对应文档 387《指标数据更新明细》。'
  const link = fallbackAnswerEvidence(answer)
  assert.ok(link !== null)
  assert.equal(link.documentId, 387)
  assert.equal(link.datasetId, 354)
})

test('evidence — fallback regex returns null when no citation is present', () => {
  assert.equal(fallbackAnswerEvidence('没有引用，纯文本回答。'), null)
  assert.equal(fallbackAnswerEvidence(''), null)
  assert.equal(fallbackAnswerEvidence(null), null)
})

test('evidence — answerEvidence prefers the structured JSON form over the text fallback', () => {
  const wrapped = JSON.stringify({ document_id: 9, dataset_id: 14, title: '订单' })
  const link = answerEvidence(wrapped)
  assert.ok(link !== null)
  assert.equal(link.documentId, 9)
  assert.equal(link.datasetId, 14)
  assert.equal(link.title, '订单')
})

test('evidence — answerEvidence falls back to the regex when no JSON is present', () => {
  const link = answerEvidence('请参考文档《季度报》document_id: 5 dataset_id: 6。')
  assert.ok(link !== null)
  assert.equal(link.documentId, 5)
  assert.equal(link.datasetId, 6)
  assert.equal(link.title, '季度报')
})

test('evidence — answerEvidence returns null when no document id is present', () => {
  assert.equal(answerEvidence('一些普通回答，没有 document_id。'), null)
})

test('evidence — formatEvidenceLink formats document and dataset ids', () => {
  assert.equal(formatEvidenceLink({ documentId: 1, datasetId: 2, title: 'x' }), 'document_id 1 · dataset_id 2')
  assert.equal(formatEvidenceLink({ documentId: 1, datasetId: null, title: 'x' }), 'document_id 1')
  assert.equal(formatEvidenceLink(null), '')
})
