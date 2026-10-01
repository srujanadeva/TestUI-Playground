#!/usr/bin/env bash
# Starts MongoDB (if not already running), then the Vite frontend + Express API.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "==> Checking MongoDB (127.0.0.1:27017)..."
if nc -z 127.0.0.1 27017 2>/dev/null; then
  echo "    Mongo already running."
else
  echo "    Mongo not running — starting via brew services..."
  brew services start mongodb-community

  echo -n "    Waiting for Mongo to accept connections"
  for _ in $(seq 1 30); do
    if nc -z 127.0.0.1 27017 2>/dev/null; then
      echo " done."
      break
    fi
    echo -n "."
    sleep 1
  done

  if ! nc -z 127.0.0.1 27017 2>/dev/null; then
    echo
    echo "ERROR: MongoDB did not start within 30s. Check 'brew services list' and Mongo logs." >&2
    exit 1
  fi
fi

echo "==> Starting web (Vite) + api (Express) via 'npm run dev'..."
exec npm run dev
