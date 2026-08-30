# dsh-cangzhi

`dsh-cangzhi` 是藏知面向 DeepSeek Harness（DSH）的独立适配器。藏知继续专注知识库、检索、证据、PAT 与 MCP 服务；本项目负责 DSH 内的原生界面、同源代理、凭据保管、知识空间选择和 MCP 接入。

它不要求与藏知源码放在同一目录，也不会导入藏知的内部 Python/TypeScript 模块。连接只使用藏知公开的 HTTP API、Web 页面和 MCP 协议。

## 功能

- DSH 新会话、会话顶部、输入区和侧栏中的藏知原生入口；
- 上传、搜索、文档、分类、知识空间、处理状态和系统状态管理；
- 右侧知识工作台、PDF 预览、引用定位和资料提问；
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

公开连接配置只有服务地址、内部回环端口和默认知识空间。`/_cangzhi`、`/_dsh-cangzhi-api` 与 `/_cangzhi-plugin` 是适配器内部协议路径，不作为部署参数，避免 Host 与 Client 配置不一致。

## 前置条件

- 一个可访问的藏知实例：API 至少应通过 `GET /api/readiness`；
- 一个已经安装依赖并可运行的 DSH；
- 藏知管理员账号用于首次登录并创建最小权限 PAT。

完整的新会话首页知识空间选择器依赖 DSH 的通用 `conversation.hero.context` 槽位。没有该槽位的旧 DSH 仍可使用侧栏管理、会话状态和 MCP 工具，但建议升级到包含该槽位的 DSH 版本。

## 安装

生产部署、Gitea/GitLab 私有仓库、版本升级、回滚和故障排查请先阅读 [DEPLOYMENT.md](./DEPLOYMENT.md)。

发布包包含预构建的 `lib/`，用户安装时不需要藏知源码。原生 DSH 源码环境推荐通过 Profile 插件管理器安装带版本标签的 Git 仓库：

```bash
cd /path/to/deepseek-harness
pnpm dsh plugin --profile web add \
  "git+ssh://git@gitea.example.com/team/dsh-cangzhi.git#v0.9.0"
```

本地目录也可以直接安装：

```bash
export DSH_SOURCE=/path/to/deepseek-harness
cd "$DSH_SOURCE"
pnpm dsh plugin --profile web add file:/path/to/dsh-cangzhi
```

本仓库开发时可使用脚本构建并重新安装：

```bash
export DSH_SOURCE=/path/to/deepseek-harness
export DSH_PROFILE=web
./scripts/setup-dsh.sh
```

该脚本只构建和安装适配器，不修改、不重编译 DSH 基座。

## 配置

`cordis.patch.yml` 从启动环境读取以下配置：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `CANGZHI_API_URL` | `http://127.0.0.1:8000` | 藏知 API 地址 |
| `CANGZHI_WEB_URL` | `http://127.0.0.1:3000` | 藏知 Web 地址 |
| `CANGZHI_DSH_MCP_PORT` | `3081` | 仅回环监听的凭据代理端口 |
| `CANGZHI_WORKSPACE` | `default` | DSH 启动时的默认知识空间 |

生产环境建议显式设置两个服务 URL：

```bash
export CANGZHI_API_URL=https://knowledge-api.example.com
export CANGZHI_WEB_URL=https://knowledge.example.com
export CANGZHI_DSH_MCP_PORT=3081
export CANGZHI_WORKSPACE=default
```

不要把藏知 PAT 写入这些环境变量，也不要让 DSH MCP 客户端绕过适配器直连藏知。首次在 DSH 页面执行“登录并连接”后，适配器会创建只读/检索权限 PAT，并存入 DSH 的 `CANGZHI_TOKEN` 凭据项。

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
