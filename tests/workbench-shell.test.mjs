import { strict as assert } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const source = await readFile(new URL('../src/client/plugin.tsx', import.meta.url), 'utf8')
const applySource = source.slice(source.indexOf('export function apply(ctx: ClientContext)'))

test('workbench shell — conversation entry uses the compact DSH tool row only', () => {
  assert.match(applySource, /ctx\.slots\.inject\('conversation\.input\.left'/)
  assert.doesNotMatch(applySource, /ctx\.slots\.inject\('conversation\.input\.dock'/)
  assert.doesNotMatch(applySource, /ctx\.slots\.inject\('conversation\.hero\.context'/)
  assert.doesNotMatch(applySource, /ctx\.slots\.inject\('conversation\.session\.header\.actions'/)
})

test('workbench shell — toolbar opens the unified conversation workbench', () => {
  assert.match(source, /onClick=\{\(\) => openKnowledge\('context'\)\}/)
  assert.match(source, /className=\{css\.workbenchControls\}/)
  assert.match(source, /本对话使用藏知/)
})

test('workbench shell — connection settings reuse the existing settings component', () => {
  assert.match(source, /tab === 'settings'.*<CangzhiSettingsTab settingsScope=\{settingsScope\} t=\{t\}/s)
  assert.match(applySource, /inject: \(\) => \(\{ \.\.\.consoleFace, \.\.\.settingsFace \}\)/)
})
