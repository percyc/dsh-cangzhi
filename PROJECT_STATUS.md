# 项目状态

更新时间：2026-09-07

## 项目目标

为 DSH 提供藏知知识库的原生入口、知识空间选择、资料管理、状态诊断和 MCP 检索能力，同时保持藏知服务与 DSH 适配器解耦。

## 当前阶段

状态：个人 Beta / 多人协作开发中

当前交付：0.11.2 预览请求生命周期与草稿保护，基于 0.11.1 工作台体验优化。Ark 实现请求辅助模块与 7 项测试，Codex 集成预览、会话定向草稿追加和 3 项保护测试。109 项测试（无跳过）、构建和语法检查通过；真实浏览器快速切换、草稿追加与历史证据仍待验收。

## 最近完成

- 会话级知识空间隔离与状态恢复（ADR-009）：Host 在每个 live agent 作用域注册 `mcp__cangzhi__*` scoped 覆盖，`execute` 按 `exec.agent.id`/父会话继承解析工作空间并通过插件回环代理携带 `x-cangzhi-workspace` 发出 `tools/call`；scoped 注册 shadow 全局 bridge 工具，切换立即生效。`cangzhi-mcp` 注册/重连与 agent 创建的竞态用 `tools/change` 签名比对 + dispose/重注册处理；plugin 启动时还会主动对已存在的 live agents 触发 `onAgentCreated`、强制首次 `onToolsChange`，避免错过 manager 订阅前已就绪的 bridge。
- 持久化在 DSH 原生 `storage-domain` 之上用内联 `defineDomain`/`domainTable`/迷你 `z` 实现（不依赖 `@deepseek-ai/dsh-storage-domain` 和 `zod` 的运行时解析），新增 `cangzhi_session` domain（`workspaces`/`policies` 表，`per-record`），`put` 耐久后返回；`ctx.get('storage')` 不可用时降级内存并告警，不依赖浏览器 localStorage 作为安全边界。`@deepseek-ai/dsh-storage` 仍为 peerDependency（`ctx.storage` 由 DSH 提供）。
- 客户端控制端点显式携带 `sessionId`：`GET/POST /workspace` 与 `GET/POST /session-policy` 都以 `sessionId` 为键；workspace 查询/改动未带 `sessionId` 返回 400，仅 `processDefault:true` 允许进程级变更。`syncModelWorkspace(slug, sessionId)` 仅在持有会话时 POST；管理中心（无会话绑定）不再写任何模型工作空间。Popover/Dock 改为先读 `/_cangzhi-plugin/workspace?sessionId=...`、按 Host 返回的空间展示，不在加载页面时用 Cookie 自动写入会话绑定；`useEffect` 依赖补齐 `sessionId`，切换会话后立刻重载，不再让一个会话的 cookie 跨写到另一个会话。
- 入站信任边界：插件回环代理对 `x-cangzhi-workspace` 做 slug 正则校验，畸形值直接拒绝；未带 header 的进程级 bridge 仍回退到 `activeWorkspaceSlug`（明确降级默认）。
- MCP 语义：`invokeCangzhiMcp` 显式 120_000ms 默认 timeout（`exec.signal` 取消仍然优先），JSON 与 SSE 双路响应解析，`isError`/JSON-RPC `error` 抛错，`structuredContent` 透传；4xx/5xx 立刻丢弃缓存的 `Mcp-Session-Id`。
- 回归测试 `tests/session-state.test.mjs`（10 项纯解析/持久化/降级/SSE）+ `tests/session-manager.test.mjs`（DSH 耦合，含经过 `ctx.tools.execute` 真实管线的并发 A/B 隔离、父子继承与隔离、策略持久化、无 sessionId 拒绝、bridge 重连 race、桥消失→0 覆盖回归）+ `tests/session-policy.test.mjs` + 既有 markdown/preview/refresh 等套件，共 **96 项** 全部通过；DSH preset 构建 + `node --check` 通过；`import('/data/share/dsh-cangzhi/lib/index.js')` 不再 `ERR_MODULE_NOT_FOUND`。

## 最近完成历史

