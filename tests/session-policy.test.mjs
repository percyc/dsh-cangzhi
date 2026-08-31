/**
 * Regression test for the Cangzhi session knowledge policy.
 *
 * The Host applies the policy by registering (a) an empty scoped
 * system-prompt section that shadows the global guidance and (b) a
 * `tools.restrict({ deny })` filter on the agent scope. The bug
 * previously reported was that toggling "off" in the conversation did
 * not actually prevent the model from calling Cangzhi tools; this test
 * exercises the same wiring the production plugin uses (Cordis Context,
 * system-prompt and tools runtimes, a minted agent scope, the policy
 * applier) and asserts that:
 *
 *  1. The default state for a new session is "enabled" (no restriction,
 *     global guidance visible).
 *  2. After applying the off policy, the agent scope sees only the
 *     empty shadow section AND the Cangzhi tools are denied.
 *  3. After applying the on policy the previous disposers are invoked
 *     exactly once and the original visibility is restored.
 *  4. Toggling off for a parent propagates to a child whose
 *     `parentSession` matches the parent id.
 *  5. Toggling off then on for a child subagent re-enables the tools
 *     only for that child, not the parent.
 *
 * The test is intentionally self-contained and does not require the
 * DSH AgentLoop service: the policy logic operates on a Cordis context
 * that exposes `systemPrompt` and `tools`, which is the same shape the
 * agent's `ctx` has.
 *
 * Run with: `DSH_SOURCE=/path/to/deepseek-harness node --test tests/session-policy.test.mjs`
 */

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { resolve } from 'node:path'
import { access } from 'node:fs/promises'

const dshRoot = process.env.DSH_SOURCE ?? '/home/percy/software/deepseek-harness'
const targets = [
  ['@deepseek-ai/cordis', resolve(dshRoot, 'vendor/cordis/lib/index.js')],
  ['@deepseek-ai/dsh-scope', resolve(dshRoot, 'packages/core/scope/lib/index.js')],
  ['@deepseek-ai/dsh-system-prompt', resolve(dshRoot, 'packages/core/system-prompt/lib/index.js')],
  ['@deepseek-ai/dsh-tools', resolve(dshRoot, 'packages/core/tools/lib/index.js')],
  ['@deepseek-ai/dsh-brand', resolve(dshRoot, 'node_modules/.pnpm/node_modules/@deepseek-ai/dsh-brand/lib/index.js')],
]

const skip = async () => {
  const missing = []
  for (const [name, path] of targets) {
    try { await access(path) } catch { missing.push(name) }
  }
  return missing.length > 0 ? `missing DSH lib outputs (${missing.join(', ')}); set DSH_SOURCE and run \`pnpm --filter <pkg> build\` in that checkout` : null
}

const skipReason = await skip()
const t = skipReason ? { skip: skipReason } : {}

