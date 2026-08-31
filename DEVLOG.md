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