- 新建对话、输入区和会话头部均提供紧凑的藏知入口。
- Popover 支持登录、连接状态、知识空间选择、资料抽屉和管理中心入口。
- 增加“本对话使用藏知”二态开关，按 DSH `sessionId` 真正限制该 Agent 的提示词和 MCP 工具。
- 增加按知识空间定位处理失败资料的管理中心入口。
- 增加 DSH 设置页中的 API、Web 和默认空间配置。
- 修复会话策略缺陷：之前开启会泄漏 deny 限制，关闭后无法真正恢复工具可见。
- 增加 `GET /_cangzhi-plugin/session-policy?sessionId=...` 调试端点，可查看策略是否已应用到目标会话。
- 客户端会等待 Host 响应并在失败时在 Popover 暴露错误，避免“静默”关闭。
- 客户端 `setPolicy` 改为只在 Host 确认后提交本地状态与 `localStorage`，杜绝“UI 显示关闭但模型仍可调用工具”的假关闭。
- 增加 `tests/session-policy.test.mjs`，覆盖默认状态、关闭、再次开启、父→子传播与子→父隔离。
- 数据表预览改为服务端分页，支持每页 25/50/100/200 行切换，并将表格字号统一到 DSH 的 13px/20px 控件正文尺度。
- 知识工具结果卡片/工作台加入"打开来源证据/右侧预览"统一入口；最终回答下方也通过 DSH `conversation.chat.assistant-actions` 显示“来源”按钮。文本回退兼容 `document_id=387`、`文档 387`、`dataset_id=354`、`数据集 ID 是 **354**` 等常见格式。
- 工作台保留 360–760px 连续拖拽与宽度记忆；用户验证后移除窄/标准/宽档位和全屏按钮，减少顶栏视觉噪音。
- 最终回答后的证据改为独立 `cangzhi-evidence` 对话节点，直接折叠本轮成功的藏知 MCP 结果，不再依赖模型回答文本正则。
- 证据点击后使用文档版本、片段、数据集产物版本和 `source_rows` 打开右侧精确预览；缺少版本身份的旧记录不会冒用最新版。
- 工作台证据 Markdown 切换为 DSH `MarkdownText` 渲染，保留"原文"入口与安全 URL 策略，多列表格在工作台内横向滚动（ADR-005）。
- 工作台证据 Markdown 切到不可格式化证据时不再显示空白：渲染时强制 `effectiveView = canFormat ? preferredView : 'raw'`，并把 64 KiB / UTF-8 边界判断从 `Buffer.byteLength` 迁移到 `TextEncoder`（带手写 fallback），浏览器 bundle 不再依赖 Node 全局。
- 最终证据区区分搜索发现线索和精确数据集证据；同一文档版本已有 `source_rows` 时抑制被替代的 `dataset_catalog`，工具过程卡保持完整（ADR-006）。
- 预览渲染改为类型路由：服务端 `evidence_type` / `document_type` / 数据集元数据优先，扩展名与内容识别只兼容旧数据；数据表、Markdown、PDF / Word 和纯文本分别使用对应渲染器（ADR-008）。

## 当前协作任务

- 代码完成、浏览器待验收：预览竞态与草稿保护（ADR-011）。Codex 集成、Ark 请求生命周期辅助模块；newapi MiniMax M3 复核已发起。旧请求不能提交内容或错误；关闭/换空间取消请求；准备提问保留纯文字草稿，结构化或提交中草稿拒绝重写。历史空间身份未实施迁移，仅增加明确提示。
- 代码完成、浏览器待验收：工作台可读性与搜索/失败反馈优化（ADR-010）。搜索输入与已提交结果分离，清除恢复资料列表；补异常收尾、键盘调宽与可见焦点；“加入对话”明确为“准备提问”，综合草稿携带资料身份。Codex 交互与集成，Ark 样式，newapi MiniMax M3 复核。99 项测试、构建和语法检查通过。
- 进行中：会话级知识空间隔离与状态恢复。代码及 Host 验证完成，0.11.0 已安装 web Profile；浏览器端并发 A/B 和预览回归尚未完成。负责人：Codex 集成；Ark 实现；newapi MiniMax M3 复核。
- 已完成：预览渲染器分类（ADR-008）。不再只看 Markdown 字符，而是先使用后端证据与文档类型元数据，再将数据表、Markdown / 笔记、PDF / Word 和纯文本交给各自的渲染器。`dataset_catalog` 不再显示“代表行”长摘要，而是核验版本后打开真实分页表格；有 `source_rows` 时仍只显示精确贡献行。80 项测试和 DSH preset 构建通过，3080 已重启并确认下发新 bundle。
- 已完成：处理队列实时状态（负责人：Codex 集成；Ark 实现；MiniMax M3、agy 复核，ADR-007）。管理中心可自动发现外部任务，处理中约 3 秒、空闲 15 秒、隐藏 60 秒刷新；顶部当前空间计数使用完整 `pipeline.overall_status`，服务器状态使用后端文档级任务统计；全量刷新期间暂停轻量轮询，构建与测试通过。待重启 DSH 与藏知 API 后做真实任务 `0 → 处理中 → 0` 浏览器验收。
- 已完成：回答证据分层与去重（负责人：Codex 集成；Ark 实现；MiniMax M3、agy 独立审查）。真实 session 载荷、61 项测试、DSH preset 构建和产物语法检查均通过；待 DSH 重启后做浏览器点击验收。
- 后续优先任务：完成真实浏览器 A/B 会话切换、空间选择、开关与证据预览验收。
- 后续功能重点：快速连续点击证据的请求竞态；空间切换后历史证据的空间身份；准备提问时现有草稿的保留；将过大的 plugin.tsx 拆分为入口、工作台和管理中心，降低多人修改冲突。

