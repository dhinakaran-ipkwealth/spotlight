#!/usr/bin/env bash
# Build and (re)start the feedback backend (port 4000) and frontend (port 4001) via PM2.
# Run from anywhere: bash deploy.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Pulling latest code"
git -C "$ROOT_DIR/.." pull

echo "==> Building backend"
cd "$ROOT_DIR/backend"
npm ci
npm run build

echo "==> Building frontend"
cd "$ROOT_DIR/frontend"
npm ci
npm run build

echo "==> Starting/reloading PM2 processes"
pm2 startOrReload "$SCRIPT_DIR/ecosystem.config.js"
pm2 save

echo "==> Done. Current PM2 status:"
pm2 status
