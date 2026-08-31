# dsh-cangzhi 部署指南

本文适用于以下部署方式：

- DeepSeek Harness（DSH）从官方源码运行；
- `dsh-cangzhi` 保存在 Gitea、GitLab 或其他私有 Git 服务；
- 插件安装到 DSH 的 `web` Profile；
- 藏知 Web/API 已经独立运行。

推荐保持 DSH 与插件为两个独立仓库，不复制插件源码到 DSH，也不修改 DSH 上游文件。DSH 通过标准 Git package spec 安装插件，并从插件声明的 `cordis.patch.yml` 自动加载 Host、Client 和 MCP 配置。

## 1. 部署边界与已知限制

当前版本适合单用户或受信任的小范围部署。活动藏知知识空间保存在单个 DSH 进程中，会被该进程内的浏览器页面共享。不要在修复会话级空间隔离前，将同一 DSH 实例作为互不信任用户的多租户服务。

网络上只应暴露 DSH Web 端口。`CANGZHI_DSH_MCP_PORT` 必须保持为本机回环用途，不要通过防火墙、容器端口映射或反向代理公开。

## 2. 前置条件

- 已安装 Git、Node.js 和 pnpm；版本要求以当前 DSH 上游仓库为准；
- 部署账号可以读取私有插件仓库；
- 藏知 API 的 `GET /api/readiness` 返回成功；
- DSH Web 端口和内部 MCP 端口未被占用；
- 插件仓库已提交预构建的 `lib/index.js`、`lib/client.js` 和 `lib/client.js.map`。

下文统一使用 `git.example.com/team/dsh-cangzhi` 作为示例仓库。`example.com` 是文档占位域名，请替换为实际 Git 服务域名、组织和仓库名：

```bash
export DSH_SOURCE=/opt/deepseek-harness
export DSH_PROFILE=web
export CANGZHI_PLUGIN_VERSION=<release-tag-or-commit>
export CANGZHI_PLUGIN_SPEC="git+ssh://git@git.example.com/team/dsh-cangzhi.git#${CANGZHI_PLUGIN_VERSION}"
```

如果 Gitea SSH 使用非标准端口，例如 `2222`：

```bash
export CANGZHI_PLUGIN_SPEC="git+ssh://git@git.example.com:2222/team/dsh-cangzhi.git#${CANGZHI_PLUGIN_VERSION}"
```

## 3. 发布插件版本

这一节由插件维护者执行，普通部署机器从第 4 节开始。

首次发布前先验证构建产物和发布清单：

```bash
cd /path/to/dsh-cangzhi
npm run check
npm pack --dry-run
```

提交源码和预构建产物，并创建不可变版本标签：

```bash
git add .
git commit -m "Release dsh-cangzhi <release-tag>"
git branch -M main
git push -u origin main
git tag -a <release-tag> -m "dsh-cangzhi <release-tag>"
git push origin <release-tag>
```

部署环境应固定 tag 或 commit SHA，不要直接依赖浮动的 `main` 分支。发布新版本时更新 `package.json` 中的版本号、重新生成并验证 `lib/`，再创建新标签；不要移动已经发布的标签。

## 4. 安装原生 DSH

首次部署：

```bash
git clone https://github.com/deepseek-ai/deepseek-harness.git "$DSH_SOURCE"
cd "$DSH_SOURCE"
pnpm install
pnpm run build
```

`pnpm run build` 用于准备 DSH 自身的 Host 和前端产物。以后只升级插件时，不需要重新构建 DSH。

## 5. 配置私有 Git 访问

生产环境推荐使用只读 SSH deploy key，不要把 Gitea 密码或访问令牌写进插件 URL。

先确认运行 DSH 的同一操作系统账号能够访问仓库：

```bash
git ls-remote git@git.example.com:team/dsh-cangzhi.git
```

首次连接 Gitea 时，应通过运维渠道核对 SSH host key，再写入该账号的 `known_hosts`。如果使用 systemd 或容器，必须确保实际运行账号也能读取私钥和 `known_hosts`，不能只在管理员的交互式账号下测试成功。

