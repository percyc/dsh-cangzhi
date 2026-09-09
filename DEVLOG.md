# 开发日志

本文件按时间追加，记录重要开发节点、参与者和验证结果。历史记录原则上不改写。

## 2026-08-31：知识入口交互改造

参与者：Ark（实现）、MiniMax M3（审查与构建）、Codex（项目经理、集成与验收）

目标：解决新建对话没有知识空间入口、知识能力占用大面积区域、用户无法快速进入资料管理的问题。

完成：

- 将首页知识区域改为轻量入口。
- 在输入区增加紧凑“知识”入口。
- 新增 Popover，集中承载知识空间选择、连接状态、登录、资料抽屉和管理中心入口。
- 增加关闭 / 自动 / 始终使用偏好。
- 修复 hooks 顺序、弹层边界定位、按钮类型和部分中英文文案问题。
- 将处理失败资料按知识空间聚合，支持直接定位到失败列表。

验证：

- 使用 `newapi/ark-code-latest` 完成首轮实现。
- 使用 `newapi/minimax-m3` 完成第二轮审查。
- DSH 临时端口启动成功。
- 当前 `web` Profile 已安装工作区最新构建产物。
- `tsdown` 构建成功。
- `node --check lib/index.js` 和 `node --check lib/client.js` 通过。
- 插件 client bundle HTTP 200，当前页面 bootstrap 已包含 `dsh-cangzhi`。

限制：

- 当前知识空间仍是进程级共享。
- 能力偏好目前是浏览器偏好展示，不是真正的 MCP/system prompt 会话开关。

下一步：参照 `docs/adr/ADR-002-会话与空间隔离.md`，接入 DSH sessionId 并补充 Host/MCP 自动化测试。

## 2026-08-31：本对话藏知开关改为真实 Session 策略

- **背景**：此前“知识能力偏好”只写入浏览器 localStorage，且提供“关闭/自动/始终使用”三种容易误解的选项；它不会改变模型可见工具，关闭后仍可能调用藏知。
- **实现**：改为“本对话使用藏知”的二态开关；会话头部/输入区从 DSH `sessionId` 读取状态，并调用 Host 控制端点。Host 通过 Agent 作用域隐藏 Cangzhi system-prompt，并用 `ctx.tools.restrict({ deny })` 拒绝 14 个藏知 MCP 工具；新建 Agent 默认开启，关闭状态会随 sessionId 保留。
- **边界**：知识空间仍是当前 DSH 进程级选择，本次只解决“是否允许本对话调用藏知能力”；正在执行的模型步骤不会被中途取消，策略从下一步生效。
- **验证**：`DSH_SOURCE=/home/percy/software/deepseek-harness /home/percy/software/deepseek-harness/node_modules/.bin/tsdown --config tsdown.config.ts`、`node scripts/rewrite-client-id.mjs`、`node --check lib/index.js`、`node --check lib/client.js` 和 `git diff --check` 均通过。

## 2026-08-31：修复首页入口未绑定当前会话

- **问题**：首页入口的 Popover 没有拿到 DSH `sessionId`，从该入口关闭能力时只能更新浏览器状态，模型仍可调用藏知。
- **修复**：Client 注入 Session Controller，从当前 session list 读取选中会话，并让首页、输入区、会话头部共用同一 session 策略；切换会话时自动重新读取对应开关。
- **验证**：重新构建、`node --check`、`git diff --check`，并用最新 DSH 启动 Web profile 无插件加载错误。

## 2026-08-31：修复 Markdown、数据表和证据预览

- **问题**：工作台统一请求 PDF 版式预览，Markdown 和 Excel 没有可用的 `preview_blob` 时显示空白；证据卡片对 MCP 包装层和字符串形式的 `document_id` 处理不完整，右侧预览按钮可能缺失。
- **实现**：Markdown/文本资料改读文档当前版本的 `raw_content`；数据表通过 `datasets?document_id=` 和 `/rows` 渲染前 100 行；证据结果增加多层 MCP payload 解包、数字 ID 归一化，并在搜索证据和问答引用中提供“右侧预览”。
- **验证**：构建、`node --check lib/index.js`、`node --check lib/client.js` 和 `git diff --check` 均通过。

## 2026-08-31：补充无结构化引用回答的证据入口

- **背景**：部分 `knowledge_ask` 返回只在答案文本中写出 `dataset_id`、`document_id`，没有 `citations` 数组，因此回答卡片无法生成按钮。
- **实现**：识别答案中的数据集/文档标识，显示“打开数据表证据 · 右侧预览”；结构化引用仍优先使用，并将 `dataset_id` 传递给工作台，避免多数据集文档打开错误的数据集。
- **验证**：重新构建、Node 语法检查和差异检查通过。

## 2026-08-31：会话策略在切换“开”时泄漏工具限制

- **背景**：用户报告在 DSH 对话里点击“关闭藏知”后模型仍能调用 `mcp__cangzhi__*` 工具并返回菜单。审计 `src/index.ts` 的会话策略实现，发现两个串联问题：
  1. `applySessionPolicy(agent, true)` 早返回时只删除 `sessionPolicies` 映射，**不会调用旧的 disposer**，因此 deny 限制在重新打开时仍然生效——切回 on 的用户也会看到工具被禁用，模型行为与 UI 状态错位。
  2. `agent/created` 监听只读取 `agent.id`，父→子策略继承依赖 `parentSession`，但关闭会话时已经存在的子代理不会被重写。
- **修复**：
  - `applySessionPolicy` 改为统一先 dispose 再按需重建，并显式在 `enabled === true` 时同样调用 disposer；`sessionPolicies.delete(agent.id)` 提到分支前。
  - `agent/disposed` 现在也清理 `desiredPolicies`，避免悬挂状态。
  - 新增 `propagatePolicyToChildren(parentId, enabled)`，在 HTTP 处理器和创建监听里把策略级联到子代理。
  - 新增 `GET /_cangzhi-plugin/session-policy?sessionId=...` 调试端点，返回 `{ sessionId, desired, live, restricted }`，便于核对策略是否真正落到目标 Agent。
  - `POST` 响应改为 `200 { applied, sessionId, enabled }`，客户端基于此判断是否需要降级提示。
  - Client `useKnowledgeSession.setPolicy` 改为 async，失败时保持 UI 状态为“关闭”并通过 `cangzhi-policy-failed` 事件把错误送进 Popover，避免静默回退。
  - 新增 `tests/session-policy.test.mjs` 单元测试，使用 DSH `cordis` / `dsh-scope` / `dsh-system-prompt` / `dsh-tools` 的真实 lib，覆盖默认状态、关闭、再次开启、父→子传播、子→父隔离和“关闭后再次开启可恢复”6 个断言。
