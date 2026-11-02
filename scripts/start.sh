#!/usr/bin/env bash
# Checks Node and the npm packages, starts MongoDB if it isn't running (whichever one setup
# chose: Homebrew's or setup's own copy), then the Vite frontend + Express API.
set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
source "$PROJECT_DIR/scripts/lib.sh"
use_own_tools

if ! have node; then
  echo "ERROR: Node.js isn't installed. Run setup first: bash setup.sh" >&2
  exit 1
fi

echo "==> Checking Node and npm packages..."
deps_status=0
node scripts/check-deps.js || deps_status=$?
if [ "$deps_status" -eq 2 ]; then
  echo "ERROR: This Node.js is too old. Run setup, which updates it: bash setup.sh" >&2
  exit 1
elif [ "$deps_status" -ne 0 ]; then
  echo "ERROR: The npm packages are missing or out of date (usually after pulling changes). Run setup: bash setup.sh" >&2
  exit 1
fi

echo "==> Checking MongoDB (127.0.0.1:27017)..."
if ! start_mongo; then
  if [ "$MONGO_HOW" = "not installed" ]; then
    echo "ERROR: MongoDB $MONGO_MIN or later isn't installed. Run setup: bash setup.sh" >&2
  else
    explain_mongo_log "$MONGO_LOGFILE"
    echo "ERROR: MongoDB didn't start ($MONGO_HOW). $MONGO_CAUSE" >&2
    echo "       Fix: ${MONGO_FIX%%::*} ${MONGO_FIX#*::}" >&2
  fi
  exit 1
fi
echo "    MongoDB is running ($MONGO_HOW)."

echo "==> Starting web (Vite) + api (Express) via 'npm run dev'..."
echo "    Open https://localhost:3000 (Ctrl+C stops it)"
exec npm run dev