## 重要限制

- 每会话工作空间与能力开关持久化依赖 DSH `storage-domain`（`ctx.get('storage')`）；若运行 Profile 未装载 storage-domain，会自动降级为进程内存 store 并告警，此时 Host 重启会回到进程默认空间与默认开启。
- `@deepseek-ai/dsh-storage-domain` / `zod` 在本轮已全部内联进 bundle（`src/host/storage-open.mjs` 复制 `defineDomain`/`domainTable` + 迷你 `z`），不再作为 peerDependency 列出；`@deepseek-ai/dsh-storage` 仍为 peerDependency（`ctx.storage` hub 由 DSH 注入）。
- 入站 `x-cangzhi-workspace` 信任边界：插件回环代理对 slug 做正则校验，畸形值直接拒绝；未带 header 的请求回退到 `activeWorkspaceSlug`（明确降级默认），与 DSH 进程内合法调用方（`cangzhi-mcp` bridge、scoped override）共同构成可观察的隔离语义，不依赖 IP/端口边界。
- 会话级工作空间隔离发生在 Host 的 scoped override；进程级 `activeWorkspaceSlug` 仅作为未绑定会话 / 全局 `cangzhi-mcp` bridge 的明确降级默认，不再作为隔离边界。
- 正在执行的模型步骤不会被中途取消；空间/策略开关从下一步生效。
- 子代理（plan、team、schedule）拥有独立 ScopeKey，从其父策略/空间继承；未配置 pin 时随父链解析。
- 旧版 DSH 可能没有 `conversation.hero.context` 槽位；输入区和会话头部入口仍应作为降级路径保留。
- `desiredPolicies` 已迁移到持久化 store；Host 重启后策略按 store 恢复。
- 只有新产生且工具响应携带 `document_version_id` 的数据集查询能打开精确贡献行；旧历史回答会明确提示缺少版本信息。
- Client 构建依赖目标 DSH 的本地 preset，发布包必须保留已构建的 `lib/`。

## 运行信息

- DSH Profile：`web`
- 默认 Web 端口：`3080`
- 内部 MCP 回环端口：`3081`
- 插件控制路径：`/_cangzhi-plugin/*`
- API 同源代理：`/_dsh-cangzhi-api`
- 当前插件来源：`file:/data/share/dsh-cangzhi`
- 2026-09-07 最终构建已重新安装并校验前后端 SHA-256 一致；确认端口空闲后启动 3080/3081，3080 返回预期未登录 401。浏览器交互验收仍待完成。

## 验收标准

- DSH 能正常启动且不出现插件 bundle 加载错误。
- 新建对话只有轻量入口，Popover 能打开并关闭。
- 已登录时可以选择知识空间，下一次 MCP 调用使用所选空间。
- 资料抽屉、管理中心和处理失败资料定位功能仍可用。
- PAT 不出现在浏览器可读存储中，断开后 MCP 明确返回未配置。
- 构建、`node --check` 和 `node --test tests/*.test.mjs` 全部通过。
- 关闭“本对话使用藏知”后，下一步模型调用看不到任何 `mcp__cangzhi__*` 工具；再次开启后工具恢复可见。
- 并发 A/B 对话可选择不同知识空间，各自 `mcp__cangzhi__*` 请求携带各自空间，互不影响。
- 刷新会话、恢复会话及 Host 重启后，空间与能力开关仍按原 `sessionId` 保持。
- 未提供 `sessionId` 时，workspace 查询/改动返回 400；界面明确显示未隔离降级，不声称已完成隔离。
- 回答正文不写任何 ID 时，只要本轮成功调用藏知并返回可追溯身份，回答后仍显示证据列表并可打开原始证据。

## 交付前检查

1. 更新本文件的当前阶段、限制和下一步。
2. 在 `DEVLOG.md` 追加本次开发节点。
3. 架构或数据语义变化时新增 ADR。
4. 记录实际运行命令和结果，不使用“应该可以”代替验证。