- **验证**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node /home/percy/software/deepseek-harness/node_modules/tsdown/dist/run.mjs --config tsdown.config.ts` 通过。
  - `node scripts/rewrite-client-id.mjs` 通过。
  - `node --check lib/index.js` 与 `node --check lib/client.js` 通过。
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node --test tests/session-policy.test.mjs` 全部 6 项断言通过。
- **限制**：
  - `desiredPolicies` 仍仅在内存中，DSH 进程重启后回到默认（on）；后续需要持久化时再补 ADR。
  - 子代理若在父会话关闭之前已经运行，当前不会回溯重写其 scope，仅新创建的子代理会按新策略生效。

## 2026-08-31：第二轮审查：消除客户端“假关闭”

- **审查人**：MiniMax M3
- **结论**：Ark 上一轮对 Host 侧的修复（`applySessionPolicy` dispose/重建、`propagatePolicyToChildren`、`agent/disposed` 清理、`GET` 调试端点）均正确；`tools.restrict` 的 scope 要求由 `agent.ctx` 天然满足，逻辑无回归。**但 Client `useKnowledgeSession.setPolicy` 仍存在“假关闭”**：
  - 旧实现先 `setPolicyState(next)` + `savePolicy(...)` 再 `fetch(POST)`，若 Host 调用失败（断网、4xx/5xx、JSON 解析异常等），本地状态和 localStorage 已经显示“off”，但模型仍能调用 `mcp__cangzhi__*`，与 UI 状态错位。
  - 旧实现对 `body.applied === false`（agent 尚未创建、策略已存盘但未挂载）的情况静默忽略，调用方 `handlePolicyChange` 不检查返回值。
- **修复**：仅在 `fetch` 成功后才提交本地状态与 `localStorage`；失败时由 `cangzhi-policy-failed` 事件在 Popover 暴露错误，UI 保留旧值，使 UI 与模型实际可见工具集保持一致。`sessionId === undefined` 的进程级降级路径不受影响。
- **验证**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node /home/percy/software/deepseek-harness/node_modules/tsdown/dist/run.mjs --config tsdown.config.ts` 通过。
  - `node scripts/rewrite-client-id.mjs` 通过。
  - `node --check lib/index.js` 与 `node --check lib/client.js` 通过。
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node --test tests/session-policy.test.mjs` 通过。
  - `git diff --check` 无冲突标记。
- **保留问题**（不在本轮范围，避免无依据大改）：
  - `tests/session-policy.test.mjs` 在测试中复刻了 `applySessionPolicy` 而非调用 `src/index.ts` 内的实现，仅起到库契约回归作用；若要在测试中覆盖生产代码，需要把策略管理拆成独立模块并提供构建产物供 `node --test` 直接 import。本轮不改。
  - `ctx.agents.get/list` 的返回类型（公开 `Agent` 仅含 `id`）与运行期形态（`ctx` + `session`）不一致，现有 `as unknown as` 断言在 DSH 0.1.2-alpha.1 内可工作，但缺少正式类型桥接。
  - `body.applied === false`（agent 尚未创建）目前只在返回值中反映，未被 `handlePolicyChange` 消费。Host 端 `desiredPolicies` 已正确存盘，子代理在 `agent/created` 时会回放，模型最终会受限；只是 Client 没有“待生效”提示。

## 2026-08-31：数据表预览改为分页并统一字号

- **问题**：数据表预览固定只请求前 100 行，无法查看较大的数据集；表格单元格字号仍使用 9px，明显小于 DSH 的正文/控件字号。
- **实现**：改为服务端分页请求，默认每页 50 行，支持 25/50/100/200 行切换、上一页/下一页和当前页范围提示；分页请求继续携带 `offset`/`limit`，不会一次性加载完整数据集。表格和分页控件统一到 DSH 的 13px/20px 控件正文尺度。
- **验证**：重新构建、Node 语法检查和 `git diff --check` 通过。

## 2026-08-31：证据入口结构化 + 工作台档位与全屏阅读

- **背景**：
  - `knowledge_query_dataset` 的结果对象里其实已经带 `document_id` / `dataset_id`，但卡片渲染只走 `resultPreview` 文本路径，模型答错数据集时用户无法直接打开来源；`answerEvidence` 又只靠脆弱正则从 `knowledge_ask` 文本里识别。
  - 藏知工作台只有一个连续拖拽的宽度，没有"档位"概念；阅读较长 PDF/Markdown 时要么太小要么太挤。
- **实现**：
  - 抽出 `src/client/lib/evidence.mjs` 与 `src/client/lib/workbench-size.mjs` 两个零依赖模块；plugin.tsx 改 import 这些纯函数。`EvidencePreview` 增加 `knowledge_query_dataset` 分支，递归解包 MCP `content`/`structuredContent`/`result` 三层后再用 `collectStructuredEvidence` 收集 `document_id + dataset_id` 链接，按 document+dataset 去重最多 3 条，按钮文案统一为"打开来源证据 · 右侧预览"，并复用既有的 `cangzhi-open-document` 事件。`answerEvidence` 改为先尝试把 `answer` 解析为 JSON 取结构化链接，结构化拿不到时再回退到正则；`knowledge_ask` 优先用 `payload` 自身的结构化字段，结构化为空时再走 answer 文本。
  - 工作台增加 `narrow/standard/wide` 三档（420/520/720），并加入全屏阅读切换。`selectSize` 同步写入 `cangzhi-workbench-size` + `cangzhi-workbench-width`；全屏写入 `cangzhi-workbench-fullscreen` 并在 frame 上挂 `data-cangzhi-workbench-fullscreen`，CSS 通过 `[data-cangzhi-workbench='true'][data-cangzhi-workbench-fullscreen='true']` 调整为 `min(1100px, 100vw - 32px)`。拖拽的 `endResize` 仍然按 360–760 收尾并推断档位，原有 `cangzhi-workbench-width` 兼容性保留。移动端断点同步隐藏档位按钮，避免桌面之外的回归。
- **验证**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node /home/percy/software/deepseek-harness/node_modules/.bin/tsdown --config tsdown.config.ts` 通过。
  - `node scripts/rewrite-client-id.mjs` 通过。
  - `node --check lib/index.js` 与 `node --check lib/client.js` 通过。
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node --test tests/*.test.mjs` 全部 20 项断言通过（1 项 `session-policy` + 19 项 `workbench-and-evidence`）。
  - `git diff --check` 无冲突标记。
- **保留问题**：
  - 新的 `knowledge_query_dataset` 卡片只展示带 `dataset_id` 的前 3 条；模型没有声明数据集时不会显示按钮，符合"避免假按钮"的原则，但极端场景下模型可能漏报。
  - `cangzhi-workbench-size` 与 `cangzhi-workbench-fullscreen` 仅存浏览器 localStorage，未与 DSH 设置体系同步；如果用户切换浏览器或清缓存会回到默认档位。
  - 旧 3080 端口上的 DSH 进程（用户当前使用）未重启；新代码已构建到 `lib/client.js` 并通过测试，用户下次重启 DSH 即可生效。

## 2026-08-31：第二轮审查：全屏宽度被 class 截断 + size/width 初始化漂移

