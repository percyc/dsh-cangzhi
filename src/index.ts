/** Host half of the Cangzhi DSH integration. */

import type { Context } from '@deepseek-ai/cordis'
import { createServer } from 'node:http'
import Schema from '@deepseek-ai/schemastery'
import type { CredentialRef } from '@deepseek-ai/dsh-credentials'
import type { SettingsNamespace, SettingsScope } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-client-connection'
import { createProxyHandler } from './proxy.ts'

export const name = 'cangzhi'
export const inject = ['systemPrompt', 'webServer', 'connection', 'credentials', 'settings', 'agents']

export interface Config {
  webUrl: string
  apiUrl: string
  internalMcpPort?: number
  defaultWorkspace?: string
  lockApiUrl?: boolean
  lockWebUrl?: boolean
  lockDefaultWorkspace?: boolean
}

interface ConnectionSettings {
  apiUrl: string
  webUrl: string
  defaultWorkspace: string
}

interface ConnectionLocks {
  apiUrl: boolean
  webUrl: boolean
  defaultWorkspace: boolean
}

const TOKEN_REF = 'CANGZHI_TOKEN' as CredentialRef
const WEB_ROUTE_PREFIX = '/_cangzhi'
const API_ROUTE_PREFIX = '/_dsh-cangzhi-api'
const CONTROL_ROUTE_PREFIX = '/_cangzhi-plugin'
const DEFAULT_MCP_PORT = 3081
const WORKSPACE_SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/
const SETTINGS_NAMESPACE = 'cangzhi' as SettingsNamespace
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
] as const
const ConnectionSettingsSchema: Schema<ConnectionSettings> = Schema.object({
  apiUrl: Schema.string(),
  webUrl: Schema.string(),
  defaultWorkspace: Schema.string(),
})

function upstreamUrl(value: string, name: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be an absolute http(s) URL`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must use http or https`)
  }
  if (url.username !== '' || url.password !== '') {
    throw new Error(`${name} must not contain credentials`)
  }
  url.hash = ''
  url.search = ''
  return url.toString()
}

function mcpPort(value: number | undefined): number {
  const port = value ?? DEFAULT_MCP_PORT
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error('internalMcpPort must be an integer between 1024 and 65535')
  }
  return port
}

