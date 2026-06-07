#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/bladeboxarena"

echo "[deploy] Blade Box Arena VAIO update"
cd "$APP_DIR"

echo "[deploy] Checking for local changes"
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[deploy] Refusing to continue: local tracked changes are present."
  echo "[deploy] Commit, stash, or resolve them before running deployment."
  exit 1
fi

if [ "$(git ls-files --others --exclude-standard | wc -l)" -gt 0 ]; then
  echo "[deploy] Refusing to continue: untracked files are present."
  echo "[deploy] Review or remove them before running deployment."
  exit 1
fi

echo "[deploy] Pulling latest source"
git pull

echo "[deploy] Installing dependencies"
npm install

echo "[deploy] Building PWA assets"
npm run build:web

echo "[deploy] Starting/reloading PM2 services"
pm2 startOrReload server/ecosystem.config.cjs --env production

echo "[deploy] Saving PM2 process list"
pm2 save

echo "[deploy] Done"
echo "[deploy] PWA website: http://10.0.0.242:8000"
echo "[deploy] Relay health: http://10.0.0.242:8787/health"