- **审查人**：MiniMax M3
- **审查范围**：Ark 这一轮 `src/client/lib/{evidence,workbench-size}.mjs`、`src/client/plugin.tsx`、`src/client/Cangzhi.module.css` 与 `tests/workbench-and-evidence.test.mjs`。
- **结论 1（已修复）**：`knowledge_query_dataset` 与 `knowledge_ask` 的结构化证据入口是稳的。`collectStructuredEvidence` 递归解包 `rows / items / citations / result / structuredContent` 三层后产出 `{ documentId, datasetId, title, snippet }`；`dedupeEvidenceLinks(..., 3)` 在插件层去掉 `datasetId === null` 的项（避免出现"只点开文档、找不到工作台数据集"）。文本回退仅在 JSON 拿不到时触发，行为与之前一致。新增 9 个针对 `idNumber / collectStructuredEvidence / dedupeEvidenceLinks / fallbackAnswerEvidence / answerEvidence / formatEvidenceLink` 的单元测试，单测的 wrapper `wrapper.content[0].text` 显式覆盖 MCP 字符串 payload 形态，足够兜住空数组 / 嵌套数组 / 数字 ID / 字符串 ID 几种典型输入。
- **结论 2（已修复）**：藏知工作台档位 / 全屏逻辑整体稳，但**全屏切换实际不生效**。
  - 问题 1：`.knowledgeWorkbench` 的 `max-width: min(760px, calc(100vw - 320px));` 是 class 规则，优先级高于 `style.width` 的 `width` 属性；当 `fullscreen` 为 true 时，内联 `width: min(100vw - 32px, 1100px)` 被 class `max-width: 760px` 截断，外加 `min-width: 360px` 在 320px 视口下也卡死。Frame 的 `padding-right: min(1100px, 100vw - 32px)` 让出来了，但工作台本身只到 760px，frame 与工作台之间留出 340px 空白。
  - 修复 1：新增 `.knowledgeWorkbench[data-cangzhi-workbench-fullscreen='true'] { min-width: 0; max-width: min(1100px, calc(100vw - 32px)); border-left-color: transparent; box-shadow: none; }`。
  - 问题 2：`useState` 用 `readWorkbenchWidthFromStorage` + `readWorkbenchSizeFromStorage` 独立读两遍 storage。若只存了 `cangzhi-workbench-size='wide'` + `cangzhi-workbench-width='500'`（典型迁移场景：用户在旧版只拖到 500，但保存时被新代码写入了 size），初始化会出现"宽 500px 但'宽'按钮高亮"的不一致；反之只存 width 不存 size 时，`readWorkbenchSizeFromStorage` 默认 'standard'，会让 `isWorkbenchSize` 误以为 size 已存，永远走 size 分支，不再用 saved width。
  - 修复 2：在 `src/client/lib/workbench-size.mjs` 新增 `readWorkbenchInitialState(storage)`：先 `readRawWorkbenchSize` 直接读原始值（无默认值），仅当原始值通过 `isWorkbenchSize` 时才用 `WORKBENCH_SIZE_TABLE[size]` 作 width；否则用 `readWorkbenchWidthFromStorage` 的 width 推断 size。`plugin.tsx` 三个 `useState` 改用 `readWorkbenchInitialState(window.localStorage).{width,size,fullscreen}`，旧的 `readWorkbenchWidthFromStorage / readWorkbenchSizeFromStorage / readWorkbenchFullscreenFromStorage` import 一并清理。
- **结论 3（保留）**：移动端 `max-width: 760px` 媒体查询里 `.knowledgeWorkbench { width: min(100vw, 520px) !important; ... }` 已用 `!important` 覆盖内联 width，所以 mobile 仍然按 520 上限。`workbenchSizeGroup` 在该断点下 `display: none`，档位按钮对 mobile 用户不可见，行为符合 ADR-003。
- **验证**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness /home/percy/software/deepseek-harness/node_modules/.bin/tsdown --config tsdown.config.ts` 通过；输出 `lib/index.js 49.66 kB / lib/client.js 236.08 kB`。
  - `node scripts/rewrite-client-id.mjs` 通过。
  - `npm run check`（`node --check lib/index.js && node --check lib/client.js`）通过。
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node --test tests/*.test.mjs` 全部 23 项断言通过（1 项 `session-policy` + 22 项 `workbench-and-evidence`，其中 `readWorkbenchInitialState` 新增 3 个用例覆盖 preset 优先 / 旧 width 推断 / 非法 size 回退）。
  - `git diff --check` 无冲突标记。
- **保留问题**（不在本轮范围）：
  - `evidence.mjs` 仍然没有 `.d.mts`，TypeScript 端只能从 `.mjs` 推断，复杂返回类型（如 `collectStructuredEvidence` 的 `Array<{...}>`）目前用 plugin.tsx 内 `EvidenceLink` 显式 cast 处理。后续如要给 lib 补完整类型桥，可单独立 ADR。
  - 档位按钮组的 ARIA 名称仍用汉字 "窄/标准/宽"，对英文 / 盲文用户可读性一般；如要本地化需要把 `WORKBENCH_SIZE_LABELS_ZH` 拆成 `t('workbench.size.narrow')` 等键，留待 DSH i18n 体系确认后处理。
  - 旧 3080 端口上的 DSH 进程（用户当前使用）未重启；本次修复已构建到 `lib/client.js`，用户下次重启 DSH 即可生效。

## 2026-08-31：最终回答增加来源按钮并精简工作台顶栏

- **问题**：模型在最终回答中使用“文档 387《指标数据更新明细》dataset_id=354”时，旧回退规则只识别 `document_id` / `文档 ID`，因此没有来源按钮；窄/标准/宽和全屏控件与拖拽重复，顶栏显得拥挤。
- **实现**：文本证据解析改为独立提取文档与数据集编号，兼容自然语言、Markdown 加粗和先数据集后文档的顺序；接入 DSH `conversation.chat.assistant-actions`，在最终回答底部直接显示“来源”按钮并打开对应右侧数据表。移除档位/全屏按钮及其运行时状态，只保留 360–760px 拖拽和 `cangzhi-workbench-width` 记忆。
- **验证**：新增两项文本证据回归用例，并通过完整构建、语法检查、单元测试和差异检查。

## 2026-08-31：最终回答改用结构化、版本绑定的证据节点（ADR-004）

- **背景**：最终回答的“来源”按钮仍依赖模型正文是否写出 ID；按钮打开的是当前文档或普通数据表预览，无法证明回答实际用了哪个版本、片段和原始行。
- **实现**：新增 turn 级 `cangzhi-evidence` Conversation Node，按 `tool/call` / 成功 `tool/result` 折叠本轮真实藏知证据；回答结束后固定列出来源。证据身份保留 `document_version_id`、`chunk_id`、`dataset_id`、`artifact_version`、`source_rows`、`columns` 与 `query_plan`。右侧工作台接入藏知 v1 版本绑定接口，文档显示原章节/页码，数据表只显示本次回答的贡献行。旧正则回退不再驱动最终证据区。
- **兼容**：无证据时不显示节点；旧记录缺版本号时禁用精确预览并明确说明，绝不读取最新版冒充旧证据。插件版本提升至 `0.10.0`，便于 `file:` Profile 判断与运维核对。
- **验证**：`node --test tests/*.test.mjs` 27 项通过；复用 DSH preset 的 `tsdown` 构建通过；`node --check lib/index.js && node --check lib/client.js` 通过。真实 Profile 刷新与浏览器端到端点击仍待部署后验收。