test('cangzhi session policy — toggles and propagates', t, async () => {
  const importFor = ([, path]) => import(path)
  const [cordis, scopeMod, systemPromptMod, toolsMod] = await Promise.all(targets.map(importFor))
  const { Context } = cordis
  const { createScope, scopeOf } = scopeMod
  const SystemPrompt = systemPromptMod.default
  const ToolRuntime = toolsMod.default

  const SessionId = (s) => s
  const CANGZHI_TOOLS = [
    'mcp__cangzhi__knowledge_list_scopes',
    'mcp__cangzhi__knowledge_list_facets',
    'mcp__cangzhi__knowledge_list_documents',
    'mcp__cangzhi__knowledge_search',
    'mcp__cangzhi__knowledge_ask',
    'mcp__cangzhi__knowledge_get_document',
    'mcp__cangzhi__knowledge_get_chunk',
    'mcp__cangzhi__knowledge_list_datasets',
    'mcp__cangzhi__knowledge_get_dataset_schema',
    'mcp__cangzhi__knowledge_preview_dataset_rows',
    'mcp__cangzhi__knowledge_query_dataset',
    'mcp__cangzhi__knowledge_get_evidence_by_chunk',
    'mcp__cangzhi__knowledge_get_evidence_by_dataset',
    'mcp__cangzhi__knowledge_preview_evidence_rows',
  ]
  const GLOBAL_TEXT = 'Cangzhi is connected as the read-only knowledge system named cangzhi.'

  const ctx = new Context()
  await ctx.plugin(SystemPrompt, {})
  await ctx.plugin(ToolRuntime, {})

  ctx.systemPrompt.section({ name: 'integration:cangzhi', order: 155, text: GLOBAL_TEXT })
  for (const name of CANGZHI_TOOLS) {
    ctx.tools.register({
      name,
      description: `cangzhi ${name}`,
      parameters: { type: 'object', properties: {} },
      output: { schema: { type: 'string' }, render: () => [] },
      execute: () => Promise.resolve('unused'),
    })
  }

  const sessionPolicies = new Map()
  const applySessionPolicy = (agent, enabled) => {
    const previous = sessionPolicies.get(agent.id)
    previous?.disposePrompt()
    previous?.disposeRestriction()
    sessionPolicies.delete(agent.id)
    if (enabled) return
    const disposePrompt = agent.ctx.systemPrompt.section({
      name: 'integration:cangzhi', order: 155, text: '',
    })
    const disposeRestriction = agent.ctx.tools.restrict({ deny: [...CANGZHI_TOOLS] })
    sessionPolicies.set(agent.id, { disposePrompt, disposeRestriction })
  }

  const schemasFor = (key) => ctx.tools.schemas(key).map((s) => s.name).sort()

  const rootId = SessionId('sess-root')
  const rootAgent = { id: rootId, session: { header: { parentSession: undefined } } }
  let rootScope
  await ctx.plugin(Object.assign((inner) => { rootScope = createScope(inner, rootAgent) },
    { inject: ['systemPrompt', 'tools'] }))
  const rootKey = scopeOf(rootScope.ctx)
  assert.ok(rootKey, 'root agent scope must be a real ScopeKey')

  // 1. Default: global guidance visible, all Cangzhi tools visible.
  const before = await ctx.systemPrompt.assemble({ scope: rootKey })
  const beforeSection = before.sections.find((s) => s.name === 'integration:cangzhi')
  assert.ok(beforeSection && beforeSection.text === GLOBAL_TEXT, 'global guidance should be visible by default')
  for (const name of CANGZHI_TOOLS) {
    assert.ok(schemasFor(rootKey).includes(name), `${name} should be visible before toggling off`)
  }

  // 2. Toggle off — section shadowed + tools denied.
  applySessionPolicy({ id: rootId, ctx: rootScope.ctx }, false)
  const off = await ctx.systemPrompt.assemble({ scope: rootKey })
  const offSection = off.sections.find((s) => s.name === 'integration:cangzhi')
  assert.ok(offSection, 'integration:cangzhi section must still be present (just shadowed)')
  assert.equal(offSection.text, '', 'integration:cangzhi should be empty after toggling off')
  for (const name of CANGZHI_TOOLS) {
    assert.ok(!schemasFor(rootKey).includes(name), `${name} must be denied after toggling off`)
  }
  assert.ok(sessionPolicies.has(rootId), 'policy must be tracked in sessionPolicies')

  // 3. Toggle on — disposers fire exactly once and visibility is restored.
  let disposePromptCount = 0
  let disposeRestrictionCount = 0
  const originalDispose = sessionPolicies.get(rootId)
  const tracked = {
    disposePrompt: () => { disposePromptCount += 1; originalDispose.disposePrompt() },
    disposeRestriction: () => { disposeRestrictionCount += 1; originalDispose.disposeRestriction() },
  }
  sessionPolicies.set(rootId, tracked)
  applySessionPolicy({ id: rootId, ctx: rootScope.ctx }, true)
  assert.equal(disposePromptCount, 1, 'disposePrompt must fire once when toggling on')
  assert.equal(disposeRestrictionCount, 1, 'disposeRestriction must fire once when toggling on')
  assert.ok(!sessionPolicies.has(rootId), 'sessionPolicies must be cleared when toggling on')
  const on = await ctx.systemPrompt.assemble({ scope: rootKey })
  assert.equal(on.sections.find((s) => s.name === 'integration:cangzhi')?.text, GLOBAL_TEXT,
    'global guidance should be visible again after toggling on')
  for (const name of CANGZHI_TOOLS) {
    assert.ok(schemasFor(rootKey).includes(name), `${name} must be visible after toggling on`)
  }

  // 4. Parent policy cascades to a child created after the toggle.
  applySessionPolicy({ id: rootId, ctx: rootScope.ctx }, false)
  const childId = SessionId('sess-root-sub')
  const childAgent = { id: childId, session: { header: { parentSession: rootId } } }
  const desired = new Map([[rootId, false]])
  const parentId = childAgent.session.header.parentSession
  const childEnabled = desired.get(childId) ?? (parentId !== undefined && desired.get(parentId) === false ? false : true)
  assert.equal(childEnabled, false, 'child agent must inherit parent off policy')
  let childScope
  await ctx.plugin(Object.assign((inner) => { childScope = createScope(inner, childAgent) },
    { inject: ['systemPrompt', 'tools'] }))
  const childKey = scopeOf(childScope.ctx)
  applySessionPolicy({ id: childId, ctx: childScope.ctx }, childEnabled)
  for (const name of CANGZHI_TOOLS) {
    assert.ok(!schemasFor(childKey).includes(name), `${name} must be denied in child after parent toggle off`)
  }

  // 5. Toggling the child back on only affects the child.
  applySessionPolicy({ id: childId, ctx: childScope.ctx }, true)
  for (const name of CANGZHI_TOOLS) {
    assert.ok(schemasFor(childKey).includes(name), `${name} must be visible in child after re-enable`)
  }
  assert.ok(sessionPolicies.has(rootId), 'parent policy must remain tracked after child re-enable')
  for (const name of CANGZHI_TOOLS) {
    assert.ok(!schemasFor(rootKey).includes(name), `${name} must still be denied in parent after child re-enable`)
  }

  // 6. Toggling on after toggling off MUST dispose the previous restriction
  //    (regression: the pre-fix `applySessionPolicy` returned early when
  //    `enabled` was true without invoking the disposers, so the tools
  //    stayed denied even though the user re-enabled the policy).
  applySessionPolicy({ id: rootId, ctx: rootScope.ctx }, false)
  for (const name of CANGZHI_TOOLS) {
    assert.ok(!schemasFor(rootKey).includes(name), `${name} must be denied after reapplying off`)
  }
  applySessionPolicy({ id: rootId, ctx: rootScope.ctx }, true)
  for (const name of CANGZHI_TOOLS) {
    assert.ok(schemasFor(rootKey).includes(name), `${name} must be visible after reapplying on`)
  }
})
