/** Browser half: full Cangzhi console plus replay-stable MCP tool cards. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client'
import type {
  ConversationNodeContext, ConversationNodeDefinition,
} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatConversationViewNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './Cangzhi.module.css'
import {
  WORKBENCH_SIZE_MIN,
  WORKBENCH_SIZE_MAX,
  WORKBENCH_SIZE_TABLE,
  clampWorkbenchWidth,
  readWorkbenchWidthFromStorage,
} from './lib/workbench-size.mjs'
import {
  answerEvidence as answerEvidenceShared,
  collectStructuredEvidence,
  dedupeEvidenceLinks,
  evidenceFromToolResult,
  formatEvidenceLink,
  idNumber,
  suppressCatalogHints,
} from './lib/evidence.mjs'
import {
  buildMarkdownLabels,
  normalizeEvidenceMarkdown,
  shouldRenderFormattedMarkdown,
  truncateEvidenceMarkdown,
} from './lib/markdown-preview.mjs'

const NS = 'cangzhi'
const API = '/_dsh-cangzhi-api'
const TOOL_PREFIX = 'mcp__cangzhi__'

const RAW_TOOLS = [
  'knowledge_list_scopes',
  'knowledge_list_facets',
  'knowledge_list_documents',
  'knowledge_search',
  'knowledge_ask',
  'knowledge_get_document',
  'knowledge_get_chunk',
  'knowledge_list_datasets',
  'knowledge_get_dataset_schema',
  'knowledge_preview_dataset_rows',
  'knowledge_query_dataset',
  'knowledge_get_evidence_by_chunk',
  'knowledge_get_evidence_by_dataset',
  'knowledge_preview_evidence_rows',
] as const

const zh = {
  footer: '藏知',
  consoleTitle: '藏知管理中心',
  close: '关闭',
  frameHint: 'DSH 原生知识工作台',
  running: '执行中…',
  done: '已完成',
  failed: '调用失败',
  items: '{{count}} 项',
  inspect: '检查调用',
  details: '查看原始结果',
  healthChecking: '正在检查藏知服务',
  healthOk: '藏知服务正常',
  healthWarning: '藏知有项目需要处理',
  healthError: '藏知服务异常',
  healthMcpMissing: '模型检索尚未配置 PAT',
  healthProcessingFailed: '{{count}} 份资料处理失败',
  healthStorageHigh: '存储已使用 {{percent}}%',
  healthDatabase: '数据库状态：{{status}}',
  healthSystemUnavailable: '无法读取服务器状态',
  popoverTitle: '藏知知识能力',
  popoverClose: '关闭',
  popoverStatus: '服务状态',
  popoverStatusOnline: '已连接',
  popoverStatusOffline: '未连接',
  popoverPolicy: '本对话使用藏知',
  popoverPolicyHint: '控制本对话是否允许模型调用藏知知识工具。关闭后，模型不会看到或调用藏知工具。',
  popoverPolicyOff: '关闭',
  popoverPolicyOn: '开启',
  popoverPolicyOffHint: '关闭后，从下一次模型步骤开始不再提供藏知工具。',
  popoverPolicyOnHint: '开启后，本对话可以按需调用藏知工具。',
  popoverPolicyHostError: '未能在 DSH 中应用本对话的藏知策略，请稍后重试。',
  popoverWorkspace: '当前知识空间',
  popoverWorkspaceHint: '切换后模型工具立即使用新空间',
  popoverLoginFailed: '登录失败，请检查账号密码后重试',
  popoverScopeNote: '仅对当前对话生效',
  popoverScopeGlobal: '当前没有可绑定的对话',
  popoverConnect: '启用模型检索',
  popoverDisconnect: '断开 DSH 对话连接',
  popoverOpenLibrary: '打开资料抽屉',
  popoverOpenConsole: '打开管理中心',
  popoverLoginTitle: '登录藏知',
  popoverLoginHint: '登录后才能选择知识空间、上传和管理资料。',
  popoverUsername: '藏知用户名',
  popoverPassword: '密码',
  popoverSubmitLogin: '登录并连接',
  popoverLoggingIn: '登录中…',
  popoverScopeBadge: '本对话设置',
  popoverScopeBadgeGlobal: '进程共享',
  popoverHeaderHint: '页面与模型工具会同步切换知识空间',
  dockEntry: '知识',
  homeEntry: '藏知知识',
  homeEntryHint: '点击管理知识能力、空间与资料',
  homeEntryLogin: '点击登录并连接藏知',
  settingsTab: '藏知',
  settingsTitle: '藏知连接',
  settingsDescription: '配置 DSH 使用的藏知服务地址和默认知识空间。访问令牌仍由 DSH 凭据存储单独管理。',
  settingsApiUrl: 'API 地址',
  settingsApiHint: '藏知 REST API 与 MCP 服务的基础地址。',
  settingsWebUrl: 'Web 地址',
  settingsWebHint: '藏知管理页面的基础地址。',
  settingsWorkspace: '默认知识空间',
  settingsWorkspaceHint: 'DSH 启动时使用的空间标识；当前空间仍可在会话中切换。',
  settingsManaged: '由管理员环境变量锁定',
  settingsRestart: '保存后需要重启 DSH 才会切换连接。',
  settingsRestartPending: '配置已保存，当前进程仍在使用旧连接，请重启 DSH。',
  settingsSave: '保存配置',
  settingsSaving: '正在保存…',
  settingsSaved: '配置已保存。',
  settingsSaveFailed: '保存失败，请稍后重试或检查配置格式。',
  settingsTest: '测试连接',
  settingsTesting: '正在测试…',
  settingsTestOk: '藏知 API 连接正常。',
  settingsTestFailed: '连接测试失败',
  settingsInvalidUrl: '请输入不含账号密码的绝对 HTTP(S) 地址。',
  settingsInvalidWorkspace: '空间标识只能使用小写字母、数字和连字符，最长 64 个字符。',
  settingsUnavailable: '当前 DSH 未提供可写的设置存储。',
  tools: {
    knowledge_list_scopes: '知识范围',
    knowledge_list_facets: '知识分类',
    knowledge_list_documents: '文档列表',
    knowledge_search: '知识搜索',
    knowledge_ask: '知识问答',
    knowledge_get_document: '读取文档',
    knowledge_get_chunk: '读取片段',
    knowledge_list_datasets: '数据集列表',
    knowledge_get_dataset_schema: '数据集结构',
    knowledge_preview_dataset_rows: '预览数据集',
    knowledge_query_dataset: '查询数据集',
    knowledge_get_evidence_by_chunk: '片段证据',
    knowledge_get_evidence_by_dataset: '数据集证据',
    knowledge_preview_evidence_rows: '预览证据',
  },
}

const en = {
  footer: '藏知',
  consoleTitle: '藏知管理中心',
  close: 'Close',
  frameHint: 'Native knowledge workspace for DSH',
  running: 'Running…',
  done: 'Completed',
  failed: 'Call failed',
  items: '{{count}} items',
  inspect: 'Inspect call',
  details: 'Show raw result',
  healthChecking: 'Checking Cangzhi services',
  healthOk: 'Cangzhi services are healthy',
  healthWarning: 'Cangzhi needs attention',
  healthError: 'Cangzhi services are unavailable',
  healthMcpMissing: 'Model retrieval PAT is not configured',
  healthProcessingFailed: '{{count}} documents failed processing',
  healthStorageHigh: 'Storage is {{percent}}% used',
  healthDatabase: 'Database status: {{status}}',
  healthSystemUnavailable: 'Unable to read server status',
  popoverTitle: 'Cangzhi knowledge',
  popoverClose: 'Close',
  popoverStatus: 'Service status',
  popoverStatusOnline: 'Connected',
  popoverStatusOffline: 'Not connected',
  popoverPolicy: 'Use Cangzhi in this conversation',
  popoverPolicyHint: 'Controls whether this conversation may call Cangzhi knowledge tools. When off, the model cannot see or call them.',
  popoverPolicyOff: 'Off',
  popoverPolicyOn: 'On',
  popoverPolicyOffHint: 'After the next model step, Cangzhi tools will no longer be offered.',
  popoverPolicyOnHint: 'This conversation may call Cangzhi tools when useful.',
  popoverPolicyHostError: 'Cangzhi could not apply this conversation policy in DSH. Try again.',
  popoverWorkspace: 'Active knowledge workspace',
  popoverWorkspaceHint: 'The new selection is used by the next MCP call immediately.',
  popoverLoginFailed: 'Login failed. Check your username and password and try again.',
  popoverScopeNote: 'Applies only to this conversation',
  popoverScopeGlobal: 'No conversation is selected',
  popoverConnect: 'Enable model retrieval',
  popoverDisconnect: 'Disconnect DSH conversation',
  popoverOpenLibrary: 'Open material drawer',
  popoverOpenConsole: 'Open management console',
  popoverLoginTitle: 'Sign in to Cangzhi',
  popoverLoginHint: 'Sign in to pick a workspace, upload and manage knowledge.',
  popoverUsername: 'Cangzhi username',
  popoverPassword: 'Password',
  popoverSubmitLogin: 'Sign in & connect',
  popoverLoggingIn: 'Signing in…',
  popoverScopeBadge: 'Conversation setting',
  popoverScopeBadgeGlobal: 'Process shared',
  popoverHeaderHint: 'The page and the model tools switch knowledge workspaces together',
  dockEntry: 'Knowledge',
  homeEntry: 'Cangzhi knowledge',
  homeEntryHint: 'Click to manage knowledge capability, workspaces and materials',
  homeEntryLogin: 'Click to sign in and connect Cangzhi',
  settingsTab: 'Cangzhi',
  settingsTitle: 'Cangzhi connection',
  settingsDescription: 'Configure the Cangzhi services and default workspace used by DSH. Access tokens remain in the separate DSH credential store.',
  settingsApiUrl: 'API URL',
  settingsApiHint: 'Base URL for the Cangzhi REST API and MCP service.',
  settingsWebUrl: 'Web URL',
  settingsWebHint: 'Base URL for the Cangzhi management site.',
  settingsWorkspace: 'Default workspace',
  settingsWorkspaceHint: 'Workspace slug used when DSH starts; the active workspace can still be changed in a conversation.',
  settingsManaged: 'Locked by an administrator environment variable',
  settingsRestart: 'Restart DSH after saving to activate the new connection.',
  settingsRestartPending: 'Settings are saved, but this process still uses the old connection. Restart DSH.',
  settingsSave: 'Save settings',
  settingsSaving: 'Saving…',
  settingsSaved: 'Settings saved.',
  settingsSaveFailed: 'Save failed. Retry later or check the configuration format.',
  settingsTest: 'Test connection',
  settingsTesting: 'Testing…',
  settingsTestOk: 'The Cangzhi API is reachable.',
  settingsTestFailed: 'Connection test failed',
  settingsInvalidUrl: 'Enter an absolute HTTP(S) URL without a username or password.',
  settingsInvalidWorkspace: 'Use lowercase letters, numbers, and hyphens, up to 64 characters.',
  settingsUnavailable: 'This DSH instance does not provide writable settings storage.',
  tools: {
    knowledge_list_scopes: 'Knowledge scopes',
    knowledge_list_facets: 'Knowledge facets',
    knowledge_list_documents: 'Documents',
    knowledge_search: 'Knowledge search',
    knowledge_ask: 'Knowledge answer',
    knowledge_get_document: 'Read document',
    knowledge_get_chunk: 'Read chunk',
    knowledge_list_datasets: 'Datasets',
    knowledge_get_dataset_schema: 'Dataset schema',
    knowledge_preview_dataset_rows: 'Preview dataset',
    knowledge_query_dataset: 'Query dataset',
    knowledge_get_evidence_by_chunk: 'Chunk evidence',
    knowledge_get_evidence_by_dataset: 'Dataset evidence',
    knowledge_preview_evidence_rows: 'Preview evidence',
  },
}

type CangzhiLocaleKey = Exclude<keyof typeof zh, 'tools'> | `tools.${keyof typeof zh.tools}`

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    cangzhi: CangzhiLocaleKey
  }
}

interface ConsoleSnapshot {
  readonly open: boolean
  readonly knowledgeOpen: boolean
}

interface ConsoleSource {
  getSnapshot(): ConsoleSnapshot
  subscribe(listener: () => void): () => void
}

interface ConsoleFace {
  hooks: { cangzhiConsole: ConsoleSource }
  currentSessionId(): string | undefined
  subscribeSession(listener: () => void): () => void
  openConsole(): void
  closeConsole(): void
  openKnowledge(): void
  closeKnowledge(): void
}

function createConsoleFace(ctx: ClientContext): ConsoleFace {
  let snapshot: ConsoleSnapshot = { open: false, knowledgeOpen: false }
  const listeners = new Set<() => void>()
  const publish = (next: ConsoleSnapshot): void => {
    if (next.open === snapshot.open && next.knowledgeOpen === snapshot.knowledgeOpen) return
    snapshot = next
    for (const listener of listeners) listener()
  }
  const source: ConsoleSource = {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
  return {
    hooks: { cangzhiConsole: source },
    currentSessionId: () => ctx.sessions.list.getSnapshot().current,
    subscribeSession: listener => ctx.sessions.list.subscribe(listener),
    openConsole: () => { publish({ open: true, knowledgeOpen: false }) },
    closeConsole: () => { publish({ ...snapshot, open: false }) },
    openKnowledge: () => { publish({ open: false, knowledgeOpen: true }) },
    closeKnowledge: () => { publish({ ...snapshot, knowledgeOpen: false }) },
  }
}

function CangzhiMark({ size, className }: { size: number; className?: string }) {
  return <span className={`${css.cangzhiMark} ${className ?? ''}`} style={{ width: size, height: size, fontSize: Math.max(13, size * .55) }}>知</span>
}

function setWorkspaceCookie(slug: string): void {
  document.cookie = `cangzhi_workspace=${encodeURIComponent(slug)}; Path=/; Max-Age=31536000; SameSite=Lax`
}

async function syncModelWorkspace(slug: string): Promise<void> {
  const response = await fetch('/_cangzhi-plugin/workspace', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ slug }),
  })
  if (!response.ok) throw new Error(await errorMessage(response, '模型知识空间切换失败'))
  window.dispatchEvent(new CustomEvent('cangzhi-workspace-changed', { detail: { slug } }))
}

type KnowledgePolicy = 'off' | 'on'

const POLICY_VALUES: readonly KnowledgePolicy[] = ['off', 'on']
const POLICY_STORAGE_PREFIX = 'cangzhi:session:'
const POLICY_EVENT = 'cangzhi-policy-changed'

function isKnowledgePolicy(value: unknown): value is KnowledgePolicy {
  return typeof value === 'string' && (POLICY_VALUES as readonly string[]).includes(value)
}

function loadSessionKey(): string {
  let stored: string | null = null
  try { stored = window.localStorage.getItem(`${POLICY_STORAGE_PREFIX}key`) } catch { /* storage may be unavailable */ }
  if (typeof stored === 'string' && stored.length > 0 && stored.length <= 128) return stored
  const generated = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  try { window.localStorage.setItem(`${POLICY_STORAGE_PREFIX}key`, generated) } catch { /* storage may be unavailable */ }
  return generated
}

function loadPolicy(sessionKey: string): KnowledgePolicy {
  let value: string | null = null
  try { value = window.localStorage.getItem(`${POLICY_STORAGE_PREFIX}${sessionKey}:policy`) } catch { /* storage may be unavailable */ }
  return isKnowledgePolicy(value) ? value : 'on'
}

