import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  classifyDocumentPreview,
  classifyEvidencePreview,
  looksLikeMarkdown,
  resolveEvidenceDatasetId,
} from '../src/client/lib/preview-routing.mjs'

test('preview routing — dataset metadata always wins over markdown-looking snippets', () => {
  const context = {
    evidence_type: 'dataset',
    document_type: 'xlsx',
    context_markdown: '| A | B |\n| --- | --- |',
    dataset: { dataset_id: 354 },
  }
  assert.equal(classifyEvidencePreview(context, null), 'dataset')
  assert.equal(classifyEvidencePreview({ evidence_type: 'markdown' }, { rows: [] }), 'dataset')
  assert.equal(classifyEvidencePreview({ table_location: { sheet_name: 'Sheet1' } }, null), 'dataset')
  assert.equal(classifyEvidencePreview({ evidence_type: 'document', document_type: 'xlsx' }, null), 'dataset')
})

test('preview routing — resolves a version-checked dataset identity without guessing', () => {
  assert.equal(resolveEvidenceDatasetId({ dataset: { dataset_id: 354 } }, null), 354)
  assert.equal(resolveEvidenceDatasetId({ dataset: { dataset_id: '354' } }, 354), 354)
  assert.equal(resolveEvidenceDatasetId({}, 354), 354)
  assert.equal(resolveEvidenceDatasetId({ dataset: { dataset_id: 355 } }, 354), null)
  assert.equal(resolveEvidenceDatasetId({ dataset: {} }, 'junk'), null)
})

test('preview routing — explicit markdown and document types stay separate', () => {
  assert.equal(classifyEvidencePreview({ evidence_type: 'markdown', context_markdown: '# 标题' }, null), 'markdown')
  assert.equal(classifyEvidencePreview({ evidence_type: 'pdf_word', context_markdown: '# 不是标题' }, null), 'document')
  assert.equal(classifyEvidencePreview({ evidence_type: 'document', snippet: '正文' }, null), 'document')
})

test('preview routing — legacy payloads use conservative markdown detection', () => {
  assert.equal(classifyEvidencePreview({ context_markdown: '| A | B |\n| --- | --- |\n| 1 | 2 |' }, null), 'markdown')
  assert.equal(classifyEvidencePreview({ context_markdown: '普通文本里有 | 符号' }, null), 'document')
  assert.equal(classifyEvidencePreview({}, null), 'empty')
  assert.equal(looksLikeMarkdown('## 标题'), true)
})

test('preview routing — document metadata selects the renderer', () => {
  assert.equal(classifyDocumentPreview({ contentKind: 'dataset', title: '无扩展名' }), 'dataset')
  assert.equal(classifyDocumentPreview({ documentType: 'xlsx' }), 'dataset')
  assert.equal(classifyDocumentPreview({ sourceType: 'note' }), 'markdown')
  assert.equal(classifyDocumentPreview({ documentType: 'markdown' }), 'markdown')
  assert.equal(classifyDocumentPreview({ title: 'README.md' }), 'markdown')
  assert.equal(classifyDocumentPreview({ documentType: 'pdf' }), 'binary-document')
  assert.equal(classifyDocumentPreview({ title: '报告.docx' }), 'binary-document')
  assert.equal(classifyDocumentPreview({ documentType: 'txt' }), 'text')
})
