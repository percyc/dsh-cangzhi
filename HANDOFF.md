# dsh-cangzhi 开发交接

> 当前状态已统一维护在 [PROJECT_STATUS.md](./PROJECT_STATUS.md)。开发前请先阅读 `AGENTS.md`，重要节点追加 `DEVLOG.md`，架构取舍记录在 `docs/adr/`。本文件保留作为旧入口，不再单独维护当前状态。

## 产品边界

本仓库是独立 DSH 适配器，不是藏知 monorepo 的子模块。禁止从藏知源码目录导入模块、反推相对路径或直接初始化藏知数据库。藏知对本项目只暴露 Web、REST API、PAT 和 streamable HTTP MCP。

DSH 基座只提供通用扩展槽位。`conversation.hero.context` 属于通用宿主能力，应留在 DSH 上游；不得在本仓库复制或维护 DSH 源文件补丁。

## 当前实现

- Host：`src/index.ts` 注册同源 Web/API 网关、控制接口、系统提示和回环 MCP 凭据代理。
- Client：`src/client/plugin.tsx` 提供首页接入、知识空间切换、管理中心、知识工作台和 MCP 结果卡片。
- 对话知识能力 UI：新建会话页只挂载轻量入口（`HomeIntegration`），由 Popover 提供关闭/自动/始终使用、知识空间切换、连接和断开；不再常驻展示大区域。
- 资料抽屉（`KnowledgeWorkbench`）和管理中心（`ConsoleOverlay`）保持可用，从 Popover 底部入口进入。
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
9. 新建对话只出现一个轻量入口，点击后弹出 Popover；Popover 顶部带“进程共享”徽标，离开页面再回来设置保持一致。
10. 在 Popover 内切换“关闭/自动/始终使用”后，对话头部的副文本同步更新；新浏览器标签页打开 DSH 也会读取到同一浏览器偏好（当前不会撤销已注册工具）。
11. 资料抽屉和管理中心均可从 Popover 底部按钮进入，原有功能未缺失。

## 已知限制

- 当前活动知识空间由一个 DSH 进程共享，不是按浏览器用户或会话隔离。`useKnowledgeSession` 通过 `cangzhi:session:*` localStorage key 跟踪“本浏览器”的策略（关闭/自动/始终使用）和当前空间 cookie，但**这只在本浏览器内有效**；同一 DSH 进程下的多个浏览器用户共享同一 `activeWorkspaceSlug`。面向多用户部署前，应将空间选择绑定到 DSH 会话/身份上下文。
- Host 的 `activeWorkspaceSlug` 是进程级变量；客户端的“关闭/自动/始终使用”目前只是本浏览器偏好展示，**不会撤销已注册的 MCP 工具，也不会改变 Host 的静态 system prompt**。不能阻止同一 DSH 进程下的其他浏览器用户读到同一空间。Popover 顶部固定显示“进程共享”徽标，并在策略块下方写明 `popoverScopeGlobal` 文案，避免被误认为是 DSH 后端隔离。
- 完整首页接入依赖通用 `conversation.hero.context` 槽位；旧 DSH 只能使用其已有槽位中的功能。新 Popover 入口通过 `conversation.input.dock`（`KnowledgeDock`）和 `conversation.session.header.actions`（`ConversationKnowledgeHeader`）挂载，即使 `hero.context` 未声明，弹层与切换能力仍能工作。
- Client 文案已分中英两套字典并由 `ctx.locale.register('cangzhi', { zh, en })` 注入，但部分运维提示（如“正在创建 DSH 专用访问令牌…”）仍硬编码中文。
- 构建仍依赖本地 DSH preset；发布时应保留并校验已构建的 `lib/`。

## 后续优先级

1. 把活动知识空间从进程全局状态升级为会话/用户级状态（与策略 localStorage key 解耦，绑定到 DSH session id / 用户身份）；
2. 把 Popover 的“会话级：仅本对话”策略真正落到 system prompt / MCP 路由，按 session 隔离；
3. 为 Host 配置校验、代理鉴权、token 生命周期和空间切换增加自动化测试；
4. 完成剩余硬编码中文到 DSH locale；
5. 建立独立版本发布、兼容性矩阵和打包校验。