function savePolicy(sessionKey: string, policy: KnowledgePolicy): void {
  try { window.localStorage.setItem(`${POLICY_STORAGE_PREFIX}${sessionKey}:policy`, policy) } catch { /* storage may be unavailable */ }
  window.dispatchEvent(new CustomEvent(POLICY_EVENT, { detail: { sessionKey, policy } }))
}

interface KnowledgeSessionState {
  readonly sessionKey: string
  readonly policy: KnowledgePolicy
  readonly scope: 'conversation' | 'process'
  setPolicy(next: KnowledgePolicy): Promise<{ applied: boolean }>
}

/**
 * Per-conversation knowledge policy. The browser keeps the last choice for
 * the DSH session id, while the Host applies the actual scoped prompt/tool
 * restriction. A root-level surface has no session id and is only a visual
 * fallback; the session header and dock are the authoritative controls.
 */
function useKnowledgeSession(sessionId?: string): KnowledgeSessionState {
  const [sessionKey, setSessionKey] = useState<string>(() => sessionId ?? loadSessionKey())
  const [policy, setPolicyState] = useState<KnowledgePolicy>(() => loadPolicy(sessionKey))
  useEffect(() => {
    const nextKey = sessionId ?? loadSessionKey()
    setSessionKey(nextKey)
    setPolicyState(loadPolicy(nextKey))
  }, [sessionId])
  useEffect(() => {
    const refresh = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionKey?: string; policy?: KnowledgePolicy }>).detail
      if (detail?.sessionKey !== undefined && detail.sessionKey !== sessionKey) return
      setPolicyState(loadPolicy(sessionKey))
    }
    const storage = (event: StorageEvent) => {
      if (sessionId === undefined && event.key === `${POLICY_STORAGE_PREFIX}key`) {
        const next = loadSessionKey()
        setSessionKey(next)
        setPolicyState(loadPolicy(next))
      } else if (event.key !== null && event.key.endsWith(':policy')) {
        setPolicyState(loadPolicy(sessionKey))
      }
    }
    window.addEventListener(POLICY_EVENT, refresh)
    window.addEventListener('storage', storage)
    return () => {
      window.removeEventListener(POLICY_EVENT, refresh)
      window.removeEventListener('storage', storage)
    }
  }, [sessionId, sessionKey])
  const setPolicy = async (next: KnowledgePolicy): Promise<{ applied: boolean }> => {
    if (next === policy) return { applied: true }
    if (sessionId === undefined) {
      setPolicyState(next)
      savePolicy(sessionKey, next)
      return { applied: true }
    }
    try {
      const response = await fetch('/_cangzhi-plugin/session-policy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, enabled: next === 'on' }),
      })
      if (!response.ok) throw new Error(`host returned HTTP ${String(response.status)}`)
      const body = await response.json().catch(() => null) as { applied?: boolean } | null
      // Commit the local state and storage only after the host has accepted the
      // change. Optimistic updates would risk a "false close": the toggle reads
      // off, but the model can still call Cangzhi tools because the host never
      // applied the restriction. The popover surfaces host failures through
      // `cangzhi-policy-failed`, and the toggle stays on the previous value so
      // the user can see the model-side state did not change.
      setPolicyState(next)
      savePolicy(sessionKey, next)
      return { applied: body?.applied === true }
    } catch (caught) {
      window.dispatchEvent(new CustomEvent('cangzhi-policy-failed', {
        detail: { sessionKey, sessionId, requested: next, error: caught instanceof Error ? caught.message : String(caught) },
      }))
      throw caught
    }
  }
  return { sessionKey, policy, scope: sessionId === undefined ? 'process' : 'conversation', setPolicy }
}

interface KnowledgePopoverProps {
  sessionId?: string
  anchor: HTMLElement | null
  auth: AuthState | null
  plugin: PluginStatus | null
  workspace: Workspace | null
  workspaces: Workspace[]
  onClose(): void
  onLogin(username: string, password: string): Promise<void>
  onConnect(): Promise<void>
  onDisconnect(): Promise<void>
  onSwitchWorkspace(slug: string): Promise<void>
  onOpenLibrary(): void
  onOpenConsole(): void
  busy: boolean
  notice: string
  t: (key: string, params?: Record<string, string | number>) => string
}

function KnowledgePopover(props: KnowledgePopoverProps) {
  const { sessionId, anchor, auth, plugin, workspace, workspaces, onClose, onLogin, onConnect, onDisconnect, onSwitchWorkspace, onOpenLibrary, onOpenConsole, busy, notice, t } = props
  const session = useKnowledgeSession(sessionId)
  const [position, setPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null)
  const [loginPending, setLoginPending] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [policyError, setPolicyError] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (anchor === null) { setPosition(null); return }
    const update = () => {
      const rect = anchor.getBoundingClientRect()
      const panelWidth = 320
      const panelHeight = popoverRef.current?.offsetHeight ?? 440
      const margin = 8
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const desiredCenter = rect.left + rect.width / 2 - panelWidth / 2
      const left = Math.min(Math.max(margin, desiredCenter), Math.max(margin, viewportWidth - panelWidth - margin))
      const spaceBelow = viewportHeight - rect.bottom - margin
      const spaceAbove = rect.top - margin
      const minBottomSpace = 240
      const useBottom = spaceBelow >= Math.min(panelHeight, minBottomSpace) || spaceBelow >= spaceAbove
      const placement: 'top' | 'bottom' = useBottom ? 'bottom' : 'top'
      let top: number
      if (placement === 'bottom') {
        top = Math.min(rect.bottom + 6, Math.max(margin, viewportHeight - panelHeight - margin))
      } else {
        // Top placement applies translateY(-100%); the popover's bottom is `top`,
        // its top is `top - panelHeight`. Clamp so the popover never leaves the viewport.
        top = Math.max(panelHeight + margin, rect.top - 6)
      }
      setPosition({ top, left, placement })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchor])

  useEffect(() => {
    if (anchor === null) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (target === null) return
      if (popoverRef.current?.contains(target)) return
      if (anchor.contains(target)) return
      onClose()
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    const onPolicyFailed = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionKey?: string; error?: string }>).detail
      if (detail?.sessionKey !== undefined && detail.sessionKey !== session.sessionKey) return
      setPolicyError(detail?.error ?? t('popoverPolicyHostError'))
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('cangzhi-policy-failed', onPolicyFailed)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('cangzhi-policy-failed', onPolicyFailed)
    }
  }, [anchor, onClose, session.sessionKey, t])

  if (anchor === null || position === null) return null

  const statusOk = Boolean(plugin?.mcpConfigured)
  const statusText = statusOk ? t('popoverStatusOnline') : t('popoverStatusOffline')
  const policyOptions: ReadonlyArray<{ value: KnowledgePolicy; label: string; hint: string }> = [
    { value: 'off', label: t('popoverPolicyOff'), hint: t('popoverPolicyOffHint') },
    { value: 'on', label: t('popoverPolicyOn'), hint: t('popoverPolicyOnHint') },
  ]
  const policyHint = policyOptions.find(option => option.value === session.policy)?.hint ?? ''
  const showLogin = auth !== null && !auth.authenticated

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoginPending(true); setLoginError('')
    try { await onLogin(username, password) }
    catch (caught) { setLoginError(caught instanceof Error ? caught.message : t('popoverLoginFailed')) }
    finally { setLoginPending(false) }
  }

  const handlePolicyChange = (next: KnowledgePolicy) => {
    if (next === session.policy) return
    setPolicyError('')
    void session.setPolicy(next).catch((caught: unknown) => {
      setPolicyError(caught instanceof Error ? caught.message : t('popoverPolicyHostError'))
    })
  }

  return (
    <div
      ref={popoverRef}
      className={css.knowledgePopover}
      data-placement={position.placement}
      role="dialog"
      aria-label={t('popoverTitle')}
      style={{ top: position.top, left: position.left }}
    >
      <header className={css.popoverHeader}>
        <CangzhiMark size={22} />
        <strong>{t('popoverTitle')}</strong>
        <span className={css.popoverScopeBadge} data-global={String(session.scope === 'process')}>
          {session.scope === 'conversation' ? t('popoverScopeBadge') : t('popoverScopeBadgeGlobal')}
        </span>
        <button type="button" className={css.popoverClose} aria-label={t('popoverClose')} onClick={onClose}>×</button>
      </header>

      <section className={css.popoverRow}>
        <span className={css.popoverLabel}>{t('popoverStatus')}</span>
        <span className={css.popoverStatus} data-ok={String(statusOk)}><i />{statusText}</span>
      </section>

      <section className={css.popoverBlock}>
        <div className={css.popoverBlockTitle}>
          <strong>{t('popoverPolicy')}</strong>
          <small>{t('popoverPolicyHint')}</small>
        </div>
        <div className={css.popoverSegmented} role="radiogroup" aria-label={t('popoverPolicy')}>
          {policyOptions.map(option => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={session.policy === option.value}
              data-active={String(session.policy === option.value)}
              onClick={() => handlePolicyChange(option.value)}
            >{option.label}</button>
          ))}
        </div>
        <p className={css.popoverHint}>{policyHint}</p>
        {policyError && <p className={css.popoverHint} role="alert" data-state="error">{policyError}</p>}
        <p className={css.popoverScopeNote}>{session.scope === 'conversation' ? t('popoverScopeNote') : t('popoverScopeGlobal')}</p>
      </section>

      {showLogin ? (
        <form className={css.popoverLogin} onSubmit={handleLogin}>
          <strong>{t('popoverLoginTitle')}</strong>
          <small>{t('popoverLoginHint')}</small>
          <input value={username} onChange={event => setUsername(event.target.value)} placeholder={t('popoverUsername')} autoComplete="username" required />
          <input value={password} onChange={event => setPassword(event.target.value)} placeholder={t('popoverPassword')} type="password" autoComplete="current-password" required />
          {loginError && <p className={css.popoverHint} role="alert">{loginError}</p>}
          <button type="submit" disabled={loginPending || busy}>{loginPending || busy ? t('popoverLoggingIn') : t('popoverSubmitLogin')}</button>
        </form>
      ) : (
        auth?.authenticated === true && (
          <section className={css.popoverBlock}>
            <div className={css.popoverBlockTitle}>
              <strong>{t('popoverWorkspace')}</strong>
              <small>{t('popoverWorkspaceHint')}</small>
            </div>
            <label className={css.popoverWorkspace}>
              <CangzhiMark size={16} />
              <select
                value={workspace?.slug ?? ''}
                disabled={busy || workspaces.filter(item => item.status === 'active').length === 0}
                onChange={event => void onSwitchWorkspace(event.target.value)}
              >
                {workspaces.filter(item => item.status === 'active').map(item => (
                  <option key={item.id} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </label>
          </section>
        )
      )}

      {auth?.authenticated === true && !statusOk && (
        <button className={css.popoverAction} type="button" disabled={busy} onClick={() => void onConnect()}>{t('popoverConnect')}</button>
      )}
      {auth?.authenticated === true && statusOk && (
        <button className={css.popoverActionGhost} type="button" disabled={busy} onClick={() => void onDisconnect()}>{t('popoverDisconnect')}</button>
      )}

      {notice && <p className={css.popoverNotice} role="status">{notice}</p>}

      <footer className={css.popoverFooter}>
        <button type="button" onClick={onOpenLibrary} disabled={!auth?.authenticated}>{t('popoverOpenLibrary')}</button>
        <button type="button" onClick={onOpenConsole}>{t('popoverOpenConsole')}</button>
      </footer>
    </div>
  )
}


type HomeIntegrationProps = InjectFace<ConsoleFace> & PropsLocale<typeof NS>

function HomeIntegration({ hooks, openConsole, openKnowledge, t }: HomeIntegrationProps) {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [plugin, setPlugin] = useState<PluginStatus | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const sessionId = useSyncExternalStore(hooks.cangzhiConsole.subscribeSession, hooks.cangzhiConsole.currentSessionId)

  const load = async () => {
    const [authResponse, pluginResponse] = await Promise.all([
      fetch(`${API}/auth/status`, { credentials: 'include', cache: 'no-store' }),
      fetch('/_cangzhi-plugin/status', { cache: 'no-store' }),
    ])
    const authValue = await authResponse.json() as AuthState
    setAuth(authValue)
    if (pluginResponse.ok) setPlugin(await pluginResponse.json() as PluginStatus)
    if (!authValue.authenticated) return
    const [workspaceResponse, workspacesResponse] = await Promise.all([
      fetch(`${API}/workspaces/current`, { credentials: 'include', cache: 'no-store' }),
      fetch(`${API}/workspaces`, { credentials: 'include', cache: 'no-store' }),
    ])
    if (!workspaceResponse.ok || !workspacesResponse.ok) return
    const currentWorkspace = await workspaceResponse.json() as Workspace
    setWorkspace(currentWorkspace)
    setWorkspaces(await workspacesResponse.json() as Workspace[])
    await syncModelWorkspace(currentWorkspace.slug)
  }
  useEffect(() => { void load().catch(() => { setNotice('藏知服务暂时不可用') }) }, [])

  const login = async (username: string, password: string): Promise<void> => {
    setBusy(true); setNotice('')
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) { setBusy(false); throw new Error(await errorMessage(response, '登录失败')) }
    if (plugin?.mcpConfigured) { setNotice('登录成功，藏知对话已经连接'); setBusy(false); await load(); return }
    setNotice('正在创建 DSH 专用访问令牌…')
    const tokenResponse = await fetch(`${API}/access-tokens`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'DSH 对话插件', scopes: ['knowledge:read', 'knowledge:search', 'knowledge:ask'] }),
    })
    if (!tokenResponse.ok) { setNotice(await errorMessage(tokenResponse, '令牌创建失败')); setBusy(false); return }
    const { token } = await tokenResponse.json() as { token: string }
    const setup = await fetch('/_cangzhi-plugin/token', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }),
    })
    setNotice(setup.ok ? '连接成功，藏知工具正在自动上线' : await errorMessage(setup, 'DSH 凭据写入失败'))
    setBusy(false); await load()
  }
  const connect = async () => {
    setBusy(true); setNotice('正在创建 DSH 专用访问令牌…')
    const tokenResponse = await fetch(`${API}/access-tokens`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'DSH 对话插件', scopes: ['knowledge:read', 'knowledge:search', 'knowledge:ask'] }),
    })
    if (!tokenResponse.ok) { setNotice(await errorMessage(tokenResponse, '令牌创建失败')); setBusy(false); return }
    const { token } = await tokenResponse.json() as { token: string }
    const setup = await fetch('/_cangzhi-plugin/token', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }),
    })
    setNotice(setup.ok ? '连接成功，藏知工具正在自动上线' : await errorMessage(setup, 'DSH 凭据写入失败'))
    setBusy(false); await load()
  }
  const disconnect = async () => {
    setBusy(true)
    const response = await fetch('/_cangzhi-plugin/token', { method: 'DELETE' })
    setNotice(response.ok ? '已断开 DSH 对话连接' : await errorMessage(response, '断开失败'))
    setBusy(false); await load()
  }
  const switchWorkspace = async (slug: string) => {
    const next = workspaces.find(item => item.slug === slug)
    if (next === undefined || next.slug === workspace?.slug) return
    setBusy(true); setNotice('正在切换知识空间…')
    try {
      setWorkspaceCookie(next.slug)
      await syncModelWorkspace(next.slug)
      setWorkspace(next)
      setNotice(`已切换到"${next.name}"，新会话将使用这个空间`)
      await load()
    } catch (caught) { setNotice(caught instanceof Error ? caught.message : '知识空间切换失败') }
    finally { setBusy(false) }
  }

  if (auth === null) {
    return <section className={css.homeIntegration}><div className={css.homeLoading}>正在连接藏知知识库…</div></section>
  }

  const statusOk = Boolean(plugin?.mcpConfigured)
  const authed = auth.authenticated
  const triggerLabel = !authed
    ? t('homeEntryLogin')
    : statusOk
      ? (workspace?.name ?? t('popoverStatusOnline'))
      : (workspace?.name ?? t('popoverStatusOffline'))
  const triggerSubtitle = !authed
    ? t('popoverLoginHint')
    : statusOk
      ? t('popoverStatusOnline')
      : t('popoverStatusOffline')

  return <>
    <section className={css.homeIntegration}>
      <button
        ref={triggerRef}
        type="button"
        className={css.homeEntry}
        onClick={() => setOpen(value => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CangzhiMark size={26} />
        <span className={css.homeEntryBody}>
          <strong>{t('homeEntry')}</strong>
          <small>{triggerSubtitle}</small>
        </span>
        <span className={css.homeEntryMeta}>
          <span className={css.homeEntryDot} data-state={!authed ? 'off' : statusOk ? 'ok' : 'warn'} />
          {triggerLabel}
        </span>
        <span className={css.homeEntryChevron} aria-hidden>{open ? '⌃' : '⌄'}</span>
      </button>
    </section>
    {open && <KnowledgePopover
      sessionId={sessionId}
      anchor={triggerRef.current}
      auth={auth}
      plugin={plugin}
      workspace={workspace}
      workspaces={workspaces}
      busy={busy}
      notice={notice}
      t={t}
      onClose={() => setOpen(false)}
      onLogin={login}
      onConnect={connect}
      onDisconnect={disconnect}
      onSwitchWorkspace={switchWorkspace}
      onOpenLibrary={() => { setOpen(false); openKnowledge() }}
      onOpenConsole={() => { setOpen(false); openConsole() }}
    />}
  </>
}

type KnowledgeDockProps = PropsRuntime<'conversation.input.dock'> & InjectFace<ConsoleFace> & PropsLocale<typeof NS>

function KnowledgeDock({ sessionId, openKnowledge, openConsole, inputActions, t }: KnowledgeDockProps) {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [plugin, setPlugin] = useState<PluginStatus | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const session = useKnowledgeSession(sessionId)

  const load = async () => {
    const [authResponse, statusResponse, workspaceResponse] = await Promise.all([
      fetch(`${API}/auth/status`, { credentials: 'include', cache: 'no-store' }),
      fetch('/_cangzhi-plugin/status', { cache: 'no-store' }),
      fetch(`${API}/workspaces/current`, { credentials: 'include', cache: 'no-store' }),
    ])
    if (authResponse.ok) {
      const authValue = await authResponse.json() as AuthState
      setAuth(authValue)
      if (authValue.authenticated) {
        const workspacesResponse = await fetch(`${API}/workspaces`, { credentials: 'include', cache: 'no-store' })
        if (workspacesResponse.ok) setWorkspaces(await workspacesResponse.json() as Workspace[])
      }
    }
    if (statusResponse.ok) setPlugin(await statusResponse.json() as PluginStatus)
    if (workspaceResponse.ok) setWorkspace(await workspaceResponse.json() as Workspace)
  }
  useEffect(() => {
    void load().catch(() => { setNotice('藏知服务暂时不可用') })
    const update = () => { void load().catch(() => { setNotice('藏知服务暂时不可用') }) }
    const useDocument = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail
      if (typeof detail?.prompt === 'string') inputActions.setDraft(detail.prompt)
    }
    window.addEventListener('cangzhi-workspace-changed', update)
    window.addEventListener('cangzhi-use-document', useDocument)
    return () => {
      window.removeEventListener('cangzhi-workspace-changed', update)
      window.removeEventListener('cangzhi-use-document', useDocument)
    }
  }, [inputActions])

  const login = async (username: string, password: string): Promise<void> => {
    setBusy(true)
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) { setBusy(false); throw new Error(await errorMessage(response, '登录失败')) }
    setBusy(false)
    await load()
  }
  const connect = async () => {
    setBusy(true); setNotice('正在创建 DSH 专用访问令牌…')
    const tokenResponse = await fetch(`${API}/access-tokens`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'DSH 对话插件', scopes: ['knowledge:read', 'knowledge:search', 'knowledge:ask'] }),
    })
    if (!tokenResponse.ok) { setNotice(await errorMessage(tokenResponse, '令牌创建失败')); setBusy(false); return }
    const { token } = await tokenResponse.json() as { token: string }
    const setup = await fetch('/_cangzhi-plugin/token', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }),
    })
    setNotice(setup.ok ? '连接成功，藏知工具正在自动上线' : await errorMessage(setup, 'DSH 凭据写入失败'))
    setBusy(false); await load()
  }
  const disconnect = async () => {
    setBusy(true)
    const response = await fetch('/_cangzhi-plugin/token', { method: 'DELETE' })
    setNotice(response.ok ? '已断开 DSH 对话连接' : await errorMessage(response, '断开失败'))
    setBusy(false); await load()
  }
  const switchWorkspace = async (slug: string) => {
    const next = workspaces.find(item => item.slug === slug)
    if (next === undefined || next.slug === workspace?.slug) return
    setBusy(true)
    try {
      setWorkspaceCookie(next.slug)
      await syncModelWorkspace(next.slug)
      setWorkspace(next)
      await load()
    } finally { setBusy(false) }
  }

  const statusOk = Boolean(plugin?.mcpConfigured)
  const authed = auth?.authenticated === true
  const policyLabel = session.policy === 'off' ? t('popoverPolicyOff') : t('popoverPolicyOn')
  const workspaceLabel = workspace?.name ?? plugin?.activeWorkspace ?? t('popoverWorkspace')

  return <>
    <section className={css.knowledgeDock}>
      <button
        ref={triggerRef}
        type="button"
        className={css.knowledgeDockTrigger}
        onClick={() => setOpen(value => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CangzhiMark size={20} />
        <span className={css.knowledgeDockMeta}>
          <strong>{t('dockEntry')}</strong>
          <small>{workspaceLabel} · {policyLabel}</small>
        </span>
        <span className={css.knowledgeDockDot} data-state={!authed ? 'off' : statusOk ? 'ok' : 'warn'} />
        <span className={css.knowledgeDockChevron} aria-hidden>{open ? '⌃' : '⌄'}</span>
      </button>
    </section>
    {open && <KnowledgePopover
      sessionId={sessionId}
      anchor={triggerRef.current}
      auth={auth}
      plugin={plugin}
      workspace={workspace}
      workspaces={workspaces}
      busy={busy}
      notice={notice}
      t={t}
      onClose={() => setOpen(false)}
      onLogin={login}
      onConnect={connect}
      onDisconnect={disconnect}
      onSwitchWorkspace={switchWorkspace}
      onOpenLibrary={() => { setOpen(false); openKnowledge() }}
      onOpenConsole={() => { setOpen(false); openConsole() }}
    />}
  </>
}

type ConversationKnowledgeHeaderProps = PropsRuntime<'conversation.session.header.actions'> & InjectFace<ConsoleFace> & PropsLocale<typeof NS>

function ConversationKnowledgeHeader({ sessionId, openKnowledge, t }: ConversationKnowledgeHeaderProps) {
  const [configured, setConfigured] = useState(false)
  const [activeSlug, setActiveSlug] = useState('default')
  const [currentName, setCurrentName] = useState<string | null>(null)
  const session = useKnowledgeSession(sessionId)
  useEffect(() => {
    const load = async () => {
      const [statusResponse, workspaceResponse] = await Promise.all([
        fetch('/_cangzhi-plugin/status', { cache: 'no-store' }),
        fetch(`${API}/workspaces/current`, { credentials: 'include', cache: 'no-store' }),
      ])
      if (statusResponse.ok) {
        const status = await statusResponse.json() as PluginStatus
        setConfigured(status.mcpConfigured)
        setActiveSlug(status.activeWorkspace ?? 'default')
      }
      if (workspaceResponse.ok) {
        const workspace = await workspaceResponse.json() as Workspace
        setCurrentName(workspace.name)
      }
    }
    void load()
    const update = () => { void load() }
    window.addEventListener('cangzhi-workspace-changed', update)
    return () => window.removeEventListener('cangzhi-workspace-changed', update)
  }, [])
  const policyLabel = session.policy === 'off' ? t('popoverPolicyOff') : t('popoverPolicyOn')
  const display = currentName ?? (configured ? activeSlug : t('popoverLoginTitle'))
  return <button type="button" className={css.conversationKnowledgeHeader} title={t('popoverHeaderHint')} onClick={openKnowledge}>
    <CangzhiMark size={18} />
    <i data-ok={String(configured)} />
    <span>{display} · {policyLabel}</span>
    <span className={css.conversationKnowledgeChevron} aria-hidden>⌕</span>
  </button>
}

type ConnectionSettings = { apiUrl: string; webUrl: string; defaultWorkspace: string }
type ConnectionLocks = { apiUrl: boolean; webUrl: boolean; defaultWorkspace: boolean }
type ConnectionSettingsStatus = {
  active: ConnectionSettings
  configured: ConnectionSettings
  locks: ConnectionLocks
  restartRequired: boolean
}

interface CangzhiSettingsFace {
  settingsScope: SettingsScope<ConnectionSettings>
}

type CangzhiSettingsTabProps = PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<typeof NS> & InjectFace<CangzhiSettingsFace>

function validConnectionUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:')
      && url.username === '' && url.password === ''
  } catch {
    return false
  }
}

