#!/usr/bin/env bash
set -euo pipefail

DSH_SOURCE="${DSH_SOURCE:-}"
DSH_PROFILE="${DSH_PROFILE:-web}"
DSH_HOST="${DSH_HOST:-127.0.0.1}"
DSH_PORT="${DSH_PORT:-3080}"
CANGZHI_API_URL="${CANGZHI_API_URL:-http://127.0.0.1:8000}"
CANGZHI_WEB_URL="${CANGZHI_WEB_URL:-http://127.0.0.1:3000}"
CANGZHI_DSH_MCP_PORT="${CANGZHI_DSH_MCP_PORT:-3081}"
CANGZHI_WORKSPACE="${CANGZHI_WORKSPACE:-default}"
CANGZHI_API_BASE="${CANGZHI_API_URL%/}"

if [[ -z "$DSH_SOURCE" ]]; then
  echo "请设置 DSH_SOURCE，指向 DeepSeek Harness 源码目录。" >&2
  exit 1
fi
if [[ ! -f "$DSH_SOURCE/apps/cli/lib/bin.js" ]]; then
  echo "DSH_SOURCE 无效：$DSH_SOURCE" >&2
  exit 1
fi
if [[ ! "$DSH_PORT" =~ ^[0-9]+$ || ! "$CANGZHI_DSH_MCP_PORT" =~ ^[0-9]+$ ]]; then
  echo "DSH_PORT 和 CANGZHI_DSH_MCP_PORT 必须是数字端口。" >&2
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  if ! curl --silent --show-error --fail --max-time 3 "$CANGZHI_API_BASE/api/readiness" >/dev/null; then
    echo "藏知 API 未就绪：$CANGZHI_API_BASE/api/readiness" >&2
    exit 1
  fi
fi

if command -v ss >/dev/null 2>&1; then
  if ss -ltn | grep -Eq ":${DSH_PORT}[[:space:]]"; then
    echo "DSH 端口 $DSH_PORT 已被占用。" >&2
    exit 1
  fi
  if ss -ltn | grep -Eq ":${CANGZHI_DSH_MCP_PORT}[[:space:]]"; then
    echo "内部 MCP 端口 $CANGZHI_DSH_MCP_PORT 已被占用。" >&2
    exit 1
  fi
fi

echo "启动 DSH：$DSH_HOST:$DSH_PORT"
echo "藏知 API：$CANGZHI_API_BASE"
echo "藏知 Web：${CANGZHI_WEB_URL%/}"
cd "$DSH_SOURCE"
exec env \
  CANGZHI_API_URL="$CANGZHI_API_BASE" \
  CANGZHI_WEB_URL="${CANGZHI_WEB_URL%/}" \
  CANGZHI_DSH_MCP_PORT="$CANGZHI_DSH_MCP_PORT" \
  CANGZHI_WORKSPACE="$CANGZHI_WORKSPACE" \
  node apps/cli/lib/bin.js --profile "$DSH_PROFILE" \
  --host "$DSH_HOST" --port "$DSH_PORT" --no-open
