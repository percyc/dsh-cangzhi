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
  resolveWorkbenchMaxWidth,
  sizeGlyph,
  sizeLabel,
} from '../src/client/lib/workbench-size.mjs'
import {
  answerEvidence,
  collectStructuredEvidence,
  dedupeEvidenceLinks,
  evidenceFromToolResult,
  fallbackAnswerEvidence,
  formatEvidenceLink,
  idNumber,
  isCatalogHint,
  suppressCatalogHints,
} from '../src/client/lib/evidence.mjs'

function makeStorage(values) {
  const map = new Map(Object.entries(values))
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null },
    setItem(key, value) { map.set(key, String(value)) },
  }
}

test('workbench size — table covers the responsive 420..1200 range with legacy preset compatibility', () => {
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

test('workbench size — clampWorkbenchWidth respects the responsive desktop window', () => {
  assert.equal(clampWorkbenchWidth(0), WORKBENCH_SIZE_MIN)
  assert.equal(clampWorkbenchWidth(100), WORKBENCH_SIZE_MIN)
  assert.equal(clampWorkbenchWidth(420.4), 420)
  assert.equal(clampWorkbenchWidth(800), 800)
  assert.equal(clampWorkbenchWidth(1300), WORKBENCH_SIZE_MAX)
  assert.equal(resolveWorkbenchMaxWidth(1000), 640)
  assert.equal(clampWorkbenchWidth(900, 1000), 640)
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

test('workbench size — storage readers preserve widths in the expanded range', () => {
  const ok = makeStorage({ 'cangzhi-workbench-width': '500' })
  assert.equal(readWorkbenchWidthFromStorage(ok), 500)
  const tooSmall = makeStorage({ 'cangzhi-workbench-width': '200' })
  assert.equal(readWorkbenchWidthFromStorage(tooSmall), WORKBENCH_SIZE_TABLE.standard)
  const tooBig = makeStorage({ 'cangzhi-workbench-width': '1300' })
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

test('workbench size — readWorkbenchInitialState infers the preset from a saved width only', () => {
  const dragged = readWorkbenchInitialState(makeStorage({ 'cangzhi-workbench-width': '600' }))
  assert.equal(dragged.size, 'standard')
  assert.equal(dragged.width, 600)
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

test('evidence — search hits inherit the nested chunk locator', () => {
  const links = collectStructuredEvidence({
    hits: [{
      document_id: 41,
      document_version_id: 42,
      title: '制度说明',
      snippet: '原文片段',
      chunk: { id: 43, heading_path: ['第一章'], page: 6 },
    }],
  })
  assert.equal(links.length, 1)
  assert.equal(links[0].documentId, 41)
  assert.equal(links[0].documentVersionId, 42)
  assert.equal(links[0].chunkId, 43)
  assert.equal(links[0].page, 6)
  assert.deepEqual(links[0].headingPath, ['第一章'])
})

test('evidence — tool result extraction keeps exact document and dataset versions', () => {
  const content = [{
    type: 'text',
    text: JSON.stringify({
      dataset_id: 354,
      document_id: 387,
      document_version_id: 392,
      artifact_version: 7,
      title: '指标数据更新明细',
      source_rows: [18, 23, 23],
      columns: ['数据期', '高中数量'],
      rows: [{ row_number: 18, 数据期: 2024, 高中数量: 63 }],
    }),
  }]
  const links = evidenceFromToolResult('mcp__cangzhi__knowledge_query_dataset', content)
  assert.equal(links.length, 1)
  assert.equal(links[0].documentId, 387)
  assert.equal(links[0].documentVersionId, 392)
  assert.equal(links[0].datasetId, 354)
  assert.equal(links[0].artifactVersion, 7)
  assert.deepEqual(links[0].sourceRows, [18, 23])
  assert.deepEqual(links[0].columns, ['数据期', '高中数量'])
})

test('evidence — ignores non-Cangzhi tools and bare document metadata', () => {
  const content = [{ type: 'text', text: JSON.stringify({ document_id: 9, document_version_id: 10, title: '普通资料' }) }]
  assert.deepEqual(evidenceFromToolResult('mcp__other__read', content), [])
  assert.deepEqual(evidenceFromToolResult('mcp__cangzhi__knowledge_get_document', content), [])
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
  assert.equal(formatEvidenceLink({ documentId: 1, documentVersionId: 4, datasetId: 2, sourceRows: [8, 9], title: 'x' }), 'document_id 1 · version 4 · dataset 2 · rows 8, 9')
  assert.equal(formatEvidenceLink({ documentId: 1, datasetId: null, title: 'x' }), 'document_id 1')
  assert.equal(formatEvidenceLink(null), '')
})

test('evidence — isCatalogHint matches dataset_catalog chunkType, falls back to the legacy no-chunk shape, and rejects regular dataset rows', () => {
  // Durable contract: chunkType === 'dataset_catalog' wins, even when an
  // explicit chunk_id accompanies the catalog entry (real knowledge_search
  // payload has chunk_id=59, chunk_type='dataset_catalog' together).
  assert.equal(isCatalogHint({
    documentId: 6, documentVersionId: 6, datasetId: 4, chunkId: 59, chunkType: 'dataset_catalog', sourceRows: [],
  }), true)
  // Top-level camelCase chunkType also works.
  assert.equal(isCatalogHint({
    documentId: 6, documentVersionId: 6, datasetId: 4, chunkId: 59, chunkType: 'dataset_catalog', sourceRows: [],
  }), true)
  // Legacy structural fallback: neither chunkId nor chunkType, no rows.
  assert.equal(isCatalogHint({
    documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [],
  }), true)
  // Has sourceRows: not a catalog hint.
  assert.equal(isCatalogHint({
    documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [18, 23],
  }), false)
  // Regular document chunk (no datasetId): not a catalog hint.
  assert.equal(isCatalogHint({
    documentId: 41, documentVersionId: 42, datasetId: null, chunkId: 43, chunkType: null, sourceRows: [],
  }), false)
  // No documentVersionId: not a catalog hint.
  assert.equal(isCatalogHint({
    documentId: 387, documentVersionId: null, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [],
  }), false)
  // Regular dataset chunk with a real chunkId (and rows omitted) must NOT
  // be confused with a catalog hint. It has a chunkId so the legacy
  // fallback does not match; it is not catalog_typed either.
  assert.equal(isCatalogHint({
    documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: 99, chunkType: null, sourceRows: [],
  }), false)
  assert.equal(isCatalogHint(null), false)
})

test('evidence — chunkType propagates from the top-level field or the nested chunk object', () => {
  const topLevel = collectStructuredEvidence({
    dataset_catalog: [{
      document_id: 6, document_version_id: 6, dataset_id: 4, title: '样表',
      chunk_id: 59, chunk_type: 'dataset_catalog',
    }],
  })
  assert.equal(topLevel.length, 1)
  assert.equal(topLevel[0].chunkId, 59)
  assert.equal(topLevel[0].chunkType, 'dataset_catalog')

  const nested = collectStructuredEvidence({
    dataset_catalog: [{
      document_id: 6, document_version_id: 6, dataset_id: 4, title: '样表',
      chunk: { id: 59, type: 'dataset_catalog' },
    }],
  })
  assert.equal(nested.length, 1)
  assert.equal(nested[0].chunkId, 59)
  assert.equal(nested[0].chunkType, 'dataset_catalog')

  const camelCase = collectStructuredEvidence({
    rows: [{ documentId: 6, documentVersionId: 6, datasetId: 4, chunkId: 59, chunkType: 'dataset_catalog', title: '样表' }],
  })
  assert.equal(camelCase.length, 1)
  assert.equal(camelCase[0].chunkType, 'dataset_catalog')
})

test('evidence — real nested knowledge_search payload keeps the dataset_catalog chunkId while still being identified as a catalog hint', () => {
  const links = evidenceFromToolResult('mcp__cangzhi__knowledge_search', [{
    type: 'text',
    text: JSON.stringify({
      hits: [{ document_id: 6, document_version_id: 6, title: '样表资料', snippet: '命中片段' }],
      dataset_catalog: [{
        document_id: 6, document_version_id: 6, dataset_id: 4, title: '样表资料',
        chunk: { id: 59, type: 'dataset_catalog' },
        columns: ['数据期', '高中数量'],
      }],
    }),
  }])
  const catalog = links.find(link => link.datasetId === 4)
  assert.ok(catalog !== undefined, 'catalog row must be picked up from the nested chunk object')
  assert.equal(catalog.chunkId, 59)
  assert.equal(catalog.chunkType, 'dataset_catalog')
  assert.equal(isCatalogHint(catalog), true, 'real payload must satisfy isCatalogHint even with chunk_id=59')
})

test('evidence — suppressCatalogHints drops the search hint when the same document/version/dataset has exact source_rows', () => {
  const links = [
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [], title: '指标数据更新明细' },
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [18, 23], title: '指标数据更新明细' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 1)
  assert.deepEqual(out[0].sourceRows, [18, 23])
  assert.equal(out[0].title, '指标数据更新明细')
})

test('evidence — suppressCatalogHints keeps catalog hints when no exact source_rows evidence exists', () => {
  const links = [
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [], title: '指标数据更新明细' },
    { documentId: 388, documentVersionId: 393, datasetId: 355, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [], title: '另一份资料' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 2)
  assert.equal(out[0].documentId, 387)
  assert.equal(out[1].documentId, 388)
})

test('evidence — suppressCatalogHints never touches document chunks without a datasetId', () => {
  const links = [
    { documentId: 41, documentVersionId: 42, datasetId: null, chunkId: 43, chunkType: null, sourceRows: [], title: '制度说明' },
    { documentId: 41, documentVersionId: 42, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [18], title: '同一份资料的数据集命中' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 2)
  assert.equal(out[0].documentId, 41)
  assert.equal(out[0].chunkId, 43)
})

test('evidence — suppressCatalogHints does not collapse across different documents', () => {
  const links = [
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [], title: 'A 资料' },
    { documentId: 388, documentVersionId: 393, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [5], title: 'B 资料' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 2)
})

test('evidence — suppressCatalogHints does not collapse across different versions', () => {
  const links = [
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: 59, chunkType: 'dataset_catalog', sourceRows: [], title: '旧版本线索' },
    { documentId: 387, documentVersionId: 999, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [1], title: '新版本精确证据' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 2)
})

test('evidence — suppressCatalogHints does not collapse across different datasets on the same document', () => {
  const links = [
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [], title: 'A 表' },
    { documentId: 387, documentVersionId: 392, datasetId: 500, chunkId: null, chunkType: null, sourceRows: [2], title: 'B 表' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 2)
})

test('evidence — suppressCatalogHints keeps catalog hints that lack a documentVersionId even when exact evidence shares the same document and dataset', () => {
  const links = [
    { documentId: 387, documentVersionId: null, datasetId: 354, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [], title: '旧记录线索' },
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [4], title: '精确证据' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 2)
  assert.equal(out[0].documentVersionId, null)
  assert.deepEqual(out[1].sourceRows, [4])
})

test('evidence — suppressCatalogHints suppresses even when the catalog hint and the exact row have different titles (identity-based, not title-based)', () => {
  const links = [
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: 59, chunkType: 'dataset_catalog', sourceRows: [], title: '检索结果' },
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [7], title: '精确贡献行' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 1)
  assert.equal(out[0].title, '精确贡献行')
})

test('evidence — suppressCatalogHints preserves order and identity for entries that survive', () => {
  const links = [
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: 59, chunkType: 'dataset_catalog', sourceRows: [], title: 'A 线索' },
    { documentId: 41, documentVersionId: 42, datasetId: null, chunkId: 43, chunkType: null, sourceRows: [], title: '制度' },
    { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: null, chunkType: null, sourceRows: [9], title: 'A 精确' },
    { documentId: 388, documentVersionId: 393, datasetId: 355, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [], title: 'B 线索' },
  ]
  const out = suppressCatalogHints(links)
  assert.equal(out.length, 3)
  assert.equal(out[0].title, '制度')
  assert.equal(out[1].title, 'A 精确')
  assert.equal(out[2].title, 'B 线索')
})

test('evidence — suppressCatalogHints tolerates non-array and nullish input', () => {
  assert.deepEqual(suppressCatalogHints(null), [])
  assert.deepEqual(suppressCatalogHints(undefined), [])
  assert.deepEqual(suppressCatalogHints('not an array'), [])
  assert.deepEqual(suppressCatalogHints([]), [])
  assert.equal(suppressCatalogHints([{ documentId: 387, datasetId: 354, documentVersionId: 392, chunkId: null, chunkType: 'dataset_catalog', sourceRows: [] }]).length, 1)
})

test('evidence — end-to-end: real knowledge_search nested payload + real knowledge_query_dataset payload dedupe by identity in the final answer list', () => {
  // Document 6 / version 6 / dataset 4 / nested chunk id 59, with
  // chunk.type='dataset_catalog' — this is the M3-confirmed real shape.
  const searchPayload = JSON.stringify({
    hits: [
      { document_id: 6, document_version_id: 6, title: '样表资料', snippet: '命中片段' },
    ],
    dataset_catalog: [
      {
        document_id: 6, document_version_id: 6, dataset_id: 4, title: '样表资料',
        chunk: { id: 59, type: 'dataset_catalog' },
        columns: ['数据期', '高中数量'],
      },
    ],
  })
  // Same triple, artifact_version=1, 12 source rows — this is the
  // M3-confirmed real knowledge_query_dataset payload.
  const queryPayload = JSON.stringify({
    document_id: 6,
    document_version_id: 6,
    dataset_id: 4,
    artifact_version: 1,
    title: '样表资料',
    source_rows: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112],
    columns: ['数据期', '高中数量'],
  })
  const searchLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_search', [{ type: 'text', text: searchPayload }])
  const queryLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_query_dataset', [{ type: 'text', text: queryPayload }])
  const combined = dedupeEvidenceLinks([...searchLinks, ...queryLinks])
  assert.ok(combined.length >= 2, 'before suppression, both the catalog hint and the exact rows survive dedupe')
  const final = suppressCatalogHints(combined)
  const datasetEntries = final.filter(link => link.datasetId === 4)
  assert.equal(datasetEntries.length, 1, 'real catalog hint must be suppressed when an exact triple exists')
  assert.deepEqual(datasetEntries[0].sourceRows, [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112])
  assert.equal(datasetEntries[0].artifactVersion, 1)
  const documentOnly = final.filter(link => link.datasetId === null)
  for (const link of documentOnly) {
    assert.equal(link.datasetId, null, 'document chunks without a datasetId must never be suppressed')
  }
})

test('evidence — a regular dataset chunk without sourceRows is never treated as a catalog hint or as exact evidence', () => {
  // A regular dataset chunk (e.g. dataset schema description surfaced by
  // knowledge_search) has a real chunkId but no rows. The legacy fallback
  // must not classify it as a catalog hint, and the suppress pass must
  // leave it alone even when the same triple has no exact rows anywhere.
  const regular = { documentId: 387, documentVersionId: 392, datasetId: 354, chunkId: 120, chunkType: null, sourceRows: [] }
  assert.equal(isCatalogHint(regular), false, 'a regular dataset chunk with a real chunkId is not a catalog hint')
  const out = suppressCatalogHints([regular])
  assert.equal(out.length, 1, 'regular dataset chunks survive even with no exact rows on the triple')
  assert.equal(out[0].chunkId, 120)
})

test('evidence — exact evidence with chunk_type=dataset_catalog is not allowed to suppress a same-triple hint (no self-shadowing)', () => {
  const links = [
    { documentId: 6, documentVersionId: 6, datasetId: 4, chunkId: 59, chunkType: 'dataset_catalog', sourceRows: [], title: 'catalog' },
    { documentId: 6, documentVersionId: 6, datasetId: 4, chunkId: 59, chunkType: 'dataset_catalog', sourceRows: [12, 14], title: 'catalog+rows' },
  ]
  const out = suppressCatalogHints(links)
  // Both rows carry chunkType='dataset_catalog', so neither counts as
  // "exact" and both survive. The second entry is itself a catalog hint
  // and is not promoted to exact by having rows.
  assert.equal(out.length, 2)
})

test('evidence — different versions keep the catalog hint alive even when an exact row exists for a sibling version', () => {
  const searchPayload = JSON.stringify({
    dataset_catalog: [
      { document_id: 6, document_version_id: 6, dataset_id: 4, title: '样表 v6',
        chunk: { id: 59, type: 'dataset_catalog' } },
    ],
  })
  const queryPayload = JSON.stringify({
    document_id: 6, document_version_id: 7, dataset_id: 4, artifact_version: 2,
    title: '样表 v7', source_rows: [201, 202], columns: ['数据期'],
  })
  const searchLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_search', [{ type: 'text', text: searchPayload }])
  const queryLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_query_dataset', [{ type: 'text', text: queryPayload }])
  const combined = dedupeEvidenceLinks([...searchLinks, ...queryLinks])
  const final = suppressCatalogHints(combined)
  // Different document versions mean identity does not match: the catalog
  // hint for v6 must survive even though v7 has exact rows.
  assert.equal(final.length, 2)
  const byVersion = new Map(final.map(link => [link.documentVersionId, link]))
  assert.equal(byVersion.get(6).chunkType, 'dataset_catalog')
  assert.deepEqual(byVersion.get(7).sourceRows, [201, 202])
})

test('evidence — different documents keep the catalog hint alive even when an exact row exists for a sibling document', () => {
  const searchPayload = JSON.stringify({
    dataset_catalog: [
      { document_id: 6, document_version_id: 6, dataset_id: 4, title: 'A 资料',
        chunk: { id: 59, type: 'dataset_catalog' } },
    ],
  })
  const queryPayload = JSON.stringify({
    document_id: 7, document_version_id: 6, dataset_id: 4, artifact_version: 1,
    title: 'B 资料', source_rows: [1, 2], columns: ['数据期'],
  })
  const searchLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_search', [{ type: 'text', text: searchPayload }])
  const queryLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_query_dataset', [{ type: 'text', text: queryPayload }])
  const combined = dedupeEvidenceLinks([...searchLinks, ...queryLinks])
  const final = suppressCatalogHints(combined)
  assert.equal(final.length, 2)
  assert.equal(final.some(link => link.documentId === 6 && link.chunkType === 'dataset_catalog'), true)
  assert.equal(final.some(link => link.documentId === 7 && link.sourceRows.length > 0), true)
})

test('evidence — top-level chunk_type without nested chunk propagates and is recognised as a catalog hint', () => {
  const searchPayload = JSON.stringify({
    dataset_catalog: [
      { document_id: 6, document_version_id: 6, dataset_id: 4, title: '样表资料',
        chunk_id: 59, chunk_type: 'dataset_catalog' },
    ],
  })
  const searchLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_search', [{ type: 'text', text: searchPayload }])
  const catalog = searchLinks.find(link => link.datasetId === 4)
  assert.ok(catalog !== undefined)
  assert.equal(catalog.chunkId, 59)
  assert.equal(catalog.chunkType, 'dataset_catalog')
  assert.equal(isCatalogHint(catalog), true)
})

test('evidence — real session payload suppresses a dataset_catalog hit that has no dataset_id', () => {
  const searchLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_search', [{
    type: 'text',
    text: JSON.stringify({
      hits: [{
        document_id: 6,
        document_version_id: 6,
        title: '2026.1-6月周菜谱_Dify就绪版(1)',
        chunk: {
          id: 59,
          type: 'dataset_catalog',
          heading_path: ['menu', '数据区域 1'],
        },
        snippet: '检索发现的数据表目录片段',
      }],
    }),
  }])
  const queryLinks = evidenceFromToolResult('mcp__cangzhi__knowledge_query_dataset', [{
    type: 'text',
    text: JSON.stringify({
      dataset_id: 4,
      document_id: 6,
      document_version_id: 6,
      artifact_version: 1,
      title: '2026.1-6月周菜谱_Dify就绪版(1)',
      source_rows: [612, 576, 566, 571, 581, 586, 591, 556, 606, 596, 601, 561],
    }),
  }])

  assert.equal(searchLinks[0].datasetId, null)
  assert.equal(searchLinks[0].chunkId, 59)
  assert.equal(searchLinks[0].chunkType, 'dataset_catalog')
  const final = suppressCatalogHints(dedupeEvidenceLinks([...searchLinks, ...queryLinks]))
  assert.equal(final.length, 1)
  assert.equal(final[0].datasetId, 4)
  assert.equal(final[0].sourceRows.length, 12)
})
