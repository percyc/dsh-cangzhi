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
import type {} from '@deepseek-ai/dsh-storage'
import { createMemoryStore } from './host/session-state.mjs'
import { createDomainStore } from './host/domain-store.mjs'
import { createSessionManager } from './host/session-manager.mjs'
import { sessionStateDomainSpec } from './host/storage-open.mjs'
import { CANGZHI_TOOLS } from './host/tool-names.mjs'

export const name = 'cangzhi'
export const inject = ['systemPrompt', 'tools', 'webServer', 'connection', 'credentials', 'settings', 'agents']

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
The active Cangzhi workspace for this conversation is chosen in the Cangzhi workspace selector and is used by every model tool in this conversation. Never claim to search another workspace unless the user switches it for this conversation first.`

function validSessionId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 256
}

/** Agent shape the manager needs from the DSH registry. */
type LiveAgent = { id: string; ctx: Context; session: { header: { parentSession?: string } } }

type SessionStore = ReturnType<typeof createMemoryStore>

async function openPersistentStore(
  ctx: Context,
): Promise<{ store: SessionStore; persistence: 'domain' | 'memory'; close?: () => Promise<void> }> {
  // Cordis exposes injected services as `ctx.<key>` AND through `ctx.get(key)`.
  // Either is valid; `ctx.get('storage')` returns `undefined` when the host
  // profile does not declare the `storage` inject, so we explicitly coerce the
  // result through a presence check before calling `.domain.open(...)`.
  const storage = ctx.get('storage') as { domain?: { open: (spec: unknown) => Promise<unknown> } } | undefined
  if (storage === undefined || typeof storage.domain?.open !== 'function') {
    ctx.logger.warn('cangzhi: DSH storage hub is unavailable; per-session state will not survive a Host restart')
    return { store: createMemoryStore(), persistence: 'memory' }
  }
  try {
    const domain = await storage.domain.open(sessionStateDomainSpec()) as unknown as { table: (name: string) => unknown; close: () => Promise<void> }
    if (typeof domain.table !== 'function' || typeof domain.close !== 'function') {
      throw new Error('opened storage domain is missing the table()/close() surface')
    }
    const workspaces = domain.table('workspaces') as {
      get: (key: string) => string | undefined
      entries: () => Iterable<[string, string]>
      put: (key: string, value: string) => Promise<unknown>
      delete: (key: string) => Promise<unknown>
    }
    const policies = domain.table('policies') as {
      get: (key: string) => 'on' | 'off' | undefined
      entries: () => Iterable<[string, 'on' | 'off']>
      put: (key: string, value: 'on' | 'off') => Promise<unknown>
      delete: (key: string) => Promise<unknown>
    }
    return {
      store: createDomainStore({ workspaces, policies }) as unknown as SessionStore,
      persistence: 'domain',
      close: () => domain.close(),
    }
  } catch (error) {
    ctx.logger.warn(`cangzhi: storage-domain unavailable, using in-memory session state (will not survive restart): ${String(error)}`)
    return { store: createMemoryStore(), persistence: 'memory' }
  }
}

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
  // Process-global default used by the generic `cangzhi-mcp` bridge (degraded
  // fallback) and by sessions that pinned no workspace. Every scoped, per-session
  // tool call resolves its own workspace from the store instead, so this value is
  // NEVER a session-isolation boundary.
  let activeWorkspaceSlug = activeConnection.defaultWorkspace

  const webProxy = createProxyHandler(webUrl, { allowFrames: true })
  const apiProxy = createProxyHandler(apiUrl, {
    stripPrefix: API_ROUTE_PREFIX,
    upstreamPrefix: '/api',
  })
  const mcpProxy = createProxyHandler(apiUrl, {
    headers: async (req) => {
      const resolved = await ctx.credentials.resolve(TOKEN_REF)
      if (resolved === undefined) throw new Error('CANGZHI_TOKEN is not configured')
      const headers: Record<string, string> = {
        authorization: `Bearer ${resolved.value}`,
      }
      // Trust boundary on the per-call workspace annotation.
      // The plugin's own loopback proxy listens on 127.0.0.1 and is reachable
      // by every in-process plugin, not just our scoped override. We accept
      // three classes of caller:
      //   1. A scoped override attaches `x-cangzhi-workspace` to every call,
      //      resolved from the store for the executing session. That value is
      //      already validated against the workspace slug regex; we re-validate
      //      here so a corrupted caller cannot leak a bogus header upstream.
      //   2. The unscoped `cangzhi-mcp` bridge sends no workspace header; we
      //      fall back to the process default ONLY for callers that omit the
      //      header and only after a workspace-format check, so the unscoped
      //      bridge can still reach the same upstream the override uses.
      //   3. Any other in-process caller that omits the header gets the
      //      process default; the upstream cangzhi API still validates the
      //      workspace exists and is active for the user's PAT, so this is
      //      not a privilege escalation — it is the same surface the
      //      `cangzhi-mcp` bridge exposes to the unscoped model.
      const raw = req.headers['x-cangzhi-workspace']
      const candidate = Array.isArray(raw) ? raw[0] : raw
      if (typeof candidate === 'string' && candidate.length > 0) {
        if (!WORKSPACE_SLUG.test(candidate)) {
          throw new Error(`x-cangzhi-workspace header is not a valid workspace slug: ${candidate}`)
        }
        headers['x-cangzhi-workspace'] = candidate
      } else {
        headers['x-cangzhi-workspace'] = activeWorkspaceSlug
      }
      return headers
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

  // ---- Per-session durable state + lifecycle wiring ----
  const { store, persistence, close: closeStore } = await openPersistentStore(ctx)
  if (closeStore !== undefined) {
    ctx.effect(() => () => void closeStore(), 'cangzhi session state domain close')
  }
  const internalMcpBaseUrl = `http://127.0.0.1:${internalMcpPort}`
  const agentsFacade = {
    get: (id: string | undefined) => (ctx.agents.get as unknown as (id: string) => LiveAgent | undefined)(id as string),
    list: () => (ctx.agents as unknown as { list(): LiveAgent[] }).list(),
  } as {
    get: (id: string | undefined) => LiveAgent | undefined
    list: () => LiveAgent[]
  }
  const manager = createSessionManager({
    store,
    defaultWorkspace: activeWorkspaceSlug,
    internalMcpBaseUrl,
    agentsFacade,
    tools: ctx.tools,
    log: (message) => ctx.logger.warn(message),
  })

  ctx.on('agent/created', (payload: { agent: LiveAgent }) => manager.onAgentCreated(payload.agent))
  ctx.on('agent/disposed', (payload: { agent: LiveAgent }) => manager.onAgentDisposed(payload.agent))
  ctx.on('tools/change', () => manager.onToolsChange())
  ctx.effect(() => () => manager.disposeAll(), 'cangzhi session knowledge state cleanup')

  // Startup catch-up: the cangzhi plugin's `apply` runs whenever the host
  // loads it. The `agent/created` event only fires AFTER we subscribed, so
  // any agent already alive at this point would otherwise never get a
  // scoped override. Walk the live registry once and replay the create
  // notification for every pre-existing agent. The same applies to the
  // `tools/change` notification: the bridge may have registered its
  // `mcp__cangzhi__*` tools before the manager subscribed, so force a
  // first sweep to point existing overrides at the current global set.
  for (const live of (ctx.agents as unknown as { list(): LiveAgent[] }).list()) {
    manager.onAgentCreated(live)
  }
  manager.onToolsChange()

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
        toolCount: CANGZHI_TOOLS.length,
        activeWorkspace: activeWorkspaceSlug,
        sessionIsolation: true,
        persistence,
        connectionSettings: settingsStatus(connectionSettings, activeConnection, config, locks),
      }))
    },
  }), 'cangzhi plugin status')

  const badRequest = (res: import('node:http').ServerResponse, message: string) => {
    res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end(JSON.stringify({ error: message }))
  }
  const writeJson = (res: import('node:http').ServerResponse, value: unknown) => {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end(JSON.stringify(value))
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: `${CONTROL_ROUTE_PREFIX}/workspace`,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method === 'GET') {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const sessionId = url.searchParams.get('sessionId') ?? ''
        if (!validSessionId(sessionId)) {
          badRequest(res, '会话标识无效：workspace 查询必须显式携带 sessionId')
          return
        }
        const resolved = manager.resolveWorkspaceFor(sessionId)
        const policy = manager.resolvePolicyFor(sessionId)
        writeJson(res, {
          sessionId,
          workspace: resolved.workspace,
          bound: resolved.bound,
          degraded: !resolved.bound,
          policy: policy.policy,
          persistence,
        })
        return
      }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'GET, POST' }); res.end(); return }
      try {
        const body = await jsonBody(req)
        const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
        const processDefault = body.processDefault === true
        if (!processDefault && !validSessionId(body.sessionId)) {
          badRequest(res, '请显式携带 sessionId；未绑定会话时不提供进程级空间切换')
          return
        }
        if (!WORKSPACE_SLUG.test(slug)) throw new Error('知识空间标识格式无效')
        const validationUrl = apiEndpoint(apiUrl, `/api/workspaces/${encodeURIComponent(slug)}`)
        const cookie = req.headers.cookie
        const validation = await fetch(validationUrl, {
          headers: cookie === undefined ? {} : { cookie },
        })
        if (!validation.ok) throw new Error(`知识空间不可用（HTTP ${String(validation.status)}）`)
        const workspace = await validation.json() as { status?: string }
        if (workspace.status !== 'active') throw new Error('知识空间已归档')
        if (processDefault) {
          // Explicitly annotated process-level mutation (degraded, not isolated).
          activeWorkspaceSlug = slug
          res.writeHead(204, { 'cache-control': 'no-store' })
          res.end()
          return
        }
        const sessionId = body.sessionId as string
        const applied = await manager.setWorkspace(sessionId, slug)
        if (!applied) throw new Error('知识空间标识无效')
        res.writeHead(204, { 'cache-control': 'no-store' })
        res.end()
      } catch (error) {
        badRequest(res, error instanceof Error ? error.message : String(error))
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
        const sessionId = url.searchParams.get('sessionId') ?? ''
        if (!validSessionId(sessionId)) {
          badRequest(res, '会话标识无效')
          return
        }
        const policy = manager.resolvePolicyFor(sessionId)
        const agent = agentsFacade.get(sessionId)
        writeJson(res, {
          sessionId,
          enabled: policy.policy === 'on',
          desired: policy.policy,
          live: agent !== undefined,
          restricted: policy.policy === 'off',
          bound: policy.bound,
        })
        return
      }
      if (req.method !== 'POST') { res.writeHead(405, { allow: 'GET, POST' }); res.end(); return }
      try {
        const body = await jsonBody(req)
        const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : ''
        if (!validSessionId(sessionId)) throw new Error('会话标识无效')
        if (typeof body.enabled !== 'boolean') throw new Error('enabled 必须是布尔值')
        const applied = await manager.setPolicy(sessionId, body.enabled ? 'on' : 'off')
        if (!applied) throw new Error('策略未生效')
        writeJson(res, { applied: true, sessionId, enabled: body.enabled, persistence })
      } catch (error) {
        badRequest(res, error instanceof Error ? error.message : String(error))
      }
    },
  }), 'cangzhi session knowledge policy')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: `${CONTROL_ROUTE_PREFIX}/session-state`,
    handler: async (req, res) => {
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) { res.writeHead(rejection); res.end(); return }
      if (req.method !== 'GET') { res.writeHead(405, { allow: 'GET' }); res.end(); return }
      const url = new URL(req.url ?? '/', 'http://localhost')
      const sessionId = (url.searchParams.get('sessionId') ?? '').trim()
      if (!validSessionId(sessionId)) {
        badRequest(res, '会话标识无效')
        return
      }
      const ws = manager.resolveWorkspaceFor(sessionId)
      const pol = manager.resolvePolicyFor(sessionId)
      writeJson(res, {
        sessionId,
        workspace: ws.workspace,
        workspaceBound: ws.bound,
        policy: pol.policy,
        policyBound: pol.bound,
        degraded: !ws.bound,
        live: agentsFacade.get(sessionId) !== undefined,
        persistence,
      })
    },
  }), 'cangzhi session state')

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
          badRequest(res, error instanceof Error ? error.message : String(error))
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
        badRequest(res, error instanceof Error ? error.message : String(error))
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
        writeJson(res, { ok: true, apiUrl: candidate.apiUrl })
      } catch (error) {
        badRequest(res, error instanceof Error ? error.message : String(error))
      }
    },
  }), 'cangzhi connection settings test')
}
