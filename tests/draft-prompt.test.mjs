import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { prepareKnowledgeDraft } from '../src/client/lib/draft-prompt.mjs'
test('draft append preserves existing text verbatim', () => {
  assert.equal(prepareKnowledgeDraft({ draft: '  原问题\n', phase: 'plain' }, '资料提示').draft, '  原问题\n\n\n资料提示\n\n')
})
test('draft append is idempotent and handles empty input', () => {
  const input = { draft: '', phase: 'plain' }
  const first = prepareKnowledgeDraft(input, '资料提示').draft
  assert.equal(prepareKnowledgeDraft({ ...input, draft: first }, '资料提示').draft, first)
  assert.equal(prepareKnowledgeDraft(input, '').draft, '')
})
test('draft append refuses structured or busy drafts', () => {
  assert.ok(prepareKnowledgeDraft({ draft: '引用', phase: 'plain', occurrences: [{}] }, '提示').error)
  assert.ok(prepareKnowledgeDraft({ draft: '问题', phase: 'submitting' }, '提示').error)
  assert.ok(prepareKnowledgeDraft(undefined, '提示').error)
})