function CangzhiSettingsTab({ settingsScope, t }: CangzhiSettingsTabProps) {
  const snapshot = useSyncExternalStore(
    listener => settingsScope.subscribe(listener),
    () => settingsScope.getSnapshot(),
  )
  const [status, setStatus] = useState<ConnectionSettingsStatus | null>(null)
  const [apiUrl, setApiUrl] = useState('')
  const [webUrl, setWebUrl] = useState('')
  const [defaultWorkspace, setDefaultWorkspace] = useState('default')
  const [busy, setBusy] = useState<'save' | 'test' | null>(null)
  const [message, setMessage] = useState('')

  const loadStatus = async () => {
    const response = await fetch('/_cangzhi-plugin/status', { cache: 'no-store' })
    if (!response.ok) throw new Error(await errorMessage(response, t('settingsUnavailable')))
    const plugin = await response.json() as PluginStatus
    if (plugin.connectionSettings !== undefined) setStatus(plugin.connectionSettings)
  }

  useEffect(() => {
    if (snapshot.value === undefined) return
    setApiUrl(snapshot.value.apiUrl)
    setWebUrl(snapshot.value.webUrl)
    setDefaultWorkspace(snapshot.value.defaultWorkspace)
  }, [snapshot.value])
  useEffect(() => { void loadStatus().catch(() => { setMessage(t('settingsUnavailable')) }) }, [])

  const validate = (): boolean => {
    if (!validConnectionUrl(apiUrl) || !validConnectionUrl(webUrl)) {
      setMessage(t('settingsInvalidUrl'))
      return false
    }
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(defaultWorkspace.trim().toLowerCase())) {
      setMessage(t('settingsInvalidWorkspace'))
      return false
    }
    return true
  }

  const test = async () => {
    if (!validate()) return
    setBusy('test'); setMessage('')
    try {
      const response = await fetch('/_cangzhi-plugin/settings/test', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ apiUrl, webUrl, defaultWorkspace }),
      })
      setMessage(response.ok ? t('settingsTestOk') : await errorMessage(response, t('settingsTestFailed')))
    } catch { setMessage(t('settingsTestFailed')) }
    finally { setBusy(null) }
  }

  const save = async () => {
    if (!validate() || snapshot.status !== 'ready' || !snapshot.writable) return
    setBusy('save'); setMessage('')
    const locks = status?.locks
    const ops = [
      ...(locks?.apiUrl ? [] : [{ op: 'set' as const, path: ['apiUrl'], value: apiUrl.trim() }]),
      ...(locks?.webUrl ? [] : [{ op: 'set' as const, path: ['webUrl'], value: webUrl.trim() }]),
      ...(locks?.defaultWorkspace ? [] : [{
        op: 'set' as const, path: ['defaultWorkspace'], value: defaultWorkspace.trim().toLowerCase(),
      }]),
    ]
    try {
      if (ops.length > 0) await settingsScope.mutate(ops, snapshot.revision)
      await loadStatus()
      setMessage(t('settingsSaved'))
    } catch { setMessage(t('settingsSaveFailed')) }
    finally { setBusy(null) }
  }

  const locks = status?.locks
  const unavailable = status === null || snapshot.status !== 'ready' || !snapshot.writable
  const field = (
    key: keyof ConnectionSettings,
    label: string,
    hint: string,
    value: string,
    update: (value: string) => void,
  ) => {
    const locked = locks?.[key] ?? false
    return <label className={css.settingsField}><span><strong>{label}</strong>{locked && <em>{t('settingsManaged')}</em>}</span><input value={value} disabled={unavailable || locked || busy !== null} onChange={event => update(event.target.value)}/><small>{hint}</small></label>
  }

  return <section className={css.settingsPanel}>
    <header><CangzhiMark size={36}/><div><h3>{t('settingsTitle')}</h3><p>{t('settingsDescription')}</p></div></header>
    <div className={css.settingsFields}>
      {field('apiUrl', t('settingsApiUrl'), t('settingsApiHint'), apiUrl, setApiUrl)}
      {field('webUrl', t('settingsWebUrl'), t('settingsWebHint'), webUrl, setWebUrl)}
      {field('defaultWorkspace', t('settingsWorkspace'), t('settingsWorkspaceHint'), defaultWorkspace, setDefaultWorkspace)}
    </div>
    <p className={css.settingsRestart} data-pending={String(Boolean(status?.restartRequired))}>{status?.restartRequired ? t('settingsRestartPending') : t('settingsRestart')}</p>
    {unavailable && <p className={css.settingsMessage}>{t('settingsUnavailable')}</p>}
    {message && <p className={css.settingsMessage} role="status">{message}</p>}
    <footer><button type="button" disabled={unavailable || busy !== null} onClick={() => void test()}>{busy === 'test' ? t('settingsTesting') : t('settingsTest')}</button><button type="button" data-primary="true" disabled={unavailable || busy !== null} onClick={() => void save()}>{busy === 'save' ? t('settingsSaving') : t('settingsSave')}</button></footer>
  </section>
}

type ConsoleActionProps = PropsRuntime<'sidebar.footer.action'>
  & InjectFace<ConsoleFace> & PropsLocale<typeof NS>