也可以使用 HTTPS：

```bash
export CANGZHI_PLUGIN_SPEC="git+https://git.example.com/team/dsh-cangzhi.git#${CANGZHI_PLUGIN_VERSION}"
```

私有 HTTPS 仓库应通过 Git credential helper 或受控的凭据文件认证，不要把 token 拼入 URL，因为插件来源会被记录到 DSH Profile 的清单和锁文件中。

## 6. 安装插件到 Web Profile

在 DSH 仓库根目录运行：

```bash
cd "$DSH_SOURCE"
pnpm dsh plugin --profile "$DSH_PROFILE" add "$CANGZHI_PLUGIN_SPEC"
```

DSH 会在 `$DSH_HOME/profiles/web`（默认 `~/.dsh/profiles/web`）维护 Profile 依赖，并根据插件 `package.json` 中的 `dsh.bundle` 声明加载 `cordis.patch.yml`。

不要再手工向 DSH Profile 的 `cordis.patch.yml` 插入 `cangzhi` 或 `cangzhi-mcp`，否则可能产生重复的 Loader entry ID。

## 7. 配置藏知连接

插件支持两级配置，优先级如下：

1. 显式环境变量：机器级配置，并在 DSH 设置页锁定对应字段；
2. DSH 原生设置：适合个人、开发和单实例环境，保存在 `$DSH_HOME/settings.yaml`；
3. 插件默认值：首次启动时提供本机地址和 `default` 空间。

### 方式 A：在 DSH 中配置

不要设置 `CANGZHI_API_URL`、`CANGZHI_WEB_URL` 和 `CANGZHI_WORKSPACE`，启动 DSH 后进入“设置 → 插件 → 藏知”。填写服务地址与默认空间，点击“测试连接”，保存并重启 DSH。

页面不会管理 MCP 监听端口或 PAT：端口属于进程部署配置，PAT 由 DSH credentials 单独保管。

### 方式 B：由部署环境锁定

生产、容器、多实例或统一运维环境推荐把机器级配置保存到 `$DSH_HOME/.env`。没有显式设置 `DSH_HOME` 时使用 `~/.dsh/.env`：

```dotenv
CANGZHI_API_URL=http://127.0.0.1:8000
CANGZHI_WEB_URL=http://127.0.0.1:3000
CANGZHI_DSH_MCP_PORT=3081
CANGZHI_WORKSPACE=default
```

生产环境示例：

```dotenv
CANGZHI_API_URL=https://knowledge-api.example.com
CANGZHI_WEB_URL=https://knowledge.example.com
CANGZHI_DSH_MCP_PORT=3081
CANGZHI_WORKSPACE=default
```

配置要求：

- `CANGZHI_API_URL` 和 `CANGZHI_WEB_URL` 必须是绝对的 HTTP(S) URL；
- URL 中不能包含用户名或密码；
- `CANGZHI_DSH_MCP_PORT` 必须是 `1024` 到 `65535` 之间的空闲端口；
- `CANGZHI_WORKSPACE` 只能包含小写字母、数字和连字符，最长 64 个字符；
- 显式设置服务 URL 或默认空间后，DSH 设置页会显示“由管理员环境变量锁定”且不可编辑；
- 修改 `.env` 后必须重启 DSH；在设置页保存配置同样需要重启；
- 不要在 `.env` 或 `settings.yaml` 中配置藏知 PAT，PAT 由首次连接流程写入 DSH credentials。

限制 `.env` 的读取权限：

```bash
chmod 600 "${DSH_HOME:-$HOME/.dsh}/.env"
```

## 8. 启动 DSH

本机使用：

```bash
cd "$DSH_SOURCE"
pnpm dsh web
```

服务器或反向代理后运行：

```bash
cd "$DSH_SOURCE"
pnpm dsh web --host 0.0.0.0 --port 3080 --trusted-host dsh.example.com --no-open
```

只添加实际使用的 `--trusted-host`。浏览器应使用本次启动日志打印的、包含 `?token=...` 的 URL；DSH 重启后不要复用旧 token URL。

## 9. 首次连接藏知

