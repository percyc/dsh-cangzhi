# dsh-cangzhi

[简体中文](./README.md) | [English](./README.en.md)

`dsh-cangzhi` is the standalone Cangzhi adapter for DeepSeek Harness (DSH). Cangzhi remains responsible for knowledge bases, retrieval, evidence, personal access tokens (PATs), and MCP services. This project provides the native DSH interface, same-origin proxy, credential storage, knowledge-space selection, and MCP integration.

The adapter does not need to live beside the Cangzhi source tree and does not import Cangzhi's internal Python or TypeScript modules. It connects only through Cangzhi's public HTTP API, Web interface, and MCP protocol.

## Features

- A compact Cangzhi action in the DSH conversation input toolbar, plus a global management entry in the sidebar;
- Upload, search, document, category, knowledge-space, processing-status, and system-status management;
- A continuously resizable right-side knowledge workbench with per-conversation enablement, space selection, connection settings, PDF preview, citation navigation, and ask-from-source actions;
- PATs stored in the DSH credential store, never exposed directly to the browser or MCP client;
- Model retrieval and citation through `mcp__cangzhi__knowledge_*` tools scoped to the selected knowledge space;
- Support for Cangzhi Web/API deployments on localhost, a private network, or behind a reverse proxy.

## Runtime boundary

```text
DSH browser
  └─ dsh-cangzhi UI
       ├─ DSH same-origin Web/API proxy ──> Cangzhi Web/API
       └─ DSH credential store ──> loopback MCP proxy ──> Cangzhi /api/mcp
```

The public connection settings are limited to service URLs, the internal loopback port, and the default knowledge space. Service URLs and the default space can be managed in native DSH settings; deployment environment variables may override and lock those values. `/_cangzhi`, `/_dsh-cangzhi-api`, and `/_cangzhi-plugin` are internal adapter protocol paths and are deliberately not configurable, preventing Host and Client configuration drift.

## Prerequisites

- A reachable Cangzhi instance whose API responds to at least `GET /api/readiness`;
- A DSH installation with dependencies installed and the Web profile available;
- A Cangzhi administrator account for the initial sign-in and creation of a least-privilege PAT.

The conversation action requires a recent DSH release with the `conversation.input.left` slot. Older DSH versions can still use sidebar management and MCP tools, but upgrading to the current DSH release is recommended.

## Installation

For production deployment, private Gitea/GitLab repositories, upgrades, rollback, and troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md) (Chinese).

Published packages include prebuilt `lib/` artifacts, so consumers do not need the Cangzhi source tree. In a DSH source installation, install a tagged Git revision through the Profile plugin manager:

```bash
cd /path/to/deepseek-harness
pnpm dsh plugin --profile web add \
  "git+ssh://git@gitea.example.com/team/dsh-cangzhi.git#<release-tag-or-commit>"
```

A local directory can also be installed directly:

```bash
export DSH_SOURCE=/path/to/deepseek-harness
cd "$DSH_SOURCE"
pnpm dsh plugin --profile web add file:/path/to/dsh-cangzhi
```

Note that `file:` installs a directory snapshot. After rebuilding the source, an `Already up to date` message does not guarantee that the Profile contains the new artifacts. Prefer `link:/path/to/dsh-cangzhi` for development, or remove and re-add a `file:` installation. Production deployments should pin a Git tag or commit SHA.

When developing this repository, the setup script can build and reinstall the adapter:

```bash
export DSH_SOURCE=/path/to/deepseek-harness
export DSH_PROFILE=web
./scripts/setup-dsh.sh
```

The script builds and installs only the adapter; it does not modify or rebuild the DSH base project.

Peer auto-install is disabled for `pnpm install` in this repository. The target DSH Profile supplies the `@deepseek-ai/dsh-*` runtime packages; do not install them separately from npm inside the plugin directory.

## Configuration

After installation, click **Cangzhi** in the conversation input toolbar and open **Settings** in the workbench. The same settings are also available under **Settings → Plugins → Cangzhi** in DSH. Both entry points edit the same API URL, Web URL, and default knowledge space. DSH persists these values in `$DSH_HOME/settings.yaml`; restart DSH after saving. **Test connection** checks the candidate API without modifying the saved configuration.

Machine-level deployment settings can be supplied with these environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `CANGZHI_API_URL` | `http://127.0.0.1:8000` | Cangzhi API URL; explicitly setting it locks the corresponding UI field |
| `CANGZHI_WEB_URL` | `http://127.0.0.1:3000` | Cangzhi Web URL; explicitly setting it locks the corresponding UI field |
| `CANGZHI_DSH_MCP_PORT` | `3081` | Credential proxy port, bound to loopback only |
| `CANGZHI_WORKSPACE` | `default` | Default knowledge space; explicitly setting it locks the corresponding UI field |

For personal or development environments, leave the three editable variables unset and use the DSH settings UI. For production, container, and multi-instance deployments, set them explicitly so the configuration is auditable and cannot be changed from the page:

```bash
export CANGZHI_API_URL=https://knowledge-api.example.com
export CANGZHI_WEB_URL=https://knowledge.example.com
export CANGZHI_DSH_MCP_PORT=3081
export CANGZHI_WORKSPACE=default
```

`CANGZHI_DSH_MCP_PORT` is always a deployment parameter and is not exposed in the settings UI. Do not put the Cangzhi PAT in environment variables or `settings.yaml`, and do not configure the DSH MCP client to bypass the adapter. On the first **Sign in and connect** action in DSH, the adapter creates a read-only/retrieval PAT and stores it in the DSH `CANGZHI_TOKEN` credential entry.

## Local development

The Client build reuses the target DSH browser preset. `DSH_SOURCE` is therefore required, but no Cangzhi repository path is needed:

```bash
export DSH_SOURCE=/home/user/src/deepseek-harness
"$DSH_SOURCE/node_modules/.bin/tsdown" --config tsdown.config.ts
node scripts/rewrite-client-id.mjs
npm run check
```

Start a local DSH instance with:

```bash
export DSH_SOURCE=/home/user/src/deepseek-harness
export CANGZHI_API_URL=http://127.0.0.1:8000
export CANGZHI_WEB_URL=http://127.0.0.1:3000
./scripts/start-dev-dsh.sh
```

The script checks Cangzhi readiness and port ownership before starting. Use the newly printed `?token=...` URL after DSH starts; a token from an earlier process cannot be reused.

## Cangzhi knowledge spaces and DSH workspaces

Both concepts remain available but serve different purposes:

- A DSH workspace determines local files, command directories, permissions, and conversation archives.
- A Cangzhi knowledge space determines which knowledge the model may retrieve, cite, and manage.

Knowledge-only conversations can remain in a single DSH workspace. Switch DSH workspaces only when a task must operate on a different local file or code tree. Changing the Cangzhi knowledge space affects both management views and subsequent MCP calls for that conversation.

## Security

- PATs are stored only in DSH credentials and are never returned by status endpoints;
- The MCP credential proxy listens only on `127.0.0.1`;
- Cangzhi Web/API proxy routes require DSH connection authentication;
- Configuration URLs cannot contain usernames or passwords;
- The adapter does not collect host CPU or memory data. Its management center shows only system status exposed by Cangzhi and suitable for operational diagnosis.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment and operations, and [HANDOFF.md](./HANDOFF.md) for current development status, validation, and known limitations (both in Chinese).