function ConsoleAction({ wide, useCangzhiConsole, openConsole, t }: ConsoleActionProps) {
  const state = useCangzhiConsole(value => value)
  const [health, setHealth] = useState<'checking' | 'ok' | 'warning' | 'error'>('checking')
  const [healthDetail, setHealthDetail] = useState('')
  useEffect(() => {
    let alive = true
    const loadHealth = async () => {
      try {
        const pluginResponse = await fetch('/_cangzhi-plugin/status', { cache: 'no-store' })
        if (!pluginResponse.ok) throw new Error('plugin status unavailable')
        const pluginStatus = await pluginResponse.json() as PluginStatus
        let next: typeof health = pluginStatus.apiConnected ? 'ok' : 'error'
        const details: string[] = []
        if (!pluginStatus.mcpConfigured) {
          next = 'warning'
          details.push(t('healthMcpMissing'))
        }
        if (pluginStatus.apiConnected) {
          const systemResponse = await fetch(`${API}/system/status`, { credentials: 'include', cache: 'no-store' })
          if (systemResponse.ok) {
            const systemStatus = await systemResponse.json() as SystemStatus
            const issues = systemIssues(systemStatus)
            if (issues.length > 0) next = 'warning'
            for (const issue of issues) {
              if (issue.kind === 'processing') details.push(t('healthProcessingFailed', { count: issue.failed }))
              if (issue.kind === 'storage') details.push(t('healthStorageHigh', { percent: issue.usedPercent }))
              if (issue.kind === 'database') details.push(t('healthDatabase', { status: issue.status }))
            }
          } else if (systemResponse.status >= 500) {
            next = 'error'
            details.push(t('healthSystemUnavailable'))
          }
        }
        if (alive) { setHealth(next); setHealthDetail(details.join(' · ')) }
      } catch {
        if (alive) { setHealth('error'); setHealthDetail(t('healthSystemUnavailable')) }
      }
    }
    void loadHealth()
    const timer = window.setInterval(() => { void loadHealth() }, 30_000)
    return () => { alive = false; window.clearInterval(timer) }
  }, [])
  const healthLabel = healthDetail || (health === 'ok' ? t('healthOk') : health === 'warning' ? t('healthWarning') : health === 'error' ? t('healthError') : t('healthChecking'))
  return (
    <button
      type="button"
      className={wide ? css.footerButton : `${css.footerButton} ${css.footerButtonRail}`}
      data-active={String(state.open)}
      aria-label={t('consoleTitle')}
      title={`${t('consoleTitle')} · ${healthLabel}`}
      onClick={openConsole}
    >
      <span className={css.footerIcon} aria-hidden>▤</span>
      {wide && <span className={css.footerLabel}>{t('footer')}</span>}
      <span className={css.sidebarHealthDot} data-state={health} aria-hidden />
    </button>
  )
}

type AuthState = { authenticated: boolean; setup_required?: boolean; admin?: { username: string } | null }
type Workspace = { id: number; slug: string; name: string; description?: string | null; is_default: boolean; status: 'active' | 'archived'; created_at?: string | null }
type Category = { id: number; name: string; slug: string; description?: string | null; document_count: number; is_default: boolean }
type DocumentItem = {
  id: number
  title: string
  source_type: string
  content_kind: string
  updated_at: string
  primary_category?: { id: number; name: string } | null
  current_version?: { processing_status: string } | null
  pipeline?: { overall_status: string } | null
}
type PluginStatus = { apiConnected?: boolean; mcpConfigured: boolean; toolCount: number; activeWorkspace?: string; connectionSettings?: ConnectionSettingsStatus }
type SystemStatus = {
  status: 'ok' | 'degraded'
  uptime_seconds: number
  database: { status: string; latency_ms: number }
  storage: { status: string; total_bytes: number; used_bytes: number; free_bytes: number; used_percent: number }
  processing: {
    active: number
    waiting: number
    failed: number
    failed_by_workspace?: Array<{
      workspace_id: number
      workspace_slug: string
      workspace_name: string
      workspace_status: 'active' | 'archived'
      failed: number
    }>
  }
}
type SystemIssue =
  | { kind: 'database'; status: string }
  | { kind: 'storage'; usedPercent: number }
  | { kind: 'processing'; failed: number }
type WorkspaceFailure = { slug: string; name: string; status: 'active' | 'archived'; count: number }

async function loadWorkspaceFailure(workspace: Workspace): Promise<WorkspaceFailure | null> {
  const limit = 200
  let offset = 0
  let failed = 0
  while (true) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset), include_processing: 'true', workspace: workspace.slug })
    const response = await fetch(`${API}/documents/overview?${params}`, { credentials: 'include', cache: 'no-store' })
    if (!response.ok) return null
    const items = await response.json() as DocumentItem[]
    failed += items.filter(document => statusOf(document) === 'failed').length
    offset += items.length
    const total = Number(response.headers.get('x-total-count') ?? offset)
    if (items.length === 0 || offset >= total) break
  }
  return failed > 0 ? { slug: workspace.slug, name: workspace.name, status: workspace.status, count: failed } : null
}

function systemIssues(system: SystemStatus): SystemIssue[] {
  const issues: SystemIssue[] = []
  if (system.database.status !== 'ok') issues.push({ kind: 'database', status: system.database.status })
  if (system.storage.status !== 'ok' || system.storage.used_percent >= 90) {
    issues.push({ kind: 'storage', usedPercent: system.storage.used_percent })
  }
  if (system.processing.failed > 0) issues.push({ kind: 'processing', failed: system.processing.failed })
  return issues
}

function systemIssueText(issue: SystemIssue): string {
  if (issue.kind === 'processing') return `有 ${issue.failed} 份资料处理失败。请选择下方对应空间直接查看并处理。`
  if (issue.kind === 'storage') return `存储已使用 ${issue.usedPercent}%，请清理空间或扩容（告警阈值 90%）`
  return `数据库状态为 ${issue.status}`
}
type Tab = 'overview' | 'search' | 'documents' | 'create' | 'upload' | 'categories' | 'spaces' | 'connect'

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const value = await response.json().catch(() => null) as { detail?: string | { message?: string }; error?: string } | null
  if (typeof value?.detail === 'string') return value.detail
  if (typeof value?.detail === 'object' && typeof value.detail.message === 'string') return value.detail.message
  if (typeof value?.error === 'string') return value.error
  return fallback
}

function LoginPanel({ onAuthenticated }: { onAuthenticated(): void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true); setError('')
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    setBusy(false)
    if (!response.ok) { setError(await errorMessage(response, '登录失败')); return }
    onAuthenticated()
  }
  return <div className={css.loginPanel}>
    <div className={css.loginMark}>▤</div>
    <h2>登录藏知</h2>
    <p>登录后即可在 DSH 内上传、管理和维护知识库。</p>
    <form onSubmit={submit} className={css.loginForm}>
      <input value={username} onChange={event => setUsername(event.target.value)} placeholder="用户名" autoComplete="username" required />
      <input value={password} onChange={event => setPassword(event.target.value)} placeholder="密码" type="password" autoComplete="current-password" required />
      {error && <div className={css.errorBanner}>{error}</div>}
      <button disabled={busy}>{busy ? '登录中…' : '登录'}</button>
    </form>
  </div>
}

function NativeWorkspace() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [plugin, setPlugin] = useState<PluginStatus | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceFailures, setWorkspaceFailures] = useState<WorkspaceFailure[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [documentStatus, setDocumentStatus] = useState('')
  const refresh = async () => {
    setLoading(true); setError('')
    try {
      const authResponse = await fetch(`${API}/auth/status`, { credentials: 'include', cache: 'no-store' })
      const authValue = await authResponse.json() as AuthState
      setAuth(authValue)
      const pluginResponse = await fetch('/_cangzhi-plugin/status', { cache: 'no-store' })
      if (pluginResponse.ok) setPlugin(await pluginResponse.json() as PluginStatus)
      if (authValue.authenticated) {
        const [documentResponse, categoryResponse, workspacesResponse, currentWorkspaceResponse, systemResponse] = await Promise.all([
          fetch(`${API}/documents/overview?limit=200&offset=0&include_processing=true`, { credentials: 'include', cache: 'no-store' }),
          fetch(`${API}/categories`, { credentials: 'include', cache: 'no-store' }),
          fetch(`${API}/workspaces`, { credentials: 'include', cache: 'no-store' }),
          fetch(`${API}/workspaces/current`, { credentials: 'include', cache: 'no-store' }),
          fetch(`${API}/system/status`, { credentials: 'include', cache: 'no-store' }),
        ])
        if (!documentResponse.ok || !categoryResponse.ok || !workspacesResponse.ok || !currentWorkspaceResponse.ok) throw new Error('知识库读取失败')
        setDocuments(await documentResponse.json() as DocumentItem[])
        setTotal(Number(documentResponse.headers.get('x-total-count') ?? 0))
        setCategories(await categoryResponse.json() as Category[])
        const nextWorkspaces = await workspacesResponse.json() as Workspace[]
        setWorkspaces(nextWorkspaces)
        const current = await currentWorkspaceResponse.json() as Workspace
        setCurrentWorkspace(current)
        if (systemResponse.ok) {
          const nextSystem = await systemResponse.json() as SystemStatus
          setSystemStatus(nextSystem)
          if (nextSystem.processing.failed_by_workspace !== undefined) {
            setWorkspaceFailures(nextSystem.processing.failed_by_workspace.map(item => ({
              slug: item.workspace_slug,
              name: item.workspace_name,
              status: item.workspace_status,
              count: item.failed,
            })))
          } else {
            const failureResults = await Promise.all(nextWorkspaces.filter(item => item.status === 'active').map(loadWorkspaceFailure))
            setWorkspaceFailures(failureResults.filter((item): item is WorkspaceFailure => item !== null))
          }
        }
        await syncModelWorkspace(current.slug)
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : '藏知服务不可用') }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [])
  const logout = async () => { await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }); setAuth({ authenticated: false, admin: null }) }
  const switchWorkspace = async (slug: string) => {
    const next = workspaces.find(item => item.slug === slug && item.status === 'active')
    if (slug === currentWorkspace?.slug || (workspaces.some(item => item.slug === slug) && next === undefined)) return
    setLoading(true); setError('')
    try {
      setWorkspaceCookie(next.slug)
      await syncModelWorkspace(next.slug)
      setCurrentWorkspace(next ?? null)
      setDocumentStatus('')
      setTab('overview')
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '知识空间切换失败')
      setLoading(false)
    }
  }
  const openWorkspaceFailures = async (item: WorkspaceFailure) => {
    if (item.status === 'archived') {
      setTab('spaces')
      return
    }
    await switchWorkspace(item.slug)
    setDocumentStatus('failed')
    setTab('documents')
  }
  if (loading && auth === null) return <div className={css.centerState}>正在连接藏知…</div>
  if (auth !== null && !auth.authenticated) return <LoginPanel onAuthenticated={() => void refresh()} />
  return <div className={css.workspace}>
    <aside className={css.workspaceNav}>
      <div className={css.brand}><span>▤</span><div><strong>藏知</strong><small>Knowledge for DSH</small></div></div>
      <label className={css.workspaceSelector}><span>当前知识空间</span><select value={currentWorkspace?.slug ?? 'default'} disabled={loading} onChange={event => void switchWorkspace(event.target.value)}>{workspaces.filter(item => item.status === 'active').map(item => <option value={item.slug} key={item.id}>{item.name}</option>)}</select><small>{currentWorkspace?.description || '内容与模型检索在空间之间隔离'}</small></label>
      <p className={css.navSection}>知识工作</p>
      {([['overview', '⌂', '总览'], ['search', '⌕', '搜索知识'], ['documents', '▤', '资料库'], ['create', '✎', '快速收录'], ['upload', '⇧', '上传资料']] as const).map(([key, icon, label]) =>
        <button key={key} data-active={String(tab === key)} onClick={() => setTab(key)}><span>{icon}</span>{label}</button>)}
      <p className={css.navSection}>组织与连接</p>
      {([['categories', '◇', '分类管理'], ['spaces', '▦', '知识空间'], ['connect', '↗', '对话接入']] as const).map(([key, icon, label]) =>
        <button key={key} data-active={String(tab === key)} onClick={() => setTab(key)}><span>{icon}</span>{label}</button>)}
      <div className={css.connectionCard}>
        <span data-ok={String(Boolean(plugin?.mcpConfigured))} />
        <div><strong>{plugin?.mcpConfigured ? '对话检索已连接' : '管理已连接'}</strong><small>{plugin?.mcpConfigured ? `${plugin.toolCount} 个模型工具可用` : '配置 PAT 后启用模型工具'}</small></div>
      </div>
    </aside>
    <main className={css.workspaceMain}>
      <div className={css.pageHeader}><div><span className={css.pageEyebrow}>{currentWorkspace?.name ?? '知识空间'}</span><h2>{tab === 'overview' ? '知识工作台' : tab === 'search' ? '搜索知识' : tab === 'documents' ? '资料库' : tab === 'create' ? '快速收录' : tab === 'upload' ? '上传资料' : tab === 'categories' ? '分类管理' : tab === 'spaces' ? '知识空间' : '对话接入'}</h2><p>{tab === 'overview' ? `你好，${auth?.admin?.username ?? '管理员'}。从这里开始沉淀、整理和使用知识。` : currentWorkspace?.description || '当前操作仅作用于所选知识空间'}</p></div><div className={css.headerActions}><button className={css.refreshButton} disabled={loading} onClick={() => void refresh()}>{loading ? '刷新中…' : '刷新'}</button><button className={css.refreshButton} onClick={() => void logout()}>退出</button></div></div>
      {error && <div className={css.errorBanner}>{error}</div>}
      {tab === 'overview' && <Overview documents={documents} categories={categories} total={total} mcp={plugin?.mcpConfigured ?? false} workspace={currentWorkspace} system={systemStatus} workspaceFailures={workspaceFailures} go={setTab} openFailures={openWorkspaceFailures} />}
      {tab === 'search' && <KnowledgeSearch />}
      {tab === 'documents' && <Documents documents={documents} categories={categories} query={query} setQuery={setQuery} status={documentStatus} setStatus={setDocumentStatus} refresh={refresh} />}
      {tab === 'create' && <CreateKnowledge refresh={refresh} done={() => setTab('documents')} />}
      {tab === 'upload' && <Upload refresh={refresh} done={() => setTab('documents')} />}
      {tab === 'categories' && <Categories categories={categories} refresh={refresh} />}
      {tab === 'spaces' && <Workspaces workspaces={workspaces} current={currentWorkspace} refresh={refresh} switchTo={switchWorkspace} />}
      {tab === 'connect' && <ConversationConnect configured={plugin?.mcpConfigured ?? false} refresh={refresh} />}
    </main>
  </div>
}

function formatCapacity(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  return `${Math.max(0, Math.round(bytes / 1024 ** 2))} MB`
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  if (days > 0) return `${days} 天`
  const hours = Math.floor(seconds / 3600)
  if (hours > 0) return `${hours} 小时`
  return `${Math.max(1, Math.floor(seconds / 60))} 分钟`
}

