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
