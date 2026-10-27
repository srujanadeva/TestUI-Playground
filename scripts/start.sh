#!/usr/bin/env bash
# Checks npm packages are installed, starts MongoDB (if not already running),
# then the Vite frontend + Express API.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
source "$PROJECT_DIR/scripts/mongo.sh"

echo "==> Checking npm packages..."
if ! node scripts/check-deps.js; then
  echo "ERROR: Run 'npm run setup' to install them (needed after pulling changes that add packages)." >&2
  exit 1
fi

echo "==> Checking MongoDB (127.0.0.1:27017)..."
if ! start_mongo; then
  echo "ERROR: MongoDB isn't running (reason above). Run 'npm run setup' if it isn't installed yet." >&2
  exit 1
fi

echo "==> Starting web (Vite) + api (Express) via 'npm run dev'..."
exec npm run dev