## 2026-09-01：第二轮审查：移除浏览器 bundle 中的 Node `Buffer` 引用 + 修正证据切换时的视图状态

- **审查人**：MiniMax M3
- **审查范围**：Ark 的 ADR-005 / `src/client/lib/markdown-preview.mjs` /
  `src/client/plugin.tsx`（`EvidenceWorkbenchPreview`）/ `package.json` /
  `src/client/Cangzhi.module.css` / `tests/markdown-preview.test.mjs`。
- **结论 1（已修复）**：`markdown-preview.mjs` 上一轮用 `Buffer.byteLength(text, 'utf8')`
  做 64 KiB 截断判断，而 `plugin.tsx` 会把它打包进 `lib/client.js`。
  `Buffer` 在浏览器里不存在，渲染任何带 `context_markdown` 的证据时都会
  抛 `ReferenceError: Buffer is not defined`。构建过程没看到这一步报错，
  纯靠运行时崩溃兜底，风险太高。
  - 修复：`markdown-preview.mjs` 新增 `byteLengthUtf8(text)`：优先用标准
    全局 `TextEncoder`（现代浏览器 + Node ≥ 11 全部支持），在
    `TextEncoder` 不可用时回退到符合 RFC 3629 的手写 UTF-8 计数器（处理
    代理对）。5 处 `Buffer.byteLength` 全部替换；新加
    `__disableTextEncoderForTests` / `__restoreTextEncoderForTests`，让单
    测能强制走手写 fallback。
  - 验证：单测新增 3 个用例（ASCII / 中文 / emoji / 代理对 / 混合与
    Node `Buffer.byteLength` 对照、TextEncoder 禁用后手写分支对照、
    在禁用状态下主入口仍可用）。13 / 13 通过。

- **结论 2（已修复）**：`EvidenceWorkbenchPreview` 用
  `useState(canFormat ? 'formatted' : 'raw')` 初始化视图状态，并在渲染
  条件里要求 `viewMode === 'formatted' && canFormat` 才显示 MarkdownText、
  `viewMode === 'raw'` 才显示 `<pre>`。当用户在证据 A（`canFormat = true`）
  中选了“格式化”，再切换到证据 B（`canFormat = false`，例如 body > 64 KiB
  或 `context_markdown` 缺失），组件复用同一个 React 实例，state 仍是
  `'formatted'`，但格式化分支被 `canFormat === false` 屏蔽、原文分支又因
  `viewMode !== 'raw'` 屏蔽——**用户看到空白**。
  - 修复：状态变量改名 `preferredView`（仅承载“用户最后一次显式选择”），
    渲染前先算 `effectiveView = canFormat ? preferredView : 'raw'`，把
    不可格式化证据强制回到原文。开关条 `showFormatBar` 与原文 `<pre>` 仍
    依赖 `normalizedMarkdown` 存在，证据无 markdown 时继续走 snippet /
    占位逻辑，不出现双重面板。
  - 验证：单测新增 1 个用例，显式 pin “`canFormat === false` 时主体仍可
    渲染为 raw、不返回空串” 的契约。

- **结论 3（已通过）**：`@deepseek-ai/dsh-client-ui-primitives` 已在 DSH
  `packages/client/web/src/seed.ts` 的 platform 模块表里被预播种，构建产
  物里只剩 `require('@deepseek-ai/dsh-client-ui-primitives')` 一行外置；
  shiki / katex / micromark 等大块依赖未被打入 `lib/client.js`，与
  ADR-005 决策 5 一致。

- **结论 4（已通过）**：表格横向滚动由 `cangzhiMarkdown .tableScroll` +
  MarkdownText 自身的 `md-table-wide` 钩子负责，CSS 已补
  `width: max-content; min-width: 100%; max-width: max-content;` 与
  `overflow-x: auto` 容器。MarkdownText 自身的安全链接策略（`http(s) /
  mailto` allowlist、raw HTML 字面化、GFM 表格 / 任务列表 / TeX 渲染）由
  DSH 提供，工作台侧未改写。64 KiB / UTF-8 边界由 `truncateEvidenceMarkdown`
  配合 `byteLengthUtf8` 保障，行为与 ADR-005 决策 2 / 4 一致。

- **验证**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node /home/percy/software/deepseek-harness/node_modules/.bin/tsdown --config tsdown.config.ts` 通过，`lib/client.js` 259.55 kB（与上一轮持平，新增 helper 内联在原 5 处替换里，体积可忽略）。
  - `node scripts/rewrite-client-id.mjs` 通过。
  - `node --check lib/index.js && node --check lib/client.js` 通过。
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node --test tests/*.test.mjs` 全部 41 项断言通过（1 项 `session-policy` + 27 项 `workbench-and-evidence` + 13 项 `markdown-preview`）。
  - `git diff --check` 无冲突标记。

- **保留问题**（不在本轮范围）：
  - `MarkdownText` 自带 `var(--dsw-alias-*)` / `var(--ds-font-family-code)` token，工作台主题已使用同套 token；非常规主题变体（高对比 / 暗色之外的）适配本轮不做。
  - 旧 3080 端口上的 DSH 进程（用户当前使用）未重启；本次构建已落到 `lib/client.js`，用户下次重启 DSH 即可生效。

## 2026-09-01：处理队列自适应刷新（ADR-007）

- **问题**：管理中心只在打开时读取一次状态，后台任务运行期间会一直显示旧的“0”；
  单页 200 条概览也会漏掉大型空间后续资料。
- **实现**：初次刷新和轻量刷新复用 `X-Total-Count` 全量分页；管理中心使用单飞、
  可取消的递归定时器，仅刷新资料概览与服务器状态，处理时 3 秒、空闲 15 秒、隐藏
  60 秒，失败指数退避。全量刷新期间暂停并中止轻量轮询，避免切换空间时竞态；轻量
  路径不调用 `syncModelWorkspace`。
- **协作复核**：Ark 完成功能实现；MiniMax M3 指出工作区切换时全量/轻量请求可能
  重叠，集成阶段已用 `loading` 门禁修正；agy 使用既有桌面认证做独立只读复核。
- **验证**：前端 74 项 Node 测试通过；DSH preset 构建、bundle 身份重写、
  `node --check lib/index.js && node --check lib/client.js` 和 `git diff --check` 通过。
- **待验收**：未重启运行中的 DSH；需配合新版藏知 API，用真实文档观察
  `0 → 处理中 → 0`。

## 2026-09-01：Markdown 表格退回原文修复（ADR-005 修订）

- **问题**：证据正文超过 64 KiB 时，前端先判定“不可格式化”再决定是否截断，导致
  大型 GFM 表格直接进入 `<pre>`，重新显示 `| 列 |`、`| --- |` 等 Markdown 符号。
  普通资料正文仍固定走 `<pre>`，从不同入口打开同一资料也会出现两种结果。
