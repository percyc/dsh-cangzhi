# dsh-cangzhi 开发交接

> 当前状态已统一维护在 [PROJECT_STATUS.md](./PROJECT_STATUS.md)。开发前请先阅读 `AGENTS.md`，重要节点追加 `DEVLOG.md`，架构取舍记录在 `docs/adr/`。本文件保留作为旧入口，不再单独维护当前状态。

## 产品边界

本仓库是独立 DSH 适配器，不是藏知 monorepo 的子模块。禁止从藏知源码目录导入模块、反推相对路径或直接初始化藏知数据库。藏知对本项目只暴露 Web、REST API、PAT 和 streamable HTTP MCP。

DSH 基座只提供通用扩展槽位。会话工具使用上游 `conversation.input.left`；不得在本仓库复制或维护 DSH 源文件补丁。

## 当前实现

- Host：`src/index.ts` 注册同源 Web/API 网关、控制接口、系统提示和回环 MCP 凭据代理。
- Client：`src/client/plugin.tsx` 在 DSH `conversation.input.left` 提供紧凑工具入口，并提供知识空间切换、管理中心、知识工作台和 MCP 结果卡片。
- 对话知识能力 UI：工具栏按钮直接打开右侧工作台，不再经过 Popover；工作台集中提供“本对话使用藏知”、空间、登录/连接和连接设置。“本对话使用藏知”按 DSH `sessionId` 控制模型能力，关闭时 Host 在 Agent 作用域隐藏提示词并拒绝 14 个藏知 MCP 工具。
- 工作台支持桌面 420–1200px 响应式连续拖拽，资料、预览、本对话和设置使用同一侧栏；全局管理中心（`ConsoleOverlay`）继续从侧栏或工作台顶栏进入。
- 配置：服务 URL 与默认空间注册到 DSH 原生设置；显式环境变量覆盖并锁定对应字段；内部 MCP 端口只从部署环境读取。
- 构建：`tsdown.config.ts` 通过 `DSH_SOURCE` 使用 DSH 的 Client preset；产物保存在 `lib/`。
- 安装：`scripts/setup-dsh.sh` 仅构建本项目并安装到指定 Profile，不再构建或修改 DSH。
- 开发启动：`scripts/start-dev-dsh.sh` 是可选辅助脚本，不负责启动或修改藏知。

## 内部协议

- 藏知管理页：`/_cangzhi`
- 藏知 API 同源代理：`/_dsh-cangzhi-api`
- 插件控制接口：`/_cangzhi-plugin/*`
- DSH credentials key：`CANGZHI_TOKEN`
- 藏知 MCP 上游：`/api/mcp`

这些是 Host/Client 共同遵守的协议常量。部署者配置上游 URL，不配置这些路径。

## 构建与验证

```bash
export DSH_SOURCE=/path/to/deepseek-harness
./scripts/setup-dsh.sh

# 只构建
DSH_SOURCE="$DSH_SOURCE" "$DSH_SOURCE/node_modules/.bin/tsdown" --config tsdown.config.ts
node scripts/rewrite-client-id.mjs
npm run check
```

最小人工验证：

1. 藏知 `/api/readiness` 正常；
2. DSH 使用新启动输出的 token URL 打开；
3. 新会话页可登录藏知并选择知识空间；
4. 侧栏管理页可上传、搜索和查看系统状态；
5. `mcp__cangzhi__knowledge_search` 能返回当前空间结果；
6. 切换空间后下一次 MCP 调用使用新空间；
7. PAT 断开后 MCP 返回未配置，不泄漏历史 token。
8. 未设置连接环境变量时，可在“设置 → 插件 → 藏知”保存配置，重启后生效；显式设置环境变量时对应字段只读。
9. 有活动对话时，附件和指令同排出现紧凑藏知按钮；点击直接打开工作台，不出现第二层 Popover。
10. 在工作台内切换“关闭/开启”后，Host 对该 Agent 的下一次模型步骤应用对应的提示词和工具限制；切换其他会话不会串用策略。
11. 工作台内可完成空间切换、登录/连接和连接设置；全局管理中心仍可达。

## 已知限制

- 当前活动知识空间由一个 DSH 进程共享，不是按浏览器用户或会话隔离。面向多用户部署前，应将空间选择绑定到 DSH 会话/身份上下文。
- “本对话使用藏知”已经是 Host 侧真实策略；策略变更只影响下一次模型步骤，不会取消正在执行的工具调用。没有活动会话的首页入口仅作为连接/空间管理入口。
- 会话入口依赖新版 DSH 的 `conversation.input.left` 槽位；旧 DSH 没有该槽位时仍可从侧栏进入全局管理中心，但不会获得输入工具行入口。
- Client 文案已分中英两套字典并由 `ctx.locale.register('cangzhi', { zh, en })` 注入，但部分运维提示（如“正在创建 DSH 专用访问令牌…”）仍硬编码中文。
- 构建仍依赖本地 DSH preset；发布时应保留并校验已构建的 `lib/`。

## 后续优先级

1. 把活动知识空间从进程全局状态升级为会话/用户级状态（与策略 localStorage key 解耦，绑定到 DSH session id / 用户身份）；
2. 持续验证工作台“本对话使用藏知”策略在 system prompt / MCP 路由中的 session 隔离；
3. 为 Host 配置校验、代理鉴权、token 生命周期和空间切换增加自动化测试；
4. 完成剩余硬编码中文到 DSH locale；
5. 建立独立版本发布、兼容性矩阵和打包校验。