function Overview({ documents, categories, total, mcp, workspace, system, workspaceFailures, go, openFailures }: { documents: DocumentItem[]; categories: Category[]; total: number; mcp: boolean; workspace: Workspace | null; system: SystemStatus | null; workspaceFailures: WorkspaceFailure[]; go(tab: Tab): void; openFailures(item: WorkspaceFailure): Promise<void> }) {
  const processing = documents.filter(item => ['processing', 'created', 'retry'].includes(item.pipeline?.overall_status ?? item.current_version?.processing_status ?? '')).length
  const issues = system === null ? [] : systemIssues(system)
  return <>
    <div className={css.stats}>
      <article><small>知识资料</small><strong>{total}</strong><span>{workspace?.name ?? '当前空间'}</span></article>
      <article><small>知识分类</small><strong>{categories.length}</strong><span>持续整理中</span></article>
      <article><small>处理队列</small><strong>{processing}</strong><span>{processing ? '后台正在处理' : '队列空闲'}</span></article>
      <article><small>模型能力</small><strong>{mcp ? '14' : '—'}</strong><span>{mcp ? '对话工具在线' : '等待 PAT 配置'}</span></article>
    </div>
    {system && <section className={css.systemStatus} data-state={system.status}>
      <div className={css.systemStatusTitle}><span/><div><strong>服务器状态</strong><small>{issues.length === 0 ? '藏知运行正常' : `${issues.length} 项异常`}</small></div></div>
      <dl><div><dt>API 运行</dt><dd>{formatUptime(system.uptime_seconds)}</dd></div><div data-warning={String(system.database.status !== 'ok')}><dt>数据库</dt><dd>{system.database.status === 'ok' ? `${system.database.latency_ms} ms` : system.database.status}</dd></div><div data-warning={String(system.storage.status !== 'ok' || system.storage.used_percent >= 90)}><dt>存储</dt><dd>{system.storage.used_percent}% 已用 · {formatCapacity(system.storage.free_bytes)} 可用</dd></div><div><dt>处理队列</dt><dd>{system.processing.active} 处理中 · {system.processing.waiting} 等待</dd></div>{system.processing.failed > 0 && <div data-warning="true"><dt>处理失败</dt><dd>{system.processing.failed} 项</dd></div>}</dl>
      {issues.length > 0 && <div className={css.systemIssues} role="status"><strong>异常原因</strong><ul>{issues.map(issue => <li key={issue.kind}>{systemIssueText(issue)}</li>)}</ul>{issues.some(issue => issue.kind === 'processing') && <div className={css.systemIssueActions}>{workspaceFailures.map(item => <button key={item.slug} title={item.status === 'archived' ? '该空间已归档，点击前往知识空间管理' : '切换空间并只显示失败资料'} onClick={() => void openFailures(item)}>{item.name}（{item.count}）{item.status === 'archived' ? ' · 已归档' : ''}</button>)}{workspaceFailures.length === 0 && <button onClick={() => go('spaces')}>检查知识空间</button>}</div>}</div>}
    </section>}
    <div className={css.quickActions}>
      <button onClick={() => go('upload')}><span>⇧</span><div><strong>上传资料</strong><small>批量添加文件并自动解析</small></div><b>→</b></button>
      <button onClick={() => go('create')}><span>✎</span><div><strong>快速收录</strong><small>记录想法或收藏网页链接</small></div><b>→</b></button>
      <button onClick={() => go('search')}><span>⌕</span><div><strong>验证知识</strong><small>搜索并检查可被模型召回的内容</small></div><b>→</b></button>
    </div>
    <section className={css.panel}><div className={css.panelTitle}><div><h3>最近资料</h3><p>上传后自动解析、切片并进入检索</p></div><button onClick={() => go('upload')}>＋ 上传资料</button></div><DocumentRows documents={documents.slice(0, 8)} refresh={() => Promise.resolve()} compact /></section>
  </>
}

function statusOf(item: DocumentItem): string {
  const versionStatus = item.current_version?.processing_status
  if (versionStatus === 'failed') return 'failed'
  return item.pipeline?.overall_status ?? versionStatus ?? 'created'
}
const statusText: Record<string, string> = { completed: '已完成', ready: '已完成', processing: '处理中', created: '等待处理', retry: '等待重试', failed: '失败', unsupported: '未提取' }

function DocumentRows({ documents, refresh, categories = [], compact = false }: { documents: DocumentItem[]; refresh(): Promise<unknown>; categories?: Category[]; compact?: boolean }) {
  const act = async (item: DocumentItem, action: 'reprocess' | 'delete') => {
    if (action === 'delete' && !window.confirm(`将“${item.title}”移入回收站？`)) return
    const response = await fetch(`${API}/documents/${item.id}${action === 'reprocess' ? '/reprocess' : ''}`, { method: action === 'reprocess' ? 'POST' : 'DELETE', credentials: 'include' })
    if (!response.ok) window.alert(await errorMessage(response, '操作失败'))
    else await refresh()
  }
  const organize = async (item: DocumentItem, categoryId: number) => {
    const response = await fetch(`${API}/documents/${item.id}/category`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ category_id: categoryId }) })
    if (!response.ok) window.alert(await errorMessage(response, '分类调整失败')); else await refresh()
  }
  if (!documents.length) return <div className={css.empty}>还没有资料，先上传第一份知识吧。</div>
  return <div className={css.documentRows}>{documents.map(item => <div className={css.documentRow} key={item.id}>
    <span className={css.fileIcon}>{item.content_kind === 'dataset' ? '▦' : '▤'}</span>
    <div className={css.documentName}><strong>{item.title}</strong><small>{item.primary_category?.name ?? '未分类'} · {new Date(item.updated_at).toLocaleString()}</small></div>
    <span className={css.status} data-status={statusOf(item)}>{statusText[statusOf(item)] ?? statusOf(item)}</span>
    {!compact && <div className={css.rowActions}>{categories.length > 0 && <select aria-label={`调整“${item.title}”的分类`} value={item.primary_category?.id ?? ''} onChange={event => { const id = Number(event.target.value); if (id > 0) void organize(item, id) }}><option value="" disabled>整理到…</option>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select>}<button onClick={() => window.open(`${API}/documents/${item.id}/preview`, '_blank', 'noopener,noreferrer')}>预览</button><button onClick={() => void act(item, 'reprocess')}>重处理</button><button onClick={() => void act(item, 'delete')}>删除</button></div>}
  </div>)}</div>
}

function Documents({ documents, categories, query, setQuery, status, setStatus, refresh }: { documents: DocumentItem[]; categories: Category[]; query: string; setQuery(value: string): void; status: string; setStatus(value: string): void; refresh(): Promise<unknown> }) {
  const [categoryId, setCategoryId] = useState('')
  const visible = documents.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query.trim().toLowerCase())
    const matchesCategory = categoryId === '' || item.primary_category?.id === Number(categoryId)
    const matchesStatus = status === '' || statusOf(item) === status || (status === 'completed' && statusOf(item) === 'ready')
    return matchesQuery && matchesCategory && matchesStatus
  })
  const hasFilters = query.trim() !== '' || categoryId !== '' || status !== ''
  return <section className={css.panel}><div className={css.libraryToolbar}><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索资料名称…"/><select value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">全部分类</option>{categories.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><select value={status} onChange={event => setStatus(event.target.value)}><option value="">全部状态</option><option value="completed">已完成</option><option value="processing">处理中</option><option value="created">等待处理</option><option value="retry">等待重试</option><option value="failed">失败</option></select>{hasFilters && <button onClick={() => { setQuery(''); setCategoryId(''); setStatus('') }}>清除</button>}<span>{visible.length} / {documents.length} 条</span></div><DocumentRows documents={visible} categories={categories} refresh={refresh} /></section>
}

type SearchHit = { document_id: number; title: string; source_type: string; score: number; snippet: string; evidence_type?: string; dataset_id?: number; categories?: Array<{ name: string }> }

function KnowledgeSearch() {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [backend, setBackend] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const search = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    const response = await fetch(`${API}/search`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: query.trim(), limit: 30, offset: 0 }) })
    if (!response.ok) { setError(await errorMessage(response, '搜索失败')); setBusy(false); return }
    const body = await response.json() as { hits: SearchHit[]; backend: string }
    setHits(body.hits); setBackend(body.backend); setBusy(false)
  }
  return <section className={css.panel}>
    <form className={css.searchForm} onSubmit={search}><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索标题、正文或知识片段" required/><button disabled={busy}>{busy ? '搜索中…' : '搜索'}</button></form>
    {error && <div className={css.errorBanner}>{error}</div>}
    {backend && <p className={css.searchMeta}>{hits.length} 个结果 · {backend}</p>}
    <div className={css.searchResults}>{hits.map((hit, index) => <article key={`${hit.document_id}:${index}`}><div><strong>{hit.title}</strong><small>{hit.source_type} · 匹配度 {(hit.score * 100).toFixed(0)}% {hit.categories?.map(item => `· ${item.name}`).join('')}</small></div><p>{hit.snippet}</p></article>)}</div>
    {!busy && backend && !hits.length && <div className={css.empty}>没有找到匹配的知识。</div>}
  </section>
}

function CreateKnowledge({ refresh, done }: { refresh(): Promise<unknown>; done(): void }) {
  const [mode, setMode] = useState<'note' | 'url'>('note')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('')
    const response = await fetch(mode === 'note' ? `${API}/notes` : `${API}/sources/url`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(mode === 'note' ? { title, content } : { url }),
    })
    if (!response.ok) { setMessage(await errorMessage(response, '保存失败')); setBusy(false); return }
    setMessage(mode === 'note' ? '随手记已保存并进入处理队列' : '链接已收录并进入抓取队列')
    setTitle(''); setContent(''); setUrl(''); setBusy(false); await refresh(); window.setTimeout(done, 650)
  }
  return <section className={css.createPanel}>
    <div className={css.modeTabs}><button data-active={String(mode === 'note')} onClick={() => setMode('note')}>随手记</button><button data-active={String(mode === 'url')} onClick={() => setMode('url')}>网页链接</button></div>
    <form onSubmit={submit}>
      {mode === 'note' ? <><input value={title} onChange={event => setTitle(event.target.value)} placeholder="标题（可选）"/><textarea value={content} onChange={event => setContent(event.target.value)} placeholder="记录想法、会议要点或任何需要沉淀的知识…" required/></> : <input value={url} onChange={event => setUrl(event.target.value)} placeholder="https://example.com/article" type="url" required/>}
      <button className={css.primaryButton} disabled={busy}>{busy ? '保存中…' : mode === 'note' ? '保存随手记' : '收录链接'}</button>
      {message && <p className={css.progressText}>{message}</p>}
    </form>
  </section>
}

function Upload({ refresh, done }: { refresh(): Promise<unknown>; done(): void }) {
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState('')
  const supported = useMemo(() => '.pdf,.doc,.docx,.xlsx,.xls,.md,.txt', [])
  const chooseFiles = (next: File[]) => { setFiles(next.slice(0, 50)); setProgress(next.length > 50 ? '单次最多保留前 50 个文件' : '') }
  const upload = async () => {
    setBusy(true)
    for (let index = 0; index < files.length; index += 1) {
      setProgress(`正在上传 ${index + 1} / ${files.length}：${files[index]!.name}`)
      const body = new FormData(); body.append('file', files[index]!); body.append('title', '')
      const response = await fetch(`${API}/files/upload`, { method: 'POST', credentials: 'include', body })
      if (!response.ok) { window.alert(await errorMessage(response, `${files[index]!.name} 上传失败`)); setBusy(false); return }
    }
    setProgress('上传完成，资料已进入处理队列'); setFiles([]); setBusy(false); await refresh(); window.setTimeout(done, 700)
  }
  return <section className={css.uploadPanel}>
    <input ref={input} type="file" accept={supported} multiple hidden onChange={event => chooseFiles(Array.from(event.target.files ?? []))}/>
    <button className={css.dropZone} data-dragging={String(dragging)} onClick={() => input.current?.click()} onDragEnter={event => { event.preventDefault(); setDragging(true) }} onDragOver={event => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); chooseFiles(Array.from(event.dataTransfer.files)) }} disabled={busy}><span>⇧</span><strong>{dragging ? '松开即可添加文件' : '选择或拖入知识文件'}</strong><small>PDF、Word、Excel、Markdown、TXT，单次最多 50 个</small></button>
    {files.length > 0 && <div className={css.uploadList}>{files.map((file, index) => <div key={`${file.name}:${file.size}`}><span>▤</span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small><button aria-label={`移除 ${file.name}`} disabled={busy} onClick={() => setFiles(current => current.filter((_, position) => position !== index))}>×</button></div>)}</div>}
    {progress && <p className={css.progressText}>{progress}</p>}
    <button className={css.primaryButton} disabled={!files.length || busy} onClick={() => void upload()}>{busy ? '上传中…' : `上传 ${files.length || ''} 个文件`}</button>
  </section>
}

