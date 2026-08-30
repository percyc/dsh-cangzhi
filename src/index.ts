/** Host half of the Cangzhi DSH integration. */

import type { Context } from '@deepseek-ai/cordis'
import { createServer } from 'node:http'
import type { CredentialRef } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-client-connection'
import { createProxyHandler } from './proxy.ts'

export const name = 'cangzhi'
export const inject = ['systemPrompt', 'webServer', 'connection', 'credentials']

export interface Config {
  webUrl: string
  apiUrl: string
  internalMcpPort?: number
  defaultWorkspace?: string
}

const TOKEN_REF = 'CANGZHI_TOKEN' as CredentialRef
const WEB_ROUTE_PREFIX = '/_cangzhi'
const API_ROUTE_PREFIX = '/_dsh-cangzhi-api'
const CONTROL_ROUTE_PREFIX = '/_cangzhi-plugin'
const DEFAULT_MCP_PORT = 3081
const WORKSPACE_SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/

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
  const webUrl = upstreamUrl(config.webUrl, 'webUrl')
  const apiUrl = upstreamUrl(config.apiUrl, 'apiUrl')
  const internalMcpPort = mcpPort(config.internalMcpPort)
  let activeWorkspaceSlug = (config.defaultWorkspace ?? 'default').trim().toLowerCase()
  if (!WORKSPACE_SLUG.test(activeWorkspaceSlug)) {
    throw new Error('defaultWorkspace is not a valid Cangzhi workspace slug')
  }
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
        const validationUrl = new URL(`/api/workspaces/${encodeURIComponent(slug)}`, apiUrl)
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
        const validationUrl = new URL('/api/v1/knowledge/scopes', apiUrl)
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
}