1. 打开 DSH Web 页面；
2. 从首页或侧栏进入“藏知”；
3. 使用藏知管理员账号登录；
4. 点击“登录并连接”或“启用模型检索”；
5. 插件创建最小权限 PAT，并写入 DSH 的 `CANGZHI_TOKEN` credentials 项；
6. 选择一个活动知识空间；
7. 新建 DSH 会话，确认模型可以调用 `mcp__cangzhi__knowledge_search`。

PAT 不会写入插件仓库、`.env` 或浏览器本地存储。

## 10. 验证部署

启动 DSH 前，使用实际配置的 API 地址检查藏知服务。例如本机部署：

```bash
curl --fail --silent --show-error http://127.0.0.1:8000/api/readiness
```

检查 DSH 最终组合配置：

```bash
cd "$DSH_SOURCE"
pnpm dsh web --dump-config
```

输出中应包含：

```text
id: cangzhi
name: dsh-cangzhi

id: cangzhi-mcp
name: '@deepseek-ai/dsh-mcp-client'
```

最小人工验收：

1. DSH 页面能显示藏知入口；
2. 藏知登录、资料列表和知识空间列表正常；
3. 上传一份测试文档后能够进入处理队列；
4. “对话接入”显示已连接；
5. 模型能调用 `mcp__cangzhi__knowledge_search` 并返回当前空间证据；
6. 切换空间后，下一次工具调用使用新空间；
7. 断开 PAT 后，MCP 调用明确返回未配置且不泄漏 token。

## 11. 升级与回滚

先在插件仓库发布新版本，再在 DSH 机器执行：

```bash
cd "$DSH_SOURCE"
pnpm dsh plugin --profile web add "git+ssh://git@git.example.com/team/dsh-cangzhi.git#<new-release-tag>"
```

重启 DSH 后执行第 10 节的验证。插件升级不应删除 DSH credentials，通常无需重新创建 PAT。

如果需要回滚，重新安装上一个标签并重启：

```bash
cd "$DSH_SOURCE"
pnpm dsh plugin --profile web add "git+ssh://git@git.example.com/team/dsh-cangzhi.git#<previous-release-tag>"
```

不要通过强制移动 Git 标签完成回滚。

## 12. 卸载

```bash
cd "$DSH_SOURCE"
pnpm dsh plugin --profile web remove dsh-cangzhi
```

重启 DSH 后插件 UI、Host 网关和 MCP 配置将不再加载。卸载 npm 包不等于撤销藏知 PAT；如果不再使用该连接，还应在藏知的访问令牌管理中撤销对应的“DSH 对话插件”令牌。

## 13. 本地开发安装

开发环境可以把两个仓库放在同级目录：

```text
/home/user/src/
├── deepseek-harness/
└── dsh-cangzhi/
```

修改插件源码后构建并安装：

```bash
cd /home/user/src/dsh-cangzhi
export DSH_SOURCE=/home/user/src/deepseek-harness
export DSH_PROFILE=web
./scripts/setup-dsh.sh
```

随后启动：

```bash
cd /home/user/src/deepseek-harness
pnpm dsh web
```

开发环境可以使用本地目录；生产环境应安装带 tag 或 commit SHA 的 Git 版本。

`file:` 是 pnpm 的目录快照，不保证源码变化后再次执行 `add` 就刷新。如果命令显示
`Already up to date`，但页面仍是旧功能，应移除后重新添加；需要边改边看的开发环境
改用 `link:`：

```bash
cd "$DSH_SOURCE"
pnpm dsh plugin --profile "$DSH_PROFILE" remove dsh-cangzhi
pnpm dsh plugin --profile "$DSH_PROFILE" add "link:/path/to/dsh-cangzhi"
```

无论 `file:` 还是 `link:`，都必须先按上文构建出最新 `lib/`，然后重启 DSH。生产环境
不要使用 `link:`，应固定 Git tag 或 commit SHA。

插件目录不需要单独下载 DSH peer packages。仓库中的 `pnpm-workspace.yaml` 已设置 `autoInstallPeers: false`；不要删除该设置，也不要把 DSH 的预发布依赖改为从 npm 强制安装。

