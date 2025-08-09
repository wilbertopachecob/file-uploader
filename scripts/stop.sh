#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[stop.sh] Stopping app processes..."

# Helper: kill processes by pattern if present
kill_by_pattern() {
  local pattern="$1"
  local pids
  if pids=$(pgrep -f "$pattern" 2>/dev/null || true); then
    if [[ -n "${pids}" ]]; then
      echo "[stop.sh] Killing processes matching: $pattern ($pids)"
      # shellcheck disable=SC2086
      kill -9 $pids || true
    fi
  fi
}

# Helper: kill by port if present
kill_by_port() {
  local port="$1"
  local pids
  if pids=$(lsof -ti tcp:"$port" 2>/dev/null || true); then
    if [[ -n "${pids}" ]]; then
      echo "[stop.sh] Killing processes on port $port ($pids)"
      # shellcheck disable=SC2086
      kill -9 $pids || true
    fi
  fi
}

# Kill Node server started by `node server/index.js`
kill_by_pattern "$ROOT_DIR/server/index.js"

# Kill Vue CLI dev server
kill_by_pattern "$ROOT_DIR/front_end/node_modules/.bin/vue-cli-service serve"
kill_by_pattern "vue-cli-service serve --"

# Fallback: try common ports
kill_by_port 3000   # Express default
kill_by_port 8080   # Vue default
kill_by_port 8081
kill_by_port 8082   # Observed in dev output

echo "[stop.sh] Done."