function Categories({ categories, refresh }: { categories: Category[]; refresh(): Promise<unknown> }) {
  const [name, setName] = useState('')
  const create = async (event: React.FormEvent) => { event.preventDefault(); const response = await fetch(`${API}/categories`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) }); if (!response.ok) window.alert(await errorMessage(response, '创建失败')); else { setName(''); await refresh() } }
  const rename = async (item: Category) => { const next = window.prompt('新的分类名称', item.name)?.trim(); if (!next || next === item.name) return; const response = await fetch(`${API}/categories/${item.id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: next }) }); if (!response.ok) window.alert(await errorMessage(response, '重命名失败')); else await refresh() }
  const remove = async (item: Category) => { if (!window.confirm(`删除分类“${item.name}”？`)) return; const response = await fetch(`${API}/categories/${item.id}`, { method: 'DELETE', credentials: 'include' }); if (!response.ok) window.alert(await errorMessage(response, '删除失败')); else await refresh() }
  return <><form className={css.categoryForm} onSubmit={create}><input value={name} onChange={event => setName(event.target.value)} placeholder="新分类名称" required/><button>新增分类</button></form><section className={css.categoryGrid}>{categories.map(item => <article key={item.id}><span>▤</span><div><strong>{item.name}</strong><small>{item.document_count} 条资料 · {item.slug}</small></div><button onClick={() => void rename(item)}>重命名</button>{!item.is_default && <button onClick={() => void remove(item)}>删除</button>}</article>)}</section></>
}

function Workspaces({ workspaces, current, refresh, switchTo }: { workspaces: Workspace[]; current: Workspace | null; refresh(): Promise<unknown>; switchTo(slug: string): Promise<void> }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setCreating(true); setMessage('')
    const response = await fetch(`${API}/workspaces`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), slug: slug.trim().toLowerCase(), description: description.trim() || null }),
    })
    if (!response.ok) { setMessage(await errorMessage(response, '知识空间创建失败')); setCreating(false); return }
    const created = await response.json() as Workspace
    setName(''); setSlug(''); setDescription(''); setMessage(`“${created.name}”已创建，正在切换…`); setCreating(false)
    await refresh(); await switchTo(created.slug)
  }
  const edit = async (item: Workspace) => {
    const nextName = window.prompt('知识空间名称', item.name)?.trim()
    if (!nextName) return
    const nextDescription = window.prompt('空间说明（可留空）', item.description ?? '')
    if (nextDescription === null) return
    const response = await fetch(`${API}/workspaces/${encodeURIComponent(item.slug)}`, {
      method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: nextName, description: nextDescription.trim() }),
    })
    if (!response.ok) setMessage(await errorMessage(response, '知识空间更新失败')); else await refresh()
  }
  const setArchived = async (item: Workspace, archived: boolean) => {
    if (!archived && !window.confirm(`归档“${item.name}”？空间内资料不会删除，归档后不可检索。`)) return
    const response = await fetch(`${API}/workspaces/${encodeURIComponent(item.slug)}/${archived ? 'restore' : 'archive'}`, { method: 'POST', credentials: 'include' })
    if (!response.ok) setMessage(await errorMessage(response, archived ? '恢复失败' : '归档失败')); else await refresh()
  }
  const active = workspaces.filter(item => item.status === 'active')
  const archived = workspaces.filter(item => item.status === 'archived')
  return <div className={css.spacesLayout}>
    <section className={css.spaceIntro}><div><span>▦</span><div><h3>用空间隔离不同领域的知识</h3><p>每个空间拥有独立的资料、分类和检索上下文。切换后，页面管理和 DSH 大模型会同步使用同一个空间。</p></div></div><ul><li>适合区分个人、团队或不同项目</li><li>分类用于空间内部整理，不替代空间</li><li>不需要隔离时，保留默认空间即可</li></ul></section>
    <section className={css.spacePanel}>
      <div className={css.panelTitle}><div><h3>空间列表</h3><p>{active.length} 个启用 · {archived.length} 个归档</p></div></div>
      <div className={css.spaceGrid}>{workspaces.map(item => <article key={item.id} data-current={String(item.slug === current?.slug)} data-archived={String(item.status === 'archived')}>
        <div className={css.spaceIcon}>{item.is_default ? '知' : item.name.slice(0, 1)}</div>
        <div className={css.spaceBody}><div><strong>{item.name}</strong>{item.slug === current?.slug && <span>当前</span>}{item.status === 'archived' && <span>已归档</span>}</div><p>{item.description || '暂无空间说明'}</p><small>{item.slug}</small></div>
        <div className={css.spaceActions}>{item.status === 'active' && item.slug !== current?.slug && <button onClick={() => void switchTo(item.slug)}>切换</button>}<button onClick={() => void edit(item)}>编辑</button>{!item.is_default && item.slug !== current?.slug && <button onClick={() => void setArchived(item, item.status === 'archived')}>{item.status === 'archived' ? '恢复' : '归档'}</button>}</div>
      </article>)}</div>
    </section>
    <form className={css.spaceCreate} onSubmit={create}><div><h3>新建知识空间</h3><p>空间标识创建后保持不变，建议使用简短英文，例如 product、research。</p></div><div className={css.spaceFields}><label><span>空间名称</span><input value={name} onChange={event => setName(event.target.value)} placeholder="例如：产品研发" required /></label><label><span>空间标识</span><input value={slug} onChange={event => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="product" pattern="[a-z0-9][a-z0-9-]{0,63}" required /></label></div><label><span>空间说明</span><textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="说明这个空间收录什么内容，帮助使用者正确选择。" /></label><button className={css.primaryButton} disabled={creating}>{creating ? '创建中…' : '创建并切换'}</button>{message && <p className={css.progressText}>{message}</p>}</form>
  </div>
}

function ConversationConnect({ configured, refresh }: { configured: boolean; refresh(): Promise<unknown> }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [tokens, setTokens] = useState<Array<{ id: number; name: string; token_prefix: string; scopes: string[]; revoked_at: string | null; created_at: string }>>([])
  const loadTokens = async () => {
    const response = await fetch(`${API}/access-tokens`, { credentials: 'include', cache: 'no-store' })
    if (response.ok) setTokens((await response.json() as { items: typeof tokens }).items)
  }
  useEffect(() => { void loadTokens() }, [])
  const connect = async () => {
    setBusy(true); setMessage('正在创建最小权限访问令牌…')
    const tokenResponse = await fetch(`${API}/access-tokens`, {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'DSH 对话插件', scopes: ['knowledge:read', 'knowledge:search', 'knowledge:ask'] }),
    })
    if (!tokenResponse.ok) { setMessage(await errorMessage(tokenResponse, '访问令牌创建失败')); setBusy(false); return }
    const created = await tokenResponse.json() as { token: string }
    setMessage('正在安全写入 DSH 凭据存储…')
    const setupResponse = await fetch('/_cangzhi-plugin/token', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: created.token }),
    })
    if (!setupResponse.ok) { setMessage(await errorMessage(setupResponse, 'DSH 凭据写入失败')); setBusy(false); return }
    setMessage('连接成功，模型工具将在数秒内自动上线。'); setBusy(false); await Promise.all([refresh(), loadTokens()])
  }
  const disconnect = async () => {
    if (!window.confirm('断开 DSH 与藏知的对话连接？知识管理功能仍然可用。')) return
    setBusy(true)
    const response = await fetch('/_cangzhi-plugin/token', { method: 'DELETE' })
    setMessage(response.ok ? '已断开 DSH 对话连接' : await errorMessage(response, '断开失败'))
    setBusy(false); await refresh()
  }
  const revoke = async (id: number) => {
    if (!window.confirm('撤销这个藏知访问令牌？使用它的客户端会立即失效。')) return
    const response = await fetch(`${API}/access-tokens/${id}/revoke`, { method: 'POST', credentials: 'include' })
    if (!response.ok) setMessage(await errorMessage(response, '撤销失败'))
    await loadTokens()
  }
  return <section className={css.connectPanel}>
    <div className={css.connectHero}><span data-ok={String(configured)}>{configured ? '✓' : '↗'}</span><div><h3>{configured ? 'DSH 对话已连接藏知' : '让大模型直接调用藏知'}</h3><p>{configured ? '知识搜索、问答、文档读取和数据集查询工具已经注册到对话。' : '点击一次即可创建只读/检索/问答权限的独立令牌，并安全保存到 DSH 凭据存储。'}</p></div></div>
    <div className={css.capabilityGrid}><article><strong>知识检索</strong><small>按范围、分类和文档召回证据</small></article><article><strong>知识问答</strong><small>基于藏知内容生成带引用答案</small></article><article><strong>数据集查询</strong><small>查看结构、预览并精确查询表格</small></article></div>
    {!configured ? <button className={css.primaryButton} disabled={busy} onClick={() => void connect()}>{busy ? '正在连接…' : '启用 DSH 对话能力'}</button> : <button className={css.secondaryButton} disabled={busy} onClick={() => void disconnect()}>断开对话连接</button>}
    {message && <p className={css.progressText}>{message}</p>}
    <p className={css.securityNote}>令牌仅在创建时从藏知传入 DSH，本页面不会显示或回读密钥；可随时在藏知的访问令牌管理中撤销。</p>
    <div className={css.tokenList}><h4>藏知访问令牌</h4>{tokens.length === 0 ? <p>暂无访问令牌</p> : tokens.map(token => <div key={token.id}><div><strong>{token.name}</strong><small>{token.token_prefix}… · {token.scopes.join('、')}</small></div><span data-revoked={String(Boolean(token.revoked_at))}>{token.revoked_at ? '已撤销' : '有效'}</span>{!token.revoked_at && <button onClick={() => void revoke(token.id)}>撤销</button>}</div>)}</div>
  </section>
}

type ConsoleOverlayProps = InjectFace<ConsoleFace> & PropsLocale<typeof NS>

function ConsoleOverlay({ useCangzhiConsole, closeConsole, t }: ConsoleOverlayProps) {
  const state = useCangzhiConsole(value => value)
  if (!state.open) return null
  return (
    <section className={css.overlay} role="dialog" aria-modal="true" aria-label={t('consoleTitle')}>
      <header className={css.consoleHeader}>
        <strong className={css.consoleTitle}>{t('consoleTitle')}</strong>
        <span className={css.nativeBadge}>{t('frameHint')}</span>
        <button type="button" className={css.closeButton} aria-label={t('close')} title={t('close')} onClick={closeConsole}>×</button>
      </header>
      <NativeWorkspace />
    </section>
  )
}

type KnowledgeWorkbenchProps = InjectFace<ConsoleFace>
type WorkbenchDocument = { id: number; title: string; source_type: string; content_kind?: string; dataset_id?: number; updated_at?: string; category?: string; snippet?: string }
type WorkbenchTab = 'browse' | 'preview' | 'context'
type PreviewTable = { datasetId: number; columns: string[]; rows: Array<Record<string, unknown>>; total: number; offset: number; limit: number }
type EvidenceContextPayload = {
  evidence_type: string
  document_id: number
  document_version_id: number
  title: string
  heading_path?: string[]
  page?: number | null
  snippet?: string
  context_markdown?: string
  preview_url?: string | null
  original_url?: string | null
  table_location?: Record<string, unknown>
  dataset?: Record<string, unknown>
}
type EvidenceRowsPayload = { columns?: string[]; rows?: Array<Record<string, unknown>>; returned?: number; requested?: number; truncated?: boolean }
const PREVIEW_PAGE_SIZE = 50

function formatPreviewValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function evidenceAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null
  if (value.startsWith('/api/')) return `${API}${value.slice(4)}`
  return value
}

function EvidenceWorkbenchPreview({ context, rows }: { context: EvidenceContextPayload; rows: EvidenceRowsPayload | null }) {
  const columns = rows === null ? [] : ['row_number', ...(rows.columns ?? []).filter(column => column !== 'row_number')]
  const preview = evidenceAssetUrl(context.preview_url)
  const original = evidenceAssetUrl(context.original_url)
  const normalizedMarkdown = useMemo(() => normalizeEvidenceMarkdown(context.context_markdown), [context.context_markdown])
  const markdownLabels = useMemo(() => buildMarkdownLabels(), [])
  const canFormat = shouldRenderFormattedMarkdown(normalizedMarkdown)
  // Track the user's last *express* preference. The effective view drops back
  // to 'raw' whenever the evidence cannot be formatted (empty / oversized /
  // whitespace-only), so we never leave the user staring at a blank panel
  // after switching evidence.
  const [preferredView, setPreferredView] = useState<'formatted' | 'raw'>('formatted')
  const effectiveView: 'formatted' | 'raw' = canFormat ? preferredView : 'raw'
  const showFormatBar = Boolean(normalizedMarkdown) && canFormat
  const truncatedMarkdown = useMemo(
    () => effectiveView === 'formatted' ? truncateEvidenceMarkdown(normalizedMarkdown) : normalizedMarkdown,
    [normalizedMarkdown, effectiveView],
  )
  return <div className={css.exactEvidencePreview}>
    <div className={css.exactEvidenceMeta}><span>版本绑定证据</span><small>document_version_id {context.document_version_id}{context.page ? ` · 第 ${context.page} 页` : ''}</small></div>
    {context.heading_path && context.heading_path.length > 0 && <p className={css.exactEvidencePath}>{context.heading_path.join(' / ')}</p>}
    {showFormatBar && <div className={css.markdownFormatBar} role="tablist" aria-label="证据 Markdown 渲染模式"><button type="button" role="tab" aria-selected={effectiveView === 'formatted'} className={css.markdownFormatButton} data-active={effectiveView === 'formatted'} onClick={() => setPreferredView('formatted')}>格式化</button><button type="button" role="tab" aria-selected={effectiveView === 'raw'} className={css.markdownFormatButton} data-active={effectiveView === 'raw'} onClick={() => setPreferredView('raw')}>原文</button></div>}
    {normalizedMarkdown && effectiveView === 'formatted' && <div className={css.cangzhiMarkdown} data-cangzhi-markdown="evidence"><MarkdownText text={truncatedMarkdown} labels={markdownLabels} /></div>}
    {normalizedMarkdown && effectiveView === 'raw' && <pre className={css.markdownPreview}>{normalizedMarkdown}</pre>}
    {!normalizedMarkdown && context.snippet && <blockquote>{context.snippet}</blockquote>}
    {rows && <div className={css.tablePreview}><p>本次回答实际引用 {rows.returned ?? rows.rows?.length ?? 0} / {rows.requested ?? rows.rows?.length ?? 0} 行{rows.truncated ? '（受控截取）' : ''}</p><div className={css.tableScroll}><table><thead><tr>{columns.map(column => <th key={column}>{column === 'row_number' ? '原始行号' : column}</th>)}</tr></thead><tbody>{(rows.rows ?? []).map((row, index) => <tr key={String(row.row_number ?? index)}>{columns.map(column => <td key={column}>{formatPreviewValue(row[column])}</td>)}</tr>)}</tbody></table></div></div>}
    {!normalizedMarkdown && !context.snippet && !rows && <div className={css.previewPlaceholder}><span>▤</span><p>证据元数据已核验，但没有可显示的正文片段。</p></div>}
    {(preview || original) && <div className={css.evidenceAssetActions}>{preview && <button type="button" onClick={() => window.open(preview, '_blank', 'noopener,noreferrer')}>打开版本预览</button>}{original && <button type="button" onClick={() => window.open(original, '_blank', 'noopener,noreferrer')}>打开原文件</button>}</div>}
  </div>
}

function openDocumentInWorkbench(id: number, title: string, datasetId?: number): void {
  window.dispatchEvent(new CustomEvent('cangzhi-open-document', { detail: { id, title, datasetId } }))
}

type EvidenceLink = {
  readonly documentId: number
  readonly documentVersionId: number | null
  readonly chunkId: number | null
  readonly chunkType: string | null
  readonly datasetId: number | null
  readonly artifactVersion: number | null
  readonly evidenceType: string
  readonly title: string
  readonly snippet?: string
  readonly page: number | null
  readonly headingPath: readonly string[]
  readonly sourceRows: readonly number[]
  readonly columns: readonly string[]
  readonly queryPlan?: Readonly<Record<string, unknown>>
}

interface CangzhiEvidenceChatData {
  readonly evidence: readonly EvidenceLink[]
}

declare module '@deepseek-ai/dsh-client-ui-chat/client' {
  interface ChatNodeDataMap {
    'cangzhi-evidence': CangzhiEvidenceChatData
  }
}

interface CangzhiEvidenceState {
  readonly turn: number
  readonly calls: ReadonlyMap<string, string>
  readonly evidence: readonly EvidenceLink[]
  readonly endSeq?: number
}

function cangzhiEvidenceLocation(context: ConversationNodeContext<CangzhiEvidenceState>) {
  const location = context.start?.location ?? context.matches[0]?.location
  return location?.kind === 'turn' || location?.kind === 'step' ? location.turn : undefined
}

/** Fold successful Cangzhi MCP results into one durable, turn-scoped source node. */
const cangzhiEvidenceDefinition: ConversationNodeDefinition<CangzhiEvidenceState> = {
  kind: 'cangzhi-evidence',
  target: 'chat',
  match: (event) => {
    if (event.type === 'turn/start') return { id: String(event.data.turn), role: 'start' }
    if (event.type === 'tool/call' || event.type === 'tool/result' || event.type === 'turn/end') {
      return { id: String(event.data.turn), role: 'update' }
    }
    return null
  },
  start: (_context, match) => {
    if (match.event.type !== 'turn/start') throw new Error('cangzhi evidence requires turn/start')
    return { turn: match.event.data.turn, calls: new Map(), evidence: [] }
  },
  update: (context, match) => {
    if (match.event.type === 'tool/call') {
      const calls = new Map(context.state.calls)
      calls.set(String(match.event.data.callId), match.event.data.name)
      return { ...context.state, calls }
    }
    if (match.event.type === 'turn/end') {
      return { ...context.state, endSeq: match.event.seq }
    }
    if (match.event.type !== 'tool/result') return context.state
    const result = match.event.data.message.content[0]
    if (result?.type !== 'tool-result' || result.isError === true) return context.state
    const callId = String(match.event.data.message.source.callId)
    const toolName = context.state.calls.get(callId)
    if (toolName === undefined) return context.state
    const found = evidenceFromToolResult(toolName, result.content) as EvidenceLink[]
    if (found.length === 0) return context.state
    return { ...context.state, evidence: dedupeEvidenceLinks([...context.state.evidence, ...found]) as EvidenceLink[] }
  },
  publication: match => match.event.type === 'turn/end' ? 'immediate' : 'none',
  buildViewNode: (context): ChatConversationViewNode | null => {
    const state = context.state
    const location = cangzhiEvidenceLocation(context)
    if (state === undefined || state.endSeq === undefined || state.evidence.length === 0 || location === undefined) return null
    const evidence = suppressCatalogHints(state.evidence as EvidenceLink[]) as readonly EvidenceLink[]
    if (evidence.length === 0) return null
    return {
      key: context.key,
      kind: 'cangzhi-evidence',
      id: context.id,
      target: 'chat',
      anchorSeq: state.endSeq,
      location,
      visibility: 'visible',
      data: { evidence },
    }
  },
}

function answerEvidence(answer: string): EvidenceLink | null {
  if (typeof answer !== 'string' || answer.length === 0) return null
  return answerEvidenceShared(answer) as EvidenceLink | null
}

function openEvidenceInWorkbench(evidence: EvidenceLink): void {
  window.dispatchEvent(new CustomEvent('cangzhi-open-evidence', { detail: evidence }))
}

type CangzhiEvidenceNodeProps = PropsRuntime<'conversation.chat.node', 'cangzhi-evidence'>

function CangzhiEvidenceNode({ node }: CangzhiEvidenceNodeProps) {
  return <section className={css.answerEvidenceNode} aria-label={`回答证据 ${node.data.evidence.length} 条`}>
    <header><span>▤</span><strong>回答证据</strong><small>{node.data.evidence.length} 条 · 来自本轮藏知工具结果</small></header>
    <div>{node.data.evidence.map((evidence, index) => {
      const exact = evidence.documentVersionId !== null && (evidence.chunkId !== null || evidence.datasetId !== null)
      return <article key={`${evidence.chunkId ?? ''}:${evidence.datasetId ?? ''}:${evidence.documentVersionId ?? ''}:${index}`}>
        <b>{index + 1}</b>
        <div><strong>{evidence.title}</strong>{evidence.snippet && <p>{evidence.snippet.replace(/\s+/g, ' ').slice(0, 220)}</p>}<small>{formatEvidenceLink(evidence)}</small></div>
        <button type="button" disabled={!exact} title={exact ? '在右侧查看生成答案时使用的原始证据' : '这条旧记录缺少版本信息'} onClick={() => openEvidenceInWorkbench(evidence)}>{exact ? '查看原始证据' : '缺少版本信息'}</button>
      </article>
    })}</div>
  </section>
}

function KnowledgeWorkbench({ useCangzhiConsole, openKnowledge, closeKnowledge, openConsole }: KnowledgeWorkbenchProps) {
  const state = useCangzhiConsole(value => value)
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [documents, setDocuments] = useState<WorkbenchDocument[]>([])
  const [results, setResults] = useState<WorkbenchDocument[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<WorkbenchDocument | null>(null)
  const [tab, setTab] = useState<WorkbenchTab>('browse')
  const [pinned, setPinned] = useState<WorkbenchDocument[]>([])
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [previewTable, setPreviewTable] = useState<PreviewTable | null>(null)
  const [evidenceContext, setEvidenceContext] = useState<EvidenceContextPayload | null>(null)
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRowsPayload | null>(null)
  const [previewState, setPreviewState] = useState('选择资料后可在这里预览原文')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [width, setWidth] = useState(() => readWorkbenchWidthFromStorage(window.localStorage))
  const uploadInput = useRef<HTMLInputElement>(null)
  const resizeStart = useRef({ x: 0, width: WORKBENCH_SIZE_TABLE.standard })
  const widthRef = useRef(width)
  const workspaceSlugRef = useRef<string | null>(null)
  const tableRequestRef = useRef(0)
  const load = async () => {
    const authResponse = await fetch(`${API}/auth/status`, { credentials: 'include', cache: 'no-store' })
    if (!authResponse.ok) throw new Error(await errorMessage(authResponse, '登录状态读取失败'))
    const authValue = await authResponse.json() as AuthState
    setAuth(authValue)
    if (!authValue.authenticated) {
      setWorkspace(null); setDocuments([]); setResults([]); setSelected(null); setPinned([]); setPreviewUrl(''); setPreviewText(''); setPreviewTable(null); setEvidenceContext(null); setEvidenceRows(null)
      workspaceSlugRef.current = null
      return
    }
    const [documentsResponse, workspaceResponse] = await Promise.all([
      fetch(`${API}/documents/overview?limit=60&offset=0&include_processing=true`, { credentials: 'include', cache: 'no-store' }),
      fetch(`${API}/workspaces/current`, { credentials: 'include', cache: 'no-store' }),
    ])
    if (!workspaceResponse.ok || !documentsResponse.ok) throw new Error('当前知识空间读取失败')
    const nextWorkspace = await workspaceResponse.json() as Workspace
    const workspaceChanged = workspaceSlugRef.current !== null && workspaceSlugRef.current !== nextWorkspace.slug
    workspaceSlugRef.current = nextWorkspace.slug
    setWorkspace(nextWorkspace)
    const items = await documentsResponse.json() as DocumentItem[]
    setDocuments(items.map(item => ({ id: item.id, title: item.title, source_type: item.source_type, content_kind: item.content_kind, updated_at: item.updated_at, category: item.primary_category?.name })))
    if (workspaceChanged) {
      setQuery(''); setResults([]); setSelected(null); setPinned([]); setPreviewUrl(''); setPreviewText(''); setPreviewTable(null); setEvidenceContext(null); setEvidenceRows(null); setTab('browse')
      setPreviewState('选择资料后可在这里预览原文')
    }
  }
  useEffect(() => {
    if (!state.knowledgeOpen) return
    const refresh = () => { void load().catch(caught => setNotice(caught instanceof Error ? caught.message : '藏知服务不可用')) }
    refresh()
    window.addEventListener('cangzhi-workspace-changed', refresh)
    return () => window.removeEventListener('cangzhi-workspace-changed', refresh)
  }, [state.knowledgeOpen])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  useEffect(() => {
    const frame = document.querySelector('[data-shell-overlay]')?.parentElement
    if (frame === undefined || frame === null || !state.knowledgeOpen) return
    frame.dataset.cangzhiWorkbench = 'true'
    delete frame.dataset.cangzhiWorkbenchFullscreen
    frame.style.setProperty('--cangzhi-workbench-width', `${width}px`)
    return () => {
      delete frame.dataset.cangzhiWorkbench
      delete frame.dataset.cangzhiWorkbenchFullscreen
      frame.style.removeProperty('--cangzhi-workbench-width')
    }
  }, [state.knowledgeOpen, width])
  const search = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setNotice('')
    const response = await fetch(`${API}/search`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: query.trim(), limit: 40, offset: 0 }) })
    if (!response.ok) { setNotice(await errorMessage(response, '搜索失败')); setBusy(false); return }
    const body = await response.json() as { hits: SearchHit[] }
    setResults(body.hits.map(hit => ({ id: hit.document_id, title: hit.title, source_type: hit.source_type, content_kind: hit.evidence_type === 'dataset' ? 'dataset' : undefined, dataset_id: idNumber(hit.dataset_id) ?? undefined, category: hit.categories?.map(item => item.name).join('、'), snippet: hit.snippet })))
    setTab('browse')
    setBusy(false)
  }
  const loadDatasetRows = async (datasetId: number, offset: number, limit: number) => {
    const requestId = ++tableRequestRef.current
    setBusy(true)
    const rowsResponse = await fetch(`${API}/datasets/${datasetId}/rows?offset=${offset}&limit=${limit}`, { credentials: 'include', cache: 'no-store' })
    if (requestId !== tableRequestRef.current) return
    if (!rowsResponse.ok) { setPreviewState(await errorMessage(rowsResponse, '数据表行预览暂不可用')); setBusy(false); return }
    const rows = await rowsResponse.json() as { columns?: string[]; rows?: Array<Record<string, unknown>>; total?: number }
    setPreviewTable({ datasetId, columns: rows.columns ?? [], rows: rows.rows ?? [], total: rows.total ?? rows.rows?.length ?? 0, offset, limit })
    setPreviewState(''); setBusy(false)
  }
  const preview = async (item: WorkbenchDocument) => {
    tableRequestRef.current += 1
    setSelected(item); setTab('preview'); setPreviewState('正在生成预览…'); setPreviewText(''); setPreviewTable(null); setEvidenceContext(null); setEvidenceRows(null); setBusy(true)
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl('') }
    const isDataset = item.content_kind === 'dataset' || item.dataset_id !== undefined || /\.(xlsx?|xls)$/iu.test(item.title)
    if (isDataset) {
      const datasetsResponse = await fetch(`${API}/datasets?document_id=${item.id}`, { credentials: 'include', cache: 'no-store' })
      if (!datasetsResponse.ok) { setPreviewState(await errorMessage(datasetsResponse, '数据表尚未完成解析，暂时无法预览')); setBusy(false); return }
      const datasets = await datasetsResponse.json() as Array<{ id: number; name: string; sheet_name: string }>
      const dataset = item.dataset_id === undefined ? datasets[0] : datasets.find(candidate => candidate.id === item.dataset_id)
      if (dataset === undefined) { setPreviewState('数据表尚未生成可预览的数据集'); setBusy(false); return }
      await loadDatasetRows(dataset.id, 0, PREVIEW_PAGE_SIZE)
      return
    }
    const detailResponse = await fetch(`${API}/documents/${item.id}`, { credentials: 'include', cache: 'no-store' })
    if (detailResponse.ok) {
      const detail = await detailResponse.json() as { current_version?: { raw_content?: string | null } }
      const raw = detail.current_version?.raw_content
      if (typeof raw === 'string' && raw.length > 0) {
        setPreviewText(raw); setPreviewState(''); setBusy(false); return
      }
    }
    const response = await fetch(`${API}/documents/${item.id}/preview`, { credentials: 'include', cache: 'no-store' })
    if (!response.ok) { setPreviewState(await errorMessage(response, '这份资料暂时没有可用预览')); setBusy(false); return }
    const blob = await response.blob()
    setPreviewUrl(URL.createObjectURL(blob)); setPreviewState(''); setBusy(false)
  }
  const changeTablePage = (offset: number, limit = previewTable?.limit ?? PREVIEW_PAGE_SIZE) => {
    if (previewTable === null || offset < 0 || offset >= previewTable.total || busy) return
    void loadDatasetRows(previewTable.datasetId, offset, limit)
  }
  const previewEvidence = async (evidence: EvidenceLink) => {
    if (evidence.documentVersionId === null) {
      setPreviewState('这条历史证据缺少 document_version_id，无法安全地用当前最新版替代。')
      return
    }
    tableRequestRef.current += 1
    setSelected({ id: evidence.documentId, title: evidence.title, source_type: 'file', ...(evidence.datasetId === null ? {} : { content_kind: 'dataset', dataset_id: evidence.datasetId }) })
    setTab('preview'); setPreviewState('正在读取回答时使用的原始证据…'); setPreviewText(''); setPreviewTable(null); setEvidenceContext(null); setEvidenceRows(null); setBusy(true)
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl('') }
    const version = `document_version_id=${evidence.documentVersionId}`
    const artifact = evidence.artifactVersion === null ? '' : `&artifact_version=${evidence.artifactVersion}`
    const endpoint = evidence.datasetId !== null
      ? `${API}/v1/knowledge/evidence/by-dataset/${evidence.datasetId}?${version}${artifact}`
      : evidence.chunkId !== null
        ? `${API}/v1/knowledge/evidence/by-chunk/${evidence.chunkId}?${version}`
        : null
    if (endpoint === null) { setPreviewState('这条记录没有可定位的片段或数据集。'); setBusy(false); return }
    const response = await fetch(endpoint, { credentials: 'include', cache: 'no-store' })
    if (!response.ok) { setPreviewState(await errorMessage(response, '原始证据读取失败')); setBusy(false); return }
    const context = await response.json() as EvidenceContextPayload
    setEvidenceContext(context)
    if (evidence.datasetId !== null && evidence.sourceRows.length > 0) {
      const rowsResponse = await fetch(`${API}/v1/knowledge/evidence/by-dataset/${evidence.datasetId}/rows?${version}${artifact}`, {
        method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source_rows: evidence.sourceRows, columns: evidence.columns, limit: Math.min(200, Math.max(20, evidence.sourceRows.length)) }),
      })
      if (!rowsResponse.ok) { setPreviewState(await errorMessage(rowsResponse, '贡献原始行读取失败')); setBusy(false); return }
      setEvidenceRows(await rowsResponse.json() as EvidenceRowsPayload)
    }
    setPreviewState(''); setBusy(false)
  }
  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: number; title?: string; datasetId?: number }>).detail
      if (typeof detail?.id !== 'number') return
      const item = documents.find(document => document.id === detail.id) ?? {
        id: detail.id,
        title: detail.title?.trim() || `资料 #${detail.id}`,
        source_type: 'file',
        ...(idNumber(detail.datasetId) === null ? {} : { content_kind: 'dataset', dataset_id: idNumber(detail.datasetId)! }),
      }
      openKnowledge()
      void preview(item)
    }
    window.addEventListener('cangzhi-open-document', open)
    return () => window.removeEventListener('cangzhi-open-document', open)
  }, [documents, openKnowledge, previewUrl])
  useEffect(() => {
    const open = (event: Event) => {
      const evidence = (event as CustomEvent<EvidenceLink>).detail
      if (idNumber(evidence?.documentId) === null) return
      openKnowledge()
      void previewEvidence(evidence)
    }
    window.addEventListener('cangzhi-open-evidence', open)
    return () => window.removeEventListener('cangzhi-open-evidence', open)
  }, [openKnowledge, previewUrl])
  const useDocument = (item: WorkbenchDocument) => {
    setPinned(items => items.some(document => document.id === item.id) ? items : [...items, item])
    window.dispatchEvent(new CustomEvent('cangzhi-use-document', { detail: { prompt: `请重点读取并基于藏知资料《${item.title}》（document_id: ${item.id}）回答：\n\n` } }))
    setNotice(`已将《${item.title}》加入当前对话，问题草稿已经准备好`)
  }
  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true); setNotice('')
    for (const [index, file] of Array.from(files).entries()) {
      setNotice(`正在上传 ${index + 1}/${files.length}：${file.name}`)
      const body = new FormData(); body.append('file', file); body.append('title', '')
      const response = await fetch(`${API}/files/upload`, { method: 'POST', credentials: 'include', body })
      if (!response.ok) { setNotice(await errorMessage(response, `${file.name} 上传失败`)); setBusy(false); return }
    }
    setNotice('上传完成，资料正在处理'); setBusy(false); await load()
    if (uploadInput.current) uploadInput.current.value = ''
  }
  const beginResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeStart.current = { x: event.clientX, width }
  }
  const resize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const next = clampWorkbenchWidth(resizeStart.current.width + resizeStart.current.x - event.clientX)
    widthRef.current = next
    setWidth(next)
  }
  const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    const final = widthRef.current
    try {
      window.localStorage.setItem('cangzhi-workbench-width', String(final))
    } catch { /* storage may be unavailable */ }
  }
  if (!state.knowledgeOpen) return null
  const visible = results.length > 0 || query.trim() ? results : documents
  return <aside className={css.knowledgeWorkbench} aria-label="藏知工作台" style={{ width }}>
    <div className={css.workbenchResize} role="separator" aria-orientation="vertical" aria-label="调整藏知工作台宽度" aria-valuemin={WORKBENCH_SIZE_MIN} aria-valuemax={WORKBENCH_SIZE_MAX} aria-valuenow={width} onPointerDown={beginResize} onPointerMove={resize} onPointerUp={endResize} onPointerCancel={endResize}/>
    <header className={css.workbenchHeader}><div><CangzhiMark size={25}/><span><strong>藏知工作台</strong><small>{workspace?.name ?? '当前知识空间'}</small></span></div><div><button title="知识库管理" onClick={openConsole}>⚙</button><button title="关闭工作台" onClick={closeKnowledge}>×</button></div></header>
    <nav className={css.workbenchTabs} aria-label="藏知工作台视图"><button data-active={String(tab === 'browse')} onClick={() => setTab('browse')}>资料</button><button data-active={String(tab === 'preview')} onClick={() => setTab('preview')}>预览{selected ? ' · 1' : ''}</button><button data-active={String(tab === 'context')} onClick={() => setTab('context')}>当前对话{pinned.length > 0 ? ` · ${pinned.length}` : ''}</button></nav>
    {auth === null ? <div className={css.drawerLogin}><CangzhiMark size={44}/><h3>正在载入知识资料</h3><p>正在连接当前知识空间，请稍候。</p></div> : !auth.authenticated ? <div className={css.drawerLogin}><CangzhiMark size={44}/><h3>登录后浏览知识资料</h3><p>登录管理账户后，可以在对话旁搜索、预览和上传资料。</p><button onClick={openConsole}>前往登录</button></div> : <>
      {tab === 'browse' && <section className={css.workbenchPane}><div className={css.drawerToolbar}><form onSubmit={search}><span>⌕</span><input value={query} onChange={event => { setQuery(event.target.value); if (!event.target.value.trim()) setResults([]) }} placeholder="搜索标题、正文或知识片段"/><button disabled={busy}>{busy ? '搜索中…' : '搜索'}</button></form><input ref={uploadInput} hidden type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.md,.txt" multiple onChange={event => void upload(event.target.files)}/><button title="上传资料" onClick={() => uploadInput.current?.click()} disabled={busy}>＋</button></div><div className={css.drawerSectionTitle}><strong>{results.length > 0 || query.trim() ? '搜索结果' : '最近资料'}</strong><span>{visible.length} 项</span></div><div className={css.workbenchResults}>{visible.length === 0 ? <div className={css.drawerEmpty}>没有找到匹配的资料</div> : visible.map(item => <button key={item.id} data-selected={String(selected?.id === item.id)} onClick={() => void preview(item)}><span className={css.drawerFileIcon}>{item.source_type === 'note' ? '✎' : item.source_type === 'url' ? '↗' : '▤'}</span><div><strong>{item.title}</strong><small>{item.category || item.source_type}{item.updated_at ? ` · ${new Date(item.updated_at).toLocaleDateString()}` : ''}</small>{item.snippet && <p>{item.snippet.replace(/\s+/g, ' ').slice(0, 150)}</p>}</div></button>)}</div></section>}
      {tab === 'preview' && <section className={css.workbenchPreview}><div className={css.previewToolbar}><button onClick={() => setTab('browse')}>‹ 返回资料</button><strong title={selected?.title}>{selected?.title ?? '资料预览'}</strong>{selected && <button data-primary="true" onClick={() => useDocument(selected)}>{pinned.some(item => item.id === selected.id) ? '已加入对话' : '加入对话'}</button>}</div>{evidenceContext ? <EvidenceWorkbenchPreview context={evidenceContext} rows={evidenceRows}/> : previewUrl ? <object data={previewUrl} type="application/pdf" aria-label={`${selected?.title ?? '资料'}预览`}><p>当前浏览器无法显示 PDF 预览。</p></object> : previewText ? <pre className={css.markdownPreview}>{previewText}</pre> : previewTable ? <div className={css.tablePreview}><p>共 {previewTable.total} 行，当前显示第 {previewTable.offset + 1}–{Math.min(previewTable.offset + previewTable.rows.length, previewTable.total)} 行</p><div className={css.tableScroll}><table><thead><tr>{previewTable.columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{previewTable.rows.map((row, index) => <tr key={String(row.row_number ?? previewTable.offset + index)}>{previewTable.columns.map(column => <td key={column}>{formatPreviewValue(row[column])}</td>)}</tr>)}</tbody></table></div><div className={css.tablePagination}><span>第 {Math.floor(previewTable.offset / previewTable.limit) + 1} / {Math.max(1, Math.ceil(previewTable.total / previewTable.limit))} 页</span><div><button disabled={busy || previewTable.offset === 0} onClick={() => changeTablePage(previewTable.offset - previewTable.limit)}>上一页</button><button disabled={busy || previewTable.offset + previewTable.rows.length >= previewTable.total} onClick={() => changeTablePage(previewTable.offset + previewTable.limit)}>下一页</button></div><label>每页 <select disabled={busy} value={previewTable.limit} onChange={event => changeTablePage(0, Number(event.target.value))}><option value="25">25</option><option value="50">50</option><option value="100">100</option><option value="200">200</option></select> 行</label></div></div> : <div className={css.previewPlaceholder}><span>▤</span><p>{previewState}</p></div>}</section>}
      {tab === 'context' && <section className={css.contextPane}><div className={css.contextHero}><CangzhiMark size={34}/><div><strong>当前对话知识</strong><small>模型使用“{workspace?.name ?? '当前空间'}”，你还可以固定重点资料。</small></div></div>{pinned.length === 0 ? <div className={css.contextEmpty}>尚未固定资料。到“资料”中搜索并预览，然后点击“加入对话”。</div> : <div className={css.contextList}>{pinned.map(item => <article key={item.id}><span>▤</span><div><strong>{item.title}</strong><small>document_id: {item.id}</small></div><button onClick={() => setPinned(items => items.filter(document => document.id !== item.id))}>移除</button></article>)}</div>}<div className={css.contextTips}><strong>建议问法</strong><button onClick={() => window.dispatchEvent(new CustomEvent('cangzhi-use-document', { detail: { prompt: '请综合当前对话中固定的藏知资料，归纳共同结论、分歧与依据，并逐条标注来源。\n\n' } }))}>综合固定资料</button><button onClick={() => window.dispatchEvent(new CustomEvent('cangzhi-use-document', { detail: { prompt: '请核对当前问题与藏知资料中的原文，指出能够确认的事实、仍有疑问的部分，并标注来源。\n\n' } }))}>核对事实依据</button></div></section>}
    </>}
    {notice && <p className={css.workbenchNotice}>{notice}</p>}
    <footer className={css.workbenchStatus}><span data-ok={String(auth?.authenticated ?? false)}/><strong>{auth?.authenticated ? '知识服务在线' : '等待登录'}</strong><small>{busy ? '正在处理…' : `${documents.length} 份资料 · ${pinned.length} 份已加入对话`}</small></footer>
  </aside>
}

function argsRawOf(block: ToolCallViewProps['block']): string {
  return ('kind' in block ? block.call?.argsRaw : block.argsRaw) ?? ''
}

function resultTextOf(block: ToolCallViewProps['block']): string | null {
  if (!('kind' in block)) return null
  const text = block.content
    .map(item => item.type === 'text' ? item.text : JSON.stringify(item))
    .join('\n')
  if (text.length > 0) return text
  if (block.error === undefined) return null
  return `${block.error.name}: ${block.error.code}`
}

function parseObject(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text)
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

function argumentSummary(raw: string): string | null {
  const args = parseObject(raw)
  if (args === null) return raw.trim().slice(0, 160) || null
  for (const key of ['question', 'query', 'sql', 'document_id', 'chunk_id', 'dataset_id', 'scope']) {
    const value = args[key]
    if (typeof value === 'string' && value.length > 0) return value.slice(0, 160)
  }
  return null
}

function itemCount(value: unknown): number | null {
  if (Array.isArray(value)) return value.length
  if (typeof value !== 'object' || value === null) return null
  const object = value as Record<string, unknown>
  for (const key of ['results', 'hits', 'documents', 'chunks', 'datasets', 'rows', 'items', 'scopes', 'facets', 'evidence']) {
    if (Array.isArray(object[key])) return object[key].length
  }
  for (const key of ['count', 'total']) {
    if (typeof object[key] === 'number') return object[key]
  }
  return null
}

function resultPreview(value: Record<string, unknown> | null): string | null {
  if (value === null) return null
  for (const key of ['answer', 'summary', 'title', 'name', 'content', 'text']) {
    const candidate = value[key]
    if (typeof candidate === 'string' && candidate.length > 0) return candidate.slice(0, 360)
  }
  return null
}

function nestedRecord(value: Record<string, unknown> | null): Record<string, unknown> | null {
  let current = value
  for (let depth = 0; depth < 4; depth += 1) {
    let next: Record<string, unknown> | null = null
    for (const key of ['structuredContent', 'result']) {
      const candidate = current[key]
      if (typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate)) {
        next = candidate as Record<string, unknown>
        break
      }
    }
    if (next === null && Array.isArray(current.content)) {
      const text = current.content.find(item => typeof item === 'object' && item !== null && (item as Record<string, unknown>).type === 'text') as Record<string, unknown> | undefined
      const parsed = typeof text?.text === 'string' ? parseObject(text.text) : null
      if (parsed !== null) next = parsed
    }
    if (next === null) return current
    current = next
  }
  return current
}