- **修复**：抽出 `WorkbenchMarkdownPreview`，普通资料与版本绑定证据统一默认使用
  DSH `MarkdownText`；超长内容先截断到 64 KiB，再判断并格式化，原文仍可手动切换。
  截断定位从逐字符重复编码改为二分查找，超大表格回归由约 1.8 秒降到约 3 毫秒。
- **验证**：新增超长 GFM 表格回归；75 项 Node 测试、DSH preset 构建、bundle
  身份重写、产物语法检查及 `git diff --check` 通过。当前运行 Profile 尚未刷新。

## 2026-09-01：预览渲染器按类型路由（ADR-008）

- **问题**：数据表摘要、Markdown 正文和 PDF / Word 抽取文本都可能包含
  Markdown 符号；仅根据 `context_markdown` 选渲染器会让不同文档类型相互混淆。
- **实现**：新增 `preview-routing.mjs` 纯函数路由层，优先使用藏知返回的
  `evidence_type`、`document_type`、`dataset` 和 `table_location`。数据表走分页表格，
  Markdown / 笔记走 DSH `MarkdownText`，PDF / Word 走文档预览，普通文本走 `<pre>`；
  扩展名和保守的内容识别只用于旧载荷兼容。
- **浏览器控制**：按 Computer Use 规范检查 Orca，实际运行时报
  `Linux Computer Use requires python3-gi and AT-SPI packages`；系统已安装对应包，
  但 Orca 进程未加载其 Python 路径。为避免重启 Orca 中断当前会话，
  改用隔离的无头 Chrome + DevTools Protocol 执行页面级点击与 DOM 验收。
- **验证**：新增 4 组路由回归；全量 79 项 Node 测试、DSH preset 构建、
  bundle 身份重写、`npm run check` 和 `git diff --check` 通过。`web` Profile 安装产物与仓库
  `lib/client.js` SHA-256 一致；独立启动 3090 / 3082 临时端口后，页面与插件状态均返回
  HTTP 200，藏知 API 连接正常、14 个工具已配置，实际下发 bundle 包含新的
  `evidence_type` / `document_type` 路由和数据集降级视图。临时服务验证后已停止。
  随后刷新并平滑重启当前 3080 DSH，状态为 `apiConnected=true`、
  `mcpConfigured=true`、`toolCount=14`，真实页面可点开藏知管理中心，无
  ModuleLoader / 注册错误。隔离浏览器无用户藏知登录态，其账户状态 401 符合预期。

## 2026-09-01：数据集目录证据改为真实分页表格

- **现象**：`dataset_catalog` 已被正确分类为数据集，但因为发现线索没有
  `source_rows`，工作台仍把“数集 / 字段 / 代表行”目录摘要当作降级内容。
- **修复**：版本绑定上下文核验通过后，从 `context.dataset.dataset_id` 与工具载荷
  交叉确认数据集身份。无贡献行的目录线索进入完整分页表格；有贡献行的证据继续
  只显示实际回答所使用的行。数据集 ID 冲突时终止预览，不猜测或冒用其他表。
- **验证**：新增数据集身份一致性回归，并覆盖 `document_type=xlsx` 的元数据路由；
  80 项 Node 测试、DSH preset 构建、bundle 身份重写、`npm run check` 和
  `git diff --check` 通过。刷新 `web` Profile 并重启 3080 DSH，源码与 Profile bundle
  SHA-256 一致，实际下发产物包含“版本绑定目录数据集”分页分支。

## 2026-09-01：最终证据与发现线索分层（ADR-006）

- **问题**：同一轮先由 `knowledge_search` 找到数据表目录，再由
  `knowledge_query_dataset` 返回实际贡献行时，最终回答列出两条同标题证据；前者打开
  `dataset_catalog` 片段，后者打开精确数据行，用户难以判断真正支持答案的来源。
- **实现**：证据抽取新增 `chunkType`，兼容顶层与嵌套字段；最终
  `cangzhi-evidence` 节点会在同一文档版本已有 `source_rows` 时抑制被替代的
  `dataset_catalog`。目录线索带 dataset ID 时按文档 / 版本 / 数据集匹配，不带时按
  文档版本匹配；工具过程卡、普通 chunk、不同文档和不同版本保持原样。
- **真实载荷校正**：Ark 首版以“无 chunkId”识别目录线索；MiniMax M3 审查指出真实
  线索带 `chunk_id=59`，推动改为传播 `chunk_type`。集成人随后直接核对 DSH session
  原始事件，进一步确认该搜索命中没有 `dataset_id`，据此补上文档版本级替代规则和
  真实记录回归。agy CLI 的执行环境带 SSH 标记，最初切换到文件型 token 存储而无法
  读取桌面 keyring；移除 `SSH_CLIENT` / `SSH_CONNECTION` / `SSH_TTY` 后认证恢复。
  最终使用 headless sandbox 完成独立只读验收，结论为 PASS，且确认分层只发生在最终
  `buildViewNode`，工具过程证据保持原样。
- **验证**：`node --test tests/*.test.mjs` 61 / 61 通过；真实文档 6 / 版本 6 /
  chunk 59 与 dataset 4 / 12 行的回归只保留精确证据；复用
  `/home/percy/software/deepseek-harness` preset 的 `tsdown` 构建通过；
  `node scripts/rewrite-client-id.mjs`、`npm run check` 和 `git diff --check` 通过。
- **待验收**：构建产物已更新，尚未重启当前 DSH 进程；浏览器端需用同一问题重新发起
  一轮对话，确认最终只显示一条可打开 12 行原始数据的证据。

## 2026-09-01：截断预算收敛修正

- **修正**：补齐 `truncateEvidenceMarkdown` 的长度回退检查，避免在需要截断时使用旧字符串快照，确保保留证据开头内容且最终 UTF-8 字节数不超过预算。
- **验证**：新增测试断言确认截断结果保留正文前缀；全量测试、构建、语法检查和 `git diff --check` 继续通过。

## 2026-09-01：Markdown 证据预览 Profile 验证

- **部署**：刷新 `web` Profile 的 `file:/data/share/dsh-cangzhi` 安装并重启明确的 DSH 进程组；当前地址为 `http://127.0.0.1:3080/`。
- **运行验证**：页面 24,793 字节，插件 bundle 261,052 字节；确认加载 `@deepseek-ai/dsh-client-ui-primitives`、`MarkdownText`、`cangzhiMarkdown`、“格式化/原文”及 `byteLengthUtf8`，且 bundle 不含 `Buffer.byteLength`。`/_cangzhi-plugin/status` 返回 `apiConnected=true`、`mcpConfigured=true`、`toolCount=14`。

## 2026-09-01：工作台证据 Markdown 安全渲染（ADR-005）