## 14. 常见故障

### Git 安装提示无权限

使用运行 DSH 的账号执行 `git ls-remote`。检查 SSH deploy key、Gitea 仓库读取权限、`known_hosts` 和非标准 SSH 端口。

### Profile 中没有插件

重新执行 `pnpm dsh plugin --profile web add ...`，然后运行 `pnpm dsh web --dump-config`。确认插件仓库根目录包含 `package.json`，且其中声明了 `dsh.bundle.patch`。

### pnpm 报 `ERR_PNPM_UNEXPECTED_STORE`

这通常表示把旧机器的 `~/.dsh`、DSH Profile 或 `node_modules` 一起复制到了新机器。`node_modules/.modules.yaml` 记录了创建它的 pnpm store 绝对路径，不能跨机器复用。插件和 DSH 源码可以通过 Git 拉取或复制，但以下目录必须在目标机器重新生成：

- DSH 源码中的 `node_modules`；
- `$DSH_HOME/profiles/*/node_modules`；
- 插件源码中的 `node_modules`（如果存在）。

不要为了兼容旧机器的临时目录而修改全局 `store-dir`。在目标机器上先退出 DSH，将失效的 Profile 依赖目录保留为备份：

```bash
export DSH_PROFILE_HOME="${DSH_HOME:-$HOME/.dsh}/profiles/web"
export DSH_PROFILE_BACKUP="$DSH_PROFILE_HOME/node_modules.from-old-machine"
test ! -e "$DSH_PROFILE_BACKUP" || { echo "备份目录已存在：$DSH_PROFILE_BACKUP"; exit 1; }
mv "$DSH_PROFILE_HOME/node_modules" "$DSH_PROFILE_BACKUP"
```

然后使用目标机器的 pnpm 重新安装 Profile 依赖：

```bash
cd "$DSH_PROFILE_HOME"
pnpm install
```

如果 `package.json` 或锁文件同时记录了旧机器上不存在的插件绝对路径，先通过 DSH 插件管理器移除失效依赖，再添加目标机器上的当前目录或 Git 地址：

```bash
cd "$DSH_SOURCE"
pnpm dsh plugin --profile web remove dsh-cangzhi
pnpm dsh plugin --profile web add "$CANGZHI_PLUGIN_SPEC"
pnpm dsh web --dump-config
```

确认安装正常后，可以删除备份目录 `node_modules.from-old-machine`。这些操作只重建 Profile 的插件依赖，不会删除 DSH credentials、DSH 设置或藏知数据。

### 插件目录提示 `ERR_PNPM_NO_MATCHING_VERSION`

如果缺少的是 `@deepseek-ai/dsh-*@0.1.2-alpha.1`，说明 pnpm 正在错误地尝试下载应由 DSH Profile 提供的 peer packages。确认插件仓库包含以下文件后重新安装：

```yaml
# pnpm-workspace.yaml
packages:
  - .
autoInstallPeers: false
```

```bash
cd /path/to/dsh-cangzhi
pnpm install
```

不要只把某一个 peer dependency 改成镜像中较新的 alpha 版本；插件声明应与目标 DSH 版本保持一致。

### DSH 启动时报端口占用

修改 `CANGZHI_DSH_MCP_PORT` 后重启 DSH。该值同时用于插件 Host 和 `cangzhi-mcp`，只应通过环境变量统一修改。

### 页面存在藏知入口，但模型工具不可用

进入“藏知 → 对话接入”检查 PAT 是否已配置；确认藏知 `/api/mcp` 可用，并检查 DSH 日志中的 `cangzhi-mcp` 重连信息。

### 页面返回 401 或 403

使用 DSH 本次启动打印的新 token URL 重新打开页面。确认反向代理保留查询参数和认证相关请求头，并且访问 Host 与启动时使用的 `--trusted-host` 一致。

### 切换空间后结果不符合预期

确认所选空间处于活动状态，并新建一次工具调用。当前版本的空间选择是 DSH 进程级状态，多标签页或多用户可能互相覆盖，不应据此部署多租户实例。
