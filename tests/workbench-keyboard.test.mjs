import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { resizeWorkbenchWithKey } from '../src/client/lib/workbench-size.mjs'

test('workbench keyboard — left expands and right shrinks the right-hand panel', () => {
  assert.equal(resizeWorkbenchWithKey(520, 'ArrowLeft'), 540)
  assert.equal(resizeWorkbenchWithKey(520, 'ArrowRight'), 500)
})
test('workbench keyboard — respects bounds and Home/End', () => {
  assert.equal(resizeWorkbenchWithKey(760, 'ArrowLeft'), 760)
  assert.equal(resizeWorkbenchWithKey(360, 'ArrowRight'), 360)
  assert.equal(resizeWorkbenchWithKey(520, 'Home'), 360)
  assert.equal(resizeWorkbenchWithKey(520, 'End'), 760)
})
test('workbench keyboard — unrelated keys retain normal browser behaviour', () => {
  assert.equal(resizeWorkbenchWithKey(520, 'Tab'), null)
  assert.equal(resizeWorkbenchWithKey(520, 'Escape'), null)
})