- **问题**：`EvidenceWorkbenchPreview` 把 `context.context_markdown` 用 `<pre>` 原文输出，标题、列表、强调、代码块、GFM 表格都不可读；用户希望像 DSH 对话正文一样格式化渲染，又不能引入额外的 markdown 库或 unsafe HTML。
- **实现**：
  - 复用 DSH `MarkdownText`（`@deepseek-ai/dsh-client-ui-primitives`）。该组件是 DSH Web Profile 的 platform 模块，模块表里已播种，构建通过 `require(...)` 外置，不把 shiki / katex / micromark 等大块依赖打到本仓库 `lib/client.js`；`MarkdownText` 自带 `http(s) / mailto` allowlist、raw HTML 字面化、GFM 表格 / 任务列表 / TeX 渲染，正好覆盖证据实际产出的语法。
  - 新增 `src/client/lib/markdown-preview.mjs`，提供 `normalizeEvidenceMarkdown` / `shouldRenderFormattedMarkdown` / `truncateEvidenceMarkdown` / `buildMarkdownLabels` 四个纯函数，64 KiB 字节上限 + 边界尊重 UTF-8 字符 + 模块级 memo 化的 `labels`（流式渲染用它做 memo key，必须引用稳定）。
  - `EvidenceWorkbenchPreview` 改成“格式化 / 原文”切换：默认进入格式化（命中条件），原文仍以 `<pre>` 兜底；空、超长、纯空白 Markdown 直接走原文。MarkdownText 外层套 `cangzhiMarkdown` 容器，约束 58vh 最大高度、让垂直滚动仍归工作台主滚动条；`MarkdownText` 自身的 `tableScroll` + `md-table-wide` 钩子负责多列表格的横向滚动。
  - 依赖与 bundle：`package.json` 新增 `peerDependencies: @deepseek-ai/dsh-client-ui-primitives` 与对应 `optional: true` 元数据，并在 `dsh.bundle.client.inject` 列表中加入同名条目；`tsdown` 客户端 purity gate 命中 platform 模块白名单，`require(...)` 保持外置。
  - 数据表 `previewTable` / `rows` 双视图与 `cangzhi-evidence` 折叠逻辑均未触动。
- **验证**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node /home/percy/software/deepseek-harness/node_modules/tsdown/dist/run.mjs --config tsdown.config.ts` 通过，`lib/client.js` 250.29 kB → 259.55 kB（约 +9 KB），shiki / katex 等大块依赖未被 bundle。
  - `node scripts/rewrite-client-id.mjs` 通过。
  - `node --check lib/index.js && node --check lib/client.js` 通过。
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node --test tests/*.test.mjs` 全部 36 项断言通过（1 项 `session-policy` + 27 项 `workbench-and-evidence` + 8 项新增 `markdown-preview`）。
  - `git diff --check` 无冲突标记。
- **限制**：
  - `MarkdownText` 自带 `var(--dsw-alias-*)` / `var(--ds-font-family-code)` token，工作台主题已使用同套 token；但如果 DSH 主题切换为高对比 / 暗色以外的非常规变体，仍以原值渲染；本轮不做主题适配。
  - 工作台只对 `context.context_markdown` 走 MarkdownText；旧的 `<pre>` “原文”入口与数据表行预览路径保留，纯渲染辅助逻辑外的样式与交互一律不动。
  - 旧 3080 端口上的 DSH 进程（用户当前使用）未重启；本次构建已落到 `lib/client.js`，用户下次重启 DSH 即可生效。

## 2026-09-07：会话级藏知知识空间隔离与状态持久化（ADR-009）

- **问题**：知识空间仍由进程级 `activeWorkspaceSlug` 共享，DSH 内所有对话的 `mcp__cangzhi__*` 调用携带同一 `x-cangzhi-workspace`；并发 A/B 无法各自检索，刷新/恢复/Host 重启后空间与能力开关不保持。通用 DSH MCP bridge 把 transport 绑定到单一 URL + 静态 header，无法把「正在执行的会话」传到每次 `tools/call`（已确认 cangzhi `api/mcp.py` 为 Stateless Streamable HTTP adapter，`tools/call` 无需 `initialize`）。
- **实现**（Ark）：
  - 新增纯决策层 `src/host/session-state.mjs`：`resolveWorkspace` / `resolvePolicy` 沿 `session.header.parentSession` 链取最近显式 pin，无 pin 时回落进程默认并标 `bound:false`（降级）；`serializeState` / `deserializeState` 提供无损往返。
  - 新增 `src/host/domain-store.mjs`（纯 `KvTable` 适配，每次 `put` 耐久后返回）+ `src/host/storage-open.mjs`（`cangzhi_session` domain，`per-record`，表 `workspaces`/`policies`，基于 `@deepseek-ai/dsh-storage-domain` + `zod`）。`ctx.get('storage')` 不可用时降级进程内存并告警，不使用 localStorage 做安全边界。
  - 新增 `src/host/session-manager.mjs`：在每个 live agent 作用域注册 `mcp__cangzhi__*` scoped 覆盖（shadow 全局 bridge 工具），`execute` 按 `exec.agent.id` 在**执行时刻**解析工作空间，经插件回环代理发送 `tools/call` 并显式携带 `x-cangzhi-workspace`；读不到执行会话时抛「无法确定执行会话」，绝不回落进程级空间。`tools/change` 签名比对处理 `cangzhi-mcp` 注册/重连与 agent 先创建的竞态（dispose + 重注册指向最新全局 schema）。
  - `src/host/mcp-call.mjs`：一次 `tools/call` 的 JSON-RPC（含 `application/json` + SSE 响应解析、`isError` 抛错、`exec.signal` 取消透传、`Mcp-Session-Id` 按工作空间缓存），fetch 可注入。
  - `src/index.ts`：统一 session manager 接线（`agent/created`/`agent/disposed`/`tools/change`）、持久 store 打开、`mcpProxy` 尊重入站 `x-cangzhi-workspace`（无则回退进程默认）、控制端点改为显式携带 `sessionId`（`GET/POST /workspace`、`GET/POST /session-policy`、新增 `GET /session-state`；未带 sessionId 的 workspace 查询/改动返回 400，仅 `processDefault:true` 接受进程级变更）。
  - 客户端 `src/client/plugin.tsx`：`syncModelWorkspace(slug, sessionId)` 仅在持有会话时 POST；管理中心（无会话绑定）不再写任何模型工作空间；Popover 增加未隔离降级提示 `popoverScopeDegraded`。