function EvidencePreview({ tool, value }: { tool: string; value: Record<string, unknown> | null }) {
  const payload = nestedRecord(value)
  if (payload === null) return null
  if (tool === 'knowledge_search' && Array.isArray(payload.hits)) {
    const hits = payload.hits.slice(0, 3).filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    if (!hits.length) return <div className={css.evidenceEmpty}>当前知识空间没有找到相关证据</div>
    return <div className={css.evidencePreview}><div className={css.evidenceHeading}><span>检索到 {String(payload.total ?? hits.length)} 条证据</span><small>{typeof payload.backend === 'string' ? payload.backend : 'knowledge'}</small></div>{hits.map((hit, index) => { const documentId = idNumber(hit.document_id); return <article key={`${String(hit.document_id)}:${index}`}><span>{index + 1}</span><div><strong>{String(hit.title ?? '未命名资料')}</strong><p>{String(hit.snippet ?? hit.context ?? '').replace(/\s+/g, ' ').slice(0, 180)}</p></div>{documentId !== null && <button onClick={() => openDocumentInWorkbench(documentId, String(hit.title ?? '未命名资料'))}>右侧预览</button>}</article> })}</div>
  }
  if (tool === 'knowledge_query_dataset') {
    const links = collectStructuredEvidence(payload).filter((link): link is EvidenceLink => link.datasetId !== null)
    if (links.length === 0) return null
    const deduped = dedupeEvidenceLinks(links, 3) as EvidenceLink[]
    if (deduped.length === 0) return null
    return <div className={css.evidencePreview}><div className={css.evidenceHeading}><span>查询命中 {deduped.length} 条来源</span><small>knowledge_query_dataset</small></div>{deduped.map((link, index) => <article key={`${link.documentId}:${link.datasetId ?? ''}:${index}`}><span>{index + 1}</span><div><strong>{link.title}</strong>{link.snippet !== undefined && <p>{link.snippet.replace(/\s+/g, ' ').slice(0, 180)}</p>}<small>document_id {link.documentId} · dataset_id {link.datasetId}</small></div><button onClick={() => openDocumentInWorkbench(link.documentId, link.title, link.datasetId ?? undefined)}>打开来源证据 · 右侧预览</button></article>)}</div>
  }
  if (tool === 'knowledge_ask' && typeof payload.answer === 'string') {
    const citations = Array.isArray(payload.citations) ? payload.citations.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null).slice(0, 5) : []
    const structured = collectStructuredEvidence(payload)
    const inferred = structured.find(link => link.datasetId !== null) ?? answerEvidence(payload.answer)
    return <div className={css.answerPreview}><p>{payload.answer.slice(0, 520)}</p>{citations.length > 0 && <div><span>引用 {citations.length}</span>{citations.map((citation, index) => { const documentId = idNumber(citation.document_id); const datasetId = idNumber(citation.dataset_id); return <button key={`${String(citation.document_id ?? citation.chunk_id)}:${index}`} disabled={documentId === null} onClick={() => { if (documentId !== null) openDocumentInWorkbench(documentId, String(citation.title ?? citation.document_title ?? '知识证据'), datasetId ?? undefined) }}><b>{index + 1}</b>{String(citation.title ?? citation.document_title ?? '知识证据')}{documentId !== null ? ' · 右侧预览' : ''}</button> })}</div>}{citations.length === 0 && inferred !== null && <button className={css.answerEvidenceButton} onClick={() => openDocumentInWorkbench(inferred.documentId, inferred.title, inferred.datasetId ?? undefined)}>打开数据表证据 · 右侧预览</button>}</div>
  }
  const preview = resultPreview(payload)
  return preview === null ? null : <p className={css.toolPreview}>{preview}</p>
}

