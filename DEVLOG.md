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
