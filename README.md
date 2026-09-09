# dsh-cangzhi

`dsh-cangzhi` 是藏知面向 DeepSeek Harness（DSH）的独立适配器。藏知继续专注知识库、检索、证据、PAT 与 MCP 服务；本项目负责 DSH 内的原生界面、同源代理、凭据保管、知识空间选择和 MCP 接入。

它不要求与藏知源码放在同一目录，也不会导入藏知的内部 Python/TypeScript 模块。连接只使用藏知公开的 HTTP API、Web 页面和 MCP 协议。

## 功能

- DSH 输入工具栏中的紧凑藏知入口，以及侧栏中的全局管理入口；
- 上传、搜索、文档、分类、知识空间、处理状态和系统状态管理；
- 可连续拖拽加宽的右侧知识工作台、会话开关/空间/连接设置、PDF 预览、引用定位和资料提问；
- PAT 在 DSH 凭据存储中保存，浏览器和 MCP 客户端不直接持有密钥；
- 模型通过 `mcp__cangzhi__knowledge_*` 工具检索和引用当前知识空间；
- 藏知 Web/API 可部署在本机、局域网或反向代理之后。

## 运行边界

```text
DSH 浏览器
  └─ dsh-cangzhi UI
       ├─ DSH 同源 Web/API 代理 ──> 藏知 Web/API
       └─ DSH 凭据存储 ──> 回环 MCP 代理 ──> 藏知 /api/mcp
```

公开连接配置只有服务地址、内部回环端口和默认知识空间。服务地址与默认知识空间可在 DSH 原生设置中维护；部署环境变量可覆盖并锁定对应项目。`/_cangzhi`、`/_dsh-cangzhi-api` 与 `/_cangzhi-plugin` 是适配器内部协议路径，不作为部署参数，避免 Host 与 Client 配置不一致。

## 前置条件

- 一个可访问的藏知实例：API 至少应通过 `GET /api/readiness`；
- 一个已经安装依赖并可运行的 DSH；
- 藏知管理员账号用于首次登录并创建最小权限 PAT。

会话工具入口依赖新版 DSH 的 `conversation.input.left` 槽位。没有该槽位的旧 DSH 仍可使用侧栏管理和 MCP 工具，但建议升级到当前 DSH 版本。

## 安装

生产部署、Gitea/GitLab 私有仓库、版本升级、回滚和故障排查请先阅读 [DEPLOYMENT.md](./DEPLOYMENT.md)。

发布包包含预构建的 `lib/`，用户安装时不需要藏知源码。原生 DSH 源码环境推荐通过 Profile 插件管理器安装带版本标签的 Git 仓库：

```bash
cd /path/to/deepseek-harness
pnpm dsh plugin --profile web add \
  "git+ssh://git@gitea.example.com/team/dsh-cangzhi.git#<release-tag-or-commit>"
```

本地目录也可以直接安装：

```bash
export DSH_SOURCE=/path/to/deepseek-harness
cd "$DSH_SOURCE"
pnpm dsh plugin --profile web add file:/path/to/dsh-cangzhi
```

注意：`file:` 会复制目录快照，源码更新后出现 `Already up to date` 不代表 Profile
已拿到新构建。开发联调优先使用 `link:/path/to/dsh-cangzhi`；继续用 `file:` 时，先
移除旧插件再重新添加。生产部署仍应固定 Git tag 或 commit SHA。

本仓库开发时可使用脚本构建并重新安装：

```bash
export DSH_SOURCE=/path/to/deepseek-harness
export DSH_PROFILE=web
./scripts/setup-dsh.sh
```

该脚本只构建和安装适配器，不修改、不重编译 DSH 基座。

插件仓库的 `pnpm install` 已关闭 peer 自动安装。`@deepseek-ai/dsh-*` 运行包由目标 DSH Profile 提供，不应在插件目录中从 npm 单独安装。

## 配置

安装后进入“设置 → 插件 → 藏知”，可以配置 API 地址、Web 地址和默认知识空间。这些值由 DSH 原生设置服务持久化到 `$DSH_HOME/settings.yaml`，保存后重启 DSH 生效；页面中的“测试连接”只检查候选 API，不会修改配置。

部署环境仍可通过以下变量提供机器级配置：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `CANGZHI_API_URL` | `http://127.0.0.1:8000` | 藏知 API 地址；显式设置后锁定页面字段 |
| `CANGZHI_WEB_URL` | `http://127.0.0.1:3000` | 藏知 Web 地址；显式设置后锁定页面字段 |
| `CANGZHI_DSH_MCP_PORT` | `3081` | 仅回环监听的凭据代理端口 |
| `CANGZHI_WORKSPACE` | `default` | 默认知识空间；显式设置后锁定页面字段 |

建议个人或开发环境不设置三个可编辑变量，直接使用 DSH 设置页；生产、容器和多实例部署则显式设置它们，使配置可审计且不会被页面修改：

```bash
export CANGZHI_API_URL=https://knowledge-api.example.com
export CANGZHI_WEB_URL=https://knowledge.example.com
export CANGZHI_DSH_MCP_PORT=3081
export CANGZHI_WORKSPACE=default
```

`CANGZHI_DSH_MCP_PORT` 始终是部署参数，不出现在设置页。不要把藏知 PAT 写入环境变量或 `settings.yaml`，也不要让 DSH MCP 客户端绕过适配器直连藏知。首次在 DSH 页面执行“登录并连接”后，适配器会创建只读/检索权限 PAT，并存入 DSH 的 `CANGZHI_TOKEN` 凭据项。

## 本地源码开发

构建当前插件仍复用 DSH 的浏览器打包 preset，因此需要 `DSH_SOURCE`，但不依赖藏知仓库路径：

```bash
export DSH_SOURCE=/home/user/src/deepseek-harness
"$DSH_SOURCE/node_modules/.bin/tsdown" --config tsdown.config.ts
node scripts/rewrite-client-id.mjs
npm run check
```

启动本地 DSH：

```bash
export DSH_SOURCE=/home/user/src/deepseek-harness
export CANGZHI_API_URL=http://127.0.0.1:8000
export CANGZHI_WEB_URL=http://127.0.0.1:3000
./scripts/start-dev-dsh.sh
```

脚本会先检查藏知 readiness 和端口占用。DSH 启动后请使用终端新打印的 `?token=...` URL，重启前的 token 不能复用。

## 知识空间与 DSH 工作区

两者保留，但职责不同：

- DSH 工作区决定本地文件、命令目录、权限和会话归档；
- 藏知知识空间决定模型能够检索、引用和管理哪一组知识。

纯知识问答可以长期使用一个固定 DSH 工作区；只有任务需要操作另一套本地文件或代码时才切换 DSH 工作区。藏知空间切换会同时影响管理页面和后续 MCP 调用。

## 安全说明

- PAT 只保存在 DSH credentials 中，状态接口不回显密钥；
- MCP 凭据代理只监听 `127.0.0.1`；
- 藏知 Web/API 代理要求通过 DSH 自身的连接认证；
- 配置 URL 不允许包含用户名或密码；
- CPU/内存等宿主机数据不由适配器采集。管理中心只显示藏知公开且适合运维判断的系统状态。

完整部署与运维说明见 [DEPLOYMENT.md](./DEPLOYMENT.md)，开发现状、验证清单与遗留问题见 [HANDOFF.md](./HANDOFF.md)。