type CangzhiToolProps = ToolCallViewProps & PropsLocale<typeof NS>

function CangzhiToolCard({ toolName, block, inspect, t }: CangzhiToolProps) {
  const rawName = toolName.startsWith(TOOL_PREFIX) ? toolName.slice(TOOL_PREFIX.length) : toolName
  const output = resultTextOf(block)
  const value = output === null ? null : parseObject(output)
  const payload = nestedRecord(value)
  const running = !('kind' in block)
  const failed = !running && block.isError
  const count = payload === null ? null : itemCount(payload)
  const argument = argumentSummary(argsRawOf(block))
  const status = running
    ? t('running')
    : failed
      ? output?.split('\n', 1)[0] ?? t('failed')
      : count === null ? t('done') : t('items', { count })
  const title = t(`tools.${rawName}` as never)
  return (
    <div className={css.toolCard} data-tool={toolName} data-state={failed ? 'error' : running ? 'running' : 'ok'}>
      <div className={css.toolRow}>
        <span className={css.toolGlyph} aria-hidden>▤</span>
        <span className={css.toolTitle}>{title}</span>
        <span className={css.toolSummary}>{argument === null ? status : `${argument} · ${status}`}</span>
        {inspect !== undefined && (
          <button type="button" className={css.inspectButton} onClick={inspect} title={t('inspect')}>↗</button>
        )}
      </div>
      {!failed && <EvidencePreview tool={rawName} value={value} />}
      {output !== null && (
        <details className={css.toolDetails}>
          <summary>{t('details')}</summary>
          <pre className={css.toolOutput}>{output.slice(0, 12000)}</pre>
        </details>
      )}
    </div>
  )
}

export const inject = ['slots', 'locale', 'settingsScope', 'sessions', 'uiConversation']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'cangzhi: dictionaries')
  ctx.uiConversation.events.register(cangzhiEvidenceDefinition)
  const consoleFace = createConsoleFace(ctx)
  const settingsFace: CangzhiSettingsFace = {
    settingsScope: ctx.settingsScope.bind<ConnectionSettings>({ namespace: NS }),
  }

  ctx.slots.inject('conversation.hero.context', () => ctx.slots.register({
    name: 'conversation.hero.context', id: 'cangzhi-home', order: 10,
    locale: NS,
    inject: () => consoleFace,
  }, HomeIntegration))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock', id: 'cangzhi-context', order: -20,
    locale: NS,
    inject: () => consoleFace,
  }, KnowledgeDock))

  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions', id: 'cangzhi-knowledge-space', order: 20,
    locale: NS,
    inject: () => consoleFace,
  }, ConversationKnowledgeHeader))

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'cangzhi-console',
    order: 40,
    locale: NS,
    inject: () => consoleFace,
  }, ConsoleAction))

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'cangzhi',
    order: 5,
    label: () => ctx.locale.bind(NS)('settingsTab'),
    locale: NS,
    inject: () => settingsFace,
  }, CangzhiSettingsTab))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'cangzhi-console',
    order: 100,
    locale: NS,
    inject: () => consoleFace,
  }, ConsoleOverlay))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay', id: 'cangzhi-knowledge-workbench', order: 90,
    inject: () => consoleFace,
  }, KnowledgeWorkbench))

  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node', key: 'cangzhi-evidence',
  }, CangzhiEvidenceNode))

  ctx.slots.inject('tool.call.toolview', function* () {
    for (const rawName of RAW_TOOLS) {
      yield ctx.slots.register({
        name: 'tool.call.toolview',
        key: `${TOOL_PREFIX}${rawName}`,
        locale: NS,
      }, CangzhiToolCard)
    }
  })
}
