#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/front_end"
SERVER_DIR="$ROOT_DIR/server"

echo "[start.sh] Building frontend..."
cd "$FRONTEND_DIR"
npm install --no-audit --no-fund
npm run build

echo "[start.sh] Starting server..."
cd "$SERVER_DIR"
npm install --no-audit --no-fund
node index.js



