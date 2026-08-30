#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DSH_SOURCE="${DSH_SOURCE:-}"
DSH_PROFILE="${DSH_PROFILE:-web}"

if [[ -z "$DSH_SOURCE" ]]; then
  echo "请设置 DSH_SOURCE，指向 DeepSeek Harness 源码目录。" >&2
  exit 1
fi
if [[ ! -f "$DSH_SOURCE/package.json" || ! -f "$DSH_SOURCE/apps/cli/lib/bin.js" ]]; then
  echo "DSH_SOURCE 无效：$DSH_SOURCE" >&2
  exit 1
fi
if [[ ! -x "$DSH_SOURCE/node_modules/.bin/tsdown" ]]; then
  echo "DSH 尚未安装依赖：请先在 $DSH_SOURCE 执行 pnpm install。" >&2
  exit 1
fi

echo "[1/3] 构建 dsh-cangzhi"
(
  cd "$PLUGIN_DIR"
  DSH_SOURCE="$DSH_SOURCE" "$DSH_SOURCE/node_modules/.bin/tsdown" --config tsdown.config.ts
  node scripts/rewrite-client-id.mjs
  node --check lib/index.js
  node --check lib/client.js
)

echo "[2/3] 安装到 DSH Profile：$DSH_PROFILE"
(
  cd "$DSH_SOURCE"
  node apps/cli/lib/bin.js plugin --profile "$DSH_PROFILE" remove dsh-cangzhi >/dev/null 2>&1 || true
  node apps/cli/lib/bin.js plugin --profile "$DSH_PROFILE" add "file:$PLUGIN_DIR"
)

echo "[3/3] 完成"
echo "插件目录：$PLUGIN_DIR"
echo "请重启 DSH；本地源码开发可运行：$PLUGIN_DIR/scripts/start-dev-dsh.sh"