function apiEndpoint(apiUrl: string, path: string): URL {
  const target = new URL(apiUrl)
  target.pathname = `${target.pathname.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  return target
}

function normalizeConnectionSettings(value: ConnectionSettings): ConnectionSettings {
  const defaultWorkspace = value.defaultWorkspace.trim().toLowerCase()
  if (!WORKSPACE_SLUG.test(defaultWorkspace)) {
    throw new Error('defaultWorkspace is not a valid Cangzhi workspace slug')
  }
  return {
    apiUrl: upstreamUrl(value.apiUrl, 'apiUrl'),
    webUrl: upstreamUrl(value.webUrl, 'webUrl'),
    defaultWorkspace,
  }
}

function resolveConnectionSettings(
  config: Config,
  stored: ConnectionSettings,
  locks: ConnectionLocks,
): ConnectionSettings {
  return normalizeConnectionSettings({
    apiUrl: locks.apiUrl ? config.apiUrl : stored.apiUrl,
    webUrl: locks.webUrl ? config.webUrl : stored.webUrl,
    defaultWorkspace: locks.defaultWorkspace
      ? (config.defaultWorkspace ?? 'default')
      : stored.defaultWorkspace,
  })
}

function connectionSettingsEqual(left: ConnectionSettings, right: ConnectionSettings): boolean {
  return left.apiUrl === right.apiUrl
    && left.webUrl === right.webUrl
    && left.defaultWorkspace === right.defaultWorkspace
}

function settingsStatus(
  scope: SettingsScope<ConnectionSettings>,
  active: ConnectionSettings,
  config: Config,
  locks: ConnectionLocks,
) {
  const configured = resolveConnectionSettings(config, scope.get(), locks)
  return {
    active,
    configured,
    locks,
    restartRequired: !connectionSettingsEqual(active, configured),
  }
}

async function jsonBody(req: import('node:http').IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 16_384) throw new Error('request body is too large')
    chunks.push(buffer)
  }
  const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('invalid JSON object')
  return value as Record<string, unknown>
}

const GUIDANCE = `Cangzhi is connected as the read-only knowledge system named cangzhi.
Use its mcp__cangzhi__knowledge_* tools whenever the user asks to find, inspect, compare, cite, or answer from their knowledge base.
Prefer knowledge_search for retrieval, knowledge_ask for a synthesized answer with citations, and the dataset schema/preview/query tools for structured data.
Never invent document ids, chunk ids, dataset ids, scope names, evidence, or citations. Discover them with list/search tools first, preserve returned citation metadata, and say clearly when Cangzhi is unavailable or has no supporting result.
The Cangzhi button in the DSH sidebar opens a native DSH knowledge workspace for uploads, documents, categories, spaces and processing maintenance.
The active Cangzhi workspace selected in the UI is also the workspace used by every model tool. Never claim to search another workspace unless the user switches it in the Cangzhi workspace selector first.`

export async function apply(ctx: Context, config: Config): Promise<void> {
  const baseSettings = normalizeConnectionSettings({
    apiUrl: config.apiUrl,
    webUrl: config.webUrl,
    defaultWorkspace: config.defaultWorkspace ?? 'default',
  })
  const locks: ConnectionLocks = {
    apiUrl: config.lockApiUrl ?? false,
    webUrl: config.lockWebUrl ?? false,
    defaultWorkspace: config.lockDefaultWorkspace ?? false,
  }
  const connectionSettings = ctx.settings.register(
    SETTINGS_NAMESPACE,
    ConnectionSettingsSchema,
    {
      base: baseSettings,
      applies: 'restart',
      validate: value => { normalizeConnectionSettings(value) },
    },
  )
  const activeConnection = resolveConnectionSettings(config, connectionSettings.get(), locks)
  const webUrl = activeConnection.webUrl
  const apiUrl = activeConnection.apiUrl
  const internalMcpPort = mcpPort(config.internalMcpPort)
  let activeWorkspaceSlug = activeConnection.defaultWorkspace
  const webProxy = createProxyHandler(webUrl, { allowFrames: true })
  const apiProxy = createProxyHandler(apiUrl, {
    stripPrefix: API_ROUTE_PREFIX,
    upstreamPrefix: '/api',
  })
  const mcpProxy = createProxyHandler(apiUrl, {
    headers: async () => {
      const resolved = await ctx.credentials.resolve(TOKEN_REF)
      if (resolved === undefined) throw new Error('CANGZHI_TOKEN is not configured')
      return {
        authorization: `Bearer ${resolved.value}`,
        'x-cangzhi-workspace': activeWorkspaceSlug,
      }
    },
  })
  const mcpServer = createServer((req, res) => {
    void mcpProxy(req, res).catch((error: unknown) => {
      if (res.headersSent) { res.destroy(); return }
      res.writeHead(503, { 'content-type': 'application/json; charset=utf-8', 'retry-after': '5' })
      res.end(JSON.stringify({ error: 'cangzhi_mcp_not_configured', message: error instanceof Error ? error.message : String(error) }))
    })
  })
  await new Promise<void>((resolve, reject) => {
    mcpServer.once('error', reject)
    mcpServer.listen(internalMcpPort, '127.0.0.1', () => { mcpServer.off('error', reject); resolve() })
  })
  ctx.effect(() => () => new Promise<void>(resolve => { mcpServer.close(() => resolve()) }), 'cangzhi internal mcp proxy')
  ctx.systemPrompt.section({
    name: 'integration:cangzhi',
    order: 155,
    text: GUIDANCE,
  })
  type SessionPolicy = { disposePrompt: () => void; disposeRestriction: () => void }
  const sessionPolicies = new Map<string, SessionPolicy>()
  const desiredPolicies = new Map<string, boolean>()
  const applySessionPolicy = (agent: { id: string; ctx: Context; session: { header: { parentSession?: string } } }, enabled: boolean): void => {
    const previous = sessionPolicies.get(agent.id)
    previous?.disposePrompt()
    previous?.disposeRestriction()
    sessionPolicies.delete(agent.id)
    if (enabled) return
    const disposePrompt = agent.ctx.systemPrompt.section({
      // A scoped empty section shadows the global guidance for this session.
      name: 'integration:cangzhi',
      order: 155,
      text: '',
    })
    const disposeRestriction = agent.ctx.tools.restrict({ deny: [...CANGZHI_TOOLS] })
    sessionPolicies.set(agent.id, { disposePrompt, disposeRestriction })
  }
  const propagatePolicyToChildren = (parentId: string, enabled: boolean): void => {
    const list = (ctx.agents as unknown as { list(): Array<{ id: string; session: { header: { parentSession?: string } } }> }).list()
    for (const candidate of list) {
      if (candidate.session.header.parentSession !== parentId) continue
      desiredPolicies.set(candidate.id, enabled)
      applySessionPolicy(candidate as { id: string; ctx: Context; session: { header: { parentSession?: string } } }, enabled)
    }
  }
  ctx.on('agent/created', ({ agent }) => {
    const parentId = agent.session.header.parentSession
    const inheritedFromParent = parentId !== undefined && desiredPolicies.get(parentId) === false
    const enabled = desiredPolicies.get(agent.id) ?? (inheritedFromParent ? false : true)
    desiredPolicies.set(agent.id, enabled)
    applySessionPolicy(agent, enabled)
  })
  ctx.on('agent/disposed', ({ agent }) => {
    const policy = sessionPolicies.get(agent.id)
    policy?.disposePrompt()
    policy?.disposeRestriction()
    sessionPolicies.delete(agent.id)
    desiredPolicies.delete(agent.id)
  })
  ctx.effect(() => () => {
    for (const policy of sessionPolicies.values()) {
      policy.disposePrompt()
      policy.disposeRestriction()
    }
    sessionPolicies.clear()
    desiredPolicies.clear()
  }, 'cangzhi session knowledge policy cleanup')
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: WEB_ROUTE_PREFIX,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) {
        res.writeHead(rejection, { 'cache-control': 'no-store' })
        res.end(rejection === 401 ? 'unauthorized' : 'forbidden')
        return
      }
      webProxy(req, res)
    },
  }), `cangzhi gateway: ${WEB_ROUTE_PREFIX}`)
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_ROUTE_PREFIX,
    handler: async (req, res) => {
      try {
        const rejection = ctx.connection.requestRejection(req)
        if (rejection !== undefined) {
          res.writeHead(rejection, { 'cache-control': 'no-store' })
          res.end(rejection === 401 ? 'unauthorized' : 'forbidden')
          return
        }
        await apiProxy(req, res)
      } catch (error) {
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      }
    },
  }), `cangzhi api gateway: ${API_ROUTE_PREFIX}`)
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: `${CONTROL_ROUTE_PREFIX}/status`,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) {
        res.writeHead(rejection, { 'cache-control': 'no-store' })
        res.end(rejection === 401 ? 'unauthorized' : 'forbidden')
        return
      }
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      })
      const credential = await ctx.credentials.describe(TOKEN_REF)
      res.end(JSON.stringify({
        apiConnected: true,
        mcpConfigured: credential.configured,
        toolCount: 14,
        activeWorkspace: activeWorkspaceSlug,
        connectionSettings: settingsStatus(connectionSettings, activeConnection, config, locks),
      }))
    },
  }), 'cangzhi plugin status')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: `${CONTROL_ROUTE_PREFIX}/workspace`,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'POST' }); res.end(); return }
      try {
        const body = await jsonBody(req)
        const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
        if (!WORKSPACE_SLUG.test(slug)) throw new Error('知识空间标识格式无效')
        const validationUrl = apiEndpoint(apiUrl, `/api/workspaces/${encodeURIComponent(slug)}`)
        const cookie = req.headers.cookie
        const validation = await fetch(validationUrl, {
          headers: cookie === undefined ? {} : { cookie },
        })
        if (!validation.ok) throw new Error(`知识空间不可用（HTTP ${String(validation.status)}）`)
        const workspace = await validation.json() as { status?: string }
        if (workspace.status !== 'active') throw new Error('知识空间已归档')
        activeWorkspaceSlug = slug
        res.writeHead(204, { 'cache-control': 'no-store' })
        res.end()
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      }
    },
  }), 'cangzhi workspace selection')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: `${CONTROL_ROUTE_PREFIX}/session-policy`,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method === 'GET') {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const sessionId = (url.searchParams.get('sessionId') ?? '').trim()
        if (sessionId.length === 0 || sessionId.length > 256) {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: '会话标识无效' }))
          return
        }
        const desired = desiredPolicies.get(sessionId) ?? true
        const live = (ctx.agents.get as unknown as (id: string) => { id: string } | undefined)(sessionId)
        const restricted = sessionPolicies.has(sessionId)
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ sessionId, desired, live: live !== undefined, restricted }))
        return
      }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'GET, POST' }); res.end(); return }
      try {
        const body = await jsonBody(req)
        const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : ''
        if (sessionId.length === 0 || sessionId.length > 256) throw new Error('会话标识无效')
        if (typeof body.enabled !== 'boolean') throw new Error('enabled 必须是布尔值')
        desiredPolicies.set(sessionId, body.enabled)
        const agent = (ctx.agents.get as unknown as (id: string) => { id: string; ctx: Context; session: { header: { parentSession?: string } } } | undefined)(sessionId)
        if (agent !== undefined) applySessionPolicy(agent, body.enabled)
        propagatePolicyToChildren(sessionId, body.enabled)
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ applied: agent !== undefined, sessionId, enabled: body.enabled }))
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      }
    },
  }), 'cangzhi session knowledge policy')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: `${CONTROL_ROUTE_PREFIX}/token`,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method === 'DELETE') {
        try {
          await ctx.credentials.unset(TOKEN_REF)
          res.writeHead(204, { 'cache-control': 'no-store' })
          res.end()
        } catch (error) {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
        }
        return
      }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'POST, DELETE' }); res.end(); return }
      try {
        const body = await jsonBody(req)
        const token = typeof body.token === 'string' ? body.token.trim() : ''
        if (token.length < 20 || token.length > 4096) throw new Error('访问令牌格式无效')
        const validationUrl = apiEndpoint(apiUrl, '/api/v1/knowledge/scopes')
        const validation = await fetch(validationUrl, { headers: {
          authorization: `Bearer ${token}`,
          'x-cangzhi-workspace': activeWorkspaceSlug,
        } })
        if (!validation.ok) throw new Error(`藏知拒绝了访问令牌（HTTP ${String(validation.status)}）`)
        await ctx.credentials.set(TOKEN_REF, token)
        res.writeHead(204, { 'cache-control': 'no-store' })
        res.end()
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      }
    },
  }), 'cangzhi token setup')
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: `${CONTROL_ROUTE_PREFIX}/settings/test`,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'POST' }); res.end(); return }
      try {
        const body = await jsonBody(req)
        const current = connectionSettings.get()
        const candidate = resolveConnectionSettings(config, {
          apiUrl: typeof body.apiUrl === 'string' ? body.apiUrl : current.apiUrl,
          webUrl: typeof body.webUrl === 'string' ? body.webUrl : current.webUrl,
          defaultWorkspace: typeof body.defaultWorkspace === 'string'
            ? body.defaultWorkspace
            : current.defaultWorkspace,
        }, locks)
        const readinessUrl = apiEndpoint(candidate.apiUrl, '/api/readiness')
        const readiness = await fetch(readinessUrl, { signal: AbortSignal.timeout(5_000) })
        if (!readiness.ok) throw new Error(`藏知 API readiness 返回 HTTP ${String(readiness.status)}`)
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        })
        res.end(JSON.stringify({ ok: true, apiUrl: candidate.apiUrl }))
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      }
    },
  }), 'cangzhi connection settings test')
}
