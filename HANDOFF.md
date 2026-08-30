# dsh-cangzhi 开发交接

## 产品边界

本仓库是独立 DSH 适配器，不是藏知 monorepo 的子模块。禁止从藏知源码目录导入模块、反推相对路径或直接初始化藏知数据库。藏知对本项目只暴露 Web、REST API、PAT 和 streamable HTTP MCP。

DSH 基座只提供通用扩展槽位。`conversation.hero.context` 属于通用宿主能力，应留在 DSH 上游；不得在本仓库复制或维护 DSH 源文件补丁。

## 当前实现

- Host：`src/index.ts` 注册同源 Web/API 网关、控制接口、系统提示和回环 MCP 凭据代理。
- Client：`src/client/plugin.tsx` 提供首页接入、知识空间切换、管理中心、知识工作台和 MCP 结果卡片。
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

## 已知限制

- 当前活动知识空间由一个 DSH 进程共享，不是按浏览器用户或会话隔离。面向多用户部署前，应将空间选择绑定到 DSH 会话/身份上下文。
- 完整首页接入依赖通用 `conversation.hero.context` 槽位；旧 DSH 只能使用其已有槽位中的功能。
- Client 文案仍以中文为主，尚未全部接入 DSH locale。
- 构建仍依赖本地 DSH preset；发布时应保留并校验已构建的 `lib/`。

## 后续优先级

1. 把活动知识空间从进程全局状态升级为会话/用户级状态；
2. 为 Host 配置校验、代理鉴权、token 生命周期和空间切换增加自动化测试；
3. 完成 Client 国际化与旧 DSH 能力降级提示；
4. 建立独立版本发布、兼容性矩阵和打包校验。