- **验证**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness` tsdown 构建通过（`lib/index.js` 71.46 kB、`lib/client.js` 283.23 kB）；`node scripts/rewrite-client-id.mjs` 通过；`npm run check`（`node --check lib/index.js && node --check lib/client.js`）通过。
  - 新增 `tests/session-state.test.mjs`（10 项：隔离/继承/降级/序列化往返/domain-store 耐久/SSE）与 `tests/session-manager.test.mjs`（1 组 DSH 耦合：A/B 并发隔离、父子继承与隔离、策略开关、无会话拒绝、bridge 注册竞态）；`node --test tests/*.test.mjs` 全部 91 项通过。
  - `package.json` 新增 peerDependencies `@deepseek-ai/dsh-storage`:0.1.2-alpha.2、`@deepseek-ai/dsh-storage-domain`:0.1.2-alpha.2、`zod:^4.4.3`（含 optional 元数据）。
- **风险 / 待验**：未在真实运行 DSH 上做端到端并发浏览器验收（既存 3080 DSH 未重启）；scoped override 的 `tools/call` 经回环代理转发依赖 cangzhi `/api/mcp` 的 Stateless 行为，未做真实 `knowledge_ask` SSE 进度流验证；`storage-domain`/`zod` 为外部 peer import，需安装环境可解析（base Profile 已提供）。

## 2026-09-07（晚）：MiniMax M3 第二轮复核与修复

- **复核输入**：经理用 `NODE_PATH` 跑 `import('/data/share/dsh-cangzhi/lib/index.js')` 复现 `ERR_MODULE_NOT_FOUND`，确认 Ark 第一轮的 `lib/index.js` 顶部残留了 `import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'` 和 `import { z } from 'zod'`，本插件通过 `file:` 挂载到 DSH 时，DSH 的 `node_modules/.pnpm` 不会被 symlink 进来，加载即崩。
- **修复**：
  - **`src/host/storage-open.mjs` 改写为完全自给**：内联 `defineDomain`（与 DSH 端同 `UNIT_NAME_RE = /^[a-z][a-z0-9_]*$/`、同 `Number.isInteger(version) >= 0`、同 `layout` 校验、同 `tables.*` 校验、同 `global.schema.safeParse(null)` 防护）、`domainTable`（返回 `{ valueSchema }`，要求 `schema.parse` 存在）、迷你 `z`（`z.string()` / `z.enum([...])`，都有 `safeParse` / `parse`，`parse` 抛错）。域与表 schema 的运行时形状与 DSH `defineDomain` 一致，DSH 端 `domain.open(spec)` 用 `valueSchema.parse(raw)` 校验已存记录时能直接复用。
  - **`src/host/mcp-call.mjs` 补 120_000ms 默认 timeout**：`composeSignal` 把 caller signal 与 `setTimeout` 墙钟绑定到同一个 `AbortController`，任一端 `abort` 即取消 fetch 并 `clearTimeout`，避免计时器泄露；`exec.signal` 仍优先（model 取消立即生效）。4xx/5xx 立即 `sessionIds.delete(workspace)` 丢弃过期的 `Mcp-Session-Id`；401/403 单独抛认证错误；JSON 与 SSE 双路、`isError` 抛错、`structuredContent` 透传行为保持。
  - **入站 `x-cangzhi-workspace` 信任边界**：回环代理的 `headers` 回调对入站 header 做 slug 正则校验，畸形值直接抛错（不会把控制字符或 64 字节之外的值传给上游）；未带 header 的回退到 `activeWorkspaceSlug` 仍然保留给进程级 `cangzhi-mcp` bridge。
  - **客户端 Popover / Dock / 会话头**：
    - `HomeIntegration.load(sessionId)` 与 `KnowledgeDock.load(sessionId)` 改为先 GET `/_cangzhi-plugin/workspace?sessionId=...`，得到 `{ workspace, bound }`：若 `bound=true`，直接以 Host 的 slug 作为 UI 展示与后续 `syncModelWorkspace` 来源；若 `bound=false`，才回退到 `/workspaces/current` (cangzhi cookie) 并主动 `syncModelWorkspace` 写入 pin；`useEffect` 依赖补齐 `sessionId`，切会话立刻重载；`switchWorkspace` 改为先 `syncModelWorkspace` 成功后再写 cangzhi cookie，避免 cookie 与模型状态在错误路径上分叉。
    - `ConversationKnowledgeHeader` `useEffect` 依赖补齐 `sessionId` 并把 `workspaces/current` 改成只读回退，主路径是 Host 的 `model workspace`，并用 `workspaces` 列表解析出人类可读的名字。
  - **`src/host/session-manager.mjs`**：`onAgentCreated` 主动取一次 `cangzhiSignature()` 并在签名变化时更新 `lastSignature`，避免 manager 订阅 `tools/change` 之前 bridge 已注册的竞态；`syncSession` 中 `on→on` 的同策略路径在 `overridesActive=false` 时也重新 `registerOverrides`，确保 bridge 在 manager 之后注册时第一次 `onAgentCreated` 就把工具接上。
  - **`src/index.ts`**：plugin `apply` 末尾对 `ctx.agents.list()` 遍历 `onAgentCreated` 一次，再强制 `manager.onToolsChange()` 一次，桥在 plugin 加载前就绪的场景不再被静默错过；`openPersistentStore` 在 `ctx.get('storage')` 拿到后校验 `domain.open` 返回值具有 `table/close` 表面，避免把"返回非 Domain"当作成功并把后续 `setWorkspace/put` 默默吞到原生对象上。
  - **`package.json`**：移除 `@deepseek-ai/dsh-storage-domain` 和 `zod` 的 peerDependency；`@deepseek-ai/dsh-storage` 仍保留（`ctx.storage` hub 由 DSH 注入）。
- **测试**：
  - **`tests/session-manager.test.mjs` 升级为真正走 DSH `ctx.tools.execute` 管线**：之前是 `def.execute({}, { agent, signal })` 直调，本轮改成 `ctx.tools.execute({ signal, callId, name, arguments, agent })`，覆盖模型调用 cangzhi 工具的真实路径（含参数快照、scope 解析、output schema 校验、post-execute pipeline）；并新增并发 `Promise.all` 验证 A/B 各自 `x-cangzhi-workspace` 并发落到 wire。
  - 新增 4 项独立测试：
    - `mcp-call — 120s default timeout aborts long fetches when no signal is supplied`：覆盖 `DEFAULT_MCP_TIMEOUT_MS === 120_000` 与实际 fetch 在无 caller signal 时被墙钟取消。
    - `mcp-call — caller signal wins over wall-clock bound`：覆盖 caller signal 优先于墙钟。
    - `mcp-call — SSE response carries workspace and parses chunked events`：用真实 `text/event-stream` 多事件 payload 验证工作空间 header 透传。
    - `mcp-call — 4xx invalidates the cached Mcp-Session-Id`：验证 401 之后下一次调用不再带过期 id。
    - 桥重连 race 升级：原本仅"manager→bridge"方向的同步，本轮加 dispose 旧 globals + registerGlobals + `onToolsChange` 验证"桥消失→0 覆盖→桥回来重新覆盖"全链路。
- **验证命令与结果**：
  - `DSH_SOURCE=/home/percy/software/deepseek-harness /home/percy/software/deepseek-harness/node_modules/.bin/tsdown --config tsdown.config.ts` 通过（`lib/index.js` 80.12 kB / gzip 21.91 kB；`lib/client.js` 287.97 kB / gzip 56.16 kB）。
  - `node scripts/rewrite-client-id.mjs` 通过；`node --check lib/index.js && node --check lib/client.js` 通过。
  - `node -e "import('/data/share/dsh-cangzhi/lib/index.js').then(m => console.log(Object.keys(m)))"` 复现经理的失败路径，**本轮输出** `IMPORT OK [ 'apply', 'inject', 'name' ]`，不再 `ERR_MODULE_NOT_FOUND`。
  - `DSH_SOURCE=/home/percy/software/deepseek-harness node --test tests/*.test.mjs`：**95 项全部通过**（含 `session-state` 10 / `session-manager` 5 / `session-policy` 1 / `markdown-preview` / `preview-routing` / `refresh-policy` / `workbench-and-evidence`）。
  - `git diff --check` 无冲突标记。
- **仍未做、需在真实 DSH 上复测**：3080 上的运行中 DSH 仍未使用本轮 bundle，真实浏览器并发 A/B、`刷新/恢复`、Host 重启后的会话级隔离仍需在 DSH 重启后复测；scoped override 的 `tools/call` 经回环代理的真实 `knowledge_ask` SSE 进度流尚无现场观察。

## 2026-09-07：Codex 集成修正与 Host 实机验证

- 补 Host tools 注入声明；全局工具限制在开启会话也保留，覆盖注册异常时回滚部分注册；重连比较定义身份。补正确 MCP 协议头，并将超时延长至响应正文消费结束。
- 修正 HomeIntegration 对 InjectFace 的属性读取；刷新时读取 Host 策略；加载页面不再自动用 Cookie 写入空间 pin。工作台请求显式携带 Host 空间，读取失败时报告错误。
- 96 项测试、DSH preset 构建、语法检查、独立 Host 导入通过。版本提升为 0.11.0，安装到 web Profile。安装曾遇 pnpm v10/v11 store 冲突，使用现有 pnpm 11.7.0 完成重装并校验产物一致。
- 临时 3090/3091 Host 启动成功，状态返回 persistence=domain；测试键 acceptance-session 写入 off 后重启成功读回。该专用测试键留存在 domain 中，不对应用户真实会话。
- 浏览器自动化导航未取得有效 DOM，浏览器加载、A/B 并发及证据点击仍待验收；不能将 Host 启动成功等同于浏览器插件加载成功。本轮临时服务在检查结束后关闭。

## 2026-09-07：最终构建同步与切会话收尾

- 工作台按 sessionId 重建，清空上一会话的临时选择、搜索和预览状态；Host 返回的空间不在列表中时显示 slug，不再借用 Cookie 空间的名称。
- 修复新 Agent 创建消耗工具签名却未同步已有会话的竞态，并在真实 DSH 工具运行时回归测试中覆盖该顺序。
- 96 项测试全部通过（无跳过），构建、语法和 diff 检查通过。使用现有 pnpm 11.7.0 重新安装 web Profile，前后端产物 SHA-256 与仓库完全一致。
- 浏览器 A/B 会话与证据预览的交互验收仍未完成，不将上述代码测试作为浏览器验收结果。
- 确认默认端口无人占用后，用开发启动脚本启动 3080/3081；HTTP 3080 返回预期未登录 401，服务保留运行供页面验证。

## 2026-09-07：0.11.1 工作台可读性与反馈

- 按用户要求继续通过 OpenCode CLI 协作：newapi/ark-code-latest 负责限定 CSS 修改（第一次只读退出，第二次完成），newapi/minimax-m3 只读复核，Codex 集成。未覆盖此前未提交改动。
- 工作台主要文字提升到 13px、辅助文字到 12px；分页换行、焦点提示、方向键/Home/End 调宽。保持用户确认的单一拖拽布局。
- 搜索草稿与已完成查询分离，输入不隐藏资料；明确搜索中保留旧列表，清除后返回资料；重复提交拦截、请求序号忽略过期结果。补搜索/上传/预览网络异常收尾及可读反馈。
- “加入对话”改为“准备提问”，明确需要检查草稿并发送；临时参考列表不代表模型已读取，关闭藏知时提示不会自动开启，综合草稿携带所选文档身份。新增 ADR-010。
- MiniMax 的重复提交和可见焦点建议已采纳；保留与右侧面板拖动方向一致的左键加宽，补明确辅助标签；不采纳提前给旧结果换新查询标题的建议，改用搜索中说明。
- 99 项测试（新增 3 项键盘边界测试）、DSH preset 构建、产物语法检查、git diff --check 全部通过。未完成浏览器交互验收，不能据此声称视觉或端到端验证通过。
- 0.11.1 已安装 web Profile，client.js SHA-256 与仓库一致；确认并停止上一轮本任务启动的 DSH 后重新启动 3080/3081，HTTP 返回预期未登录 401。

## 2026-09-07：0.11.2 预览生命周期与草稿保护

- OpenCode newapi/ark-code-latest 新增 latest-request 模块与 7 项测试；经理集成到文档、证据、分页请求，读取正文后检查身份，旧错误/finally 不更新新请求。首次打开面板不取消同次证据点击，关闭/卸载/空间变化取消请求。
- 预览链首次从 Host 确认空间，后续共享空间快照；新预览重新确认，不以 Cookie 回退。
- 从本地 DSH contract 确认 useInput 与 inputActions.setDraft 的语义。新增 draft-prompt 与 3 项测试，保留原文字、避免重复追加；带引用 occurrence 或非 plain 阶段拒绝重写。草稿事件与反馈绑定 sessionId。
- 历史 EvidenceLink 无可信空间身份，提示仅在当前空间核验版本；后续可信空间元数据迁移仍未实施。新增 ADR-011 记录兼容边界。
- 109 项测试（无跳过）、DSH preset 构建及产物语法检查通过；未完成浏览器交互验收。MiniMax M3 只读复核已发起，结果另行记录，不预先声明通过。

## 2026-09-09：固定网页内目录选择并加固重载脚本

- 核对 DSH `0.1.5-alpha.1` 源码：`directory-picker-auto` 只有在本机回环绑定、非 SSH 启动且存在可用显示会话时才选择 native；当前 SSH 且无 `DISPLAY`/`WAYLAND_DISPLAY` 的启动环境原本应选择 browse，但自动判断会随启动环境变化。
- 将 `~/.dsh/profiles/web/cordis.patch.yml` 固定为 browse：禁用 `directory-picker-auto`，显式装载 `@deepseek-ai/dsh-host-directory-picker-browse` 与 `@deepseek-ai/dsh-client-ui-directory-picker-browse`。当前版本直接组合 browse 后端不会替代 Client surface，二者缺一不可。
- 加固 `~/.local/bin/reload-dsh`：配置 dump 除校验 `dsh-cangzhi` 外，还校验 auto 已禁用和 browse 的 Host/Client 两端均存在；可信 Host `dsh.inner.percy.fun` 继续通过 `--trusted-host` 保留。
- 实际运行重载：插件构建、语法检查、109 项测试、file 快照重装、组合配置检查和 token HTTP 就绪检查全部通过，DSH 在 `127.0.0.1:3080` 启动。当前自动化会话没有可用浏览器 surface，网页按钮点击验收留作人工快速检查。
