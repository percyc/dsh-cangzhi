import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { resizeWorkbenchWithKey } from '../src/client/lib/workbench-size.mjs'

test('workbench keyboard — left expands and right shrinks the right-hand panel', () => {
  assert.equal(resizeWorkbenchWithKey(520, 'ArrowLeft'), 540)
  assert.equal(resizeWorkbenchWithKey(520, 'ArrowRight'), 500)
})
test('workbench keyboard — respects bounds and Home/End', () => {
  assert.equal(resizeWorkbenchWithKey(1200, 'ArrowLeft'), 1200)
  assert.equal(resizeWorkbenchWithKey(420, 'ArrowRight'), 420)
  assert.equal(resizeWorkbenchWithKey(640, 'Home'), 420)
  assert.equal(resizeWorkbenchWithKey(640, 'End'), 1200)
  assert.equal(resizeWorkbenchWithKey(620, 'End', 1000), 640)
})
test('workbench keyboard — unrelated keys retain normal browser behaviour', () => {
  assert.equal(resizeWorkbenchWithKey(520, 'Tab'), null)
  assert.equal(resizeWorkbenchWithKey(520, 'Escape'), null)
})
