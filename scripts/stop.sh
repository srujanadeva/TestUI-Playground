#!/usr/bin/env bash
# Stops the Vite frontend, Express API (and the concurrently wrapper), then stops MongoDB.
set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$PROJECT_DIR/scripts/mongo.sh"

echo "==> Stopping dev processes for $PROJECT_DIR ..."

# Match only processes whose command line references this project's path, so we
# never touch an unrelated vite/nodemon/concurrently instance on the machine.
PATTERNS=(
  "${PROJECT_DIR}.*concurrently"
  "${PROJECT_DIR}.*vite"
  "${PROJECT_DIR}/server/index.js"
  "nodemon server/index.js"
)

killed_any=0
for pattern in "${PATTERNS[@]}"; do
  pids=$(pgrep -f "$pattern" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "    Killing processes matching '$pattern': $pids"
    kill $pids 2>/dev/null || true
    killed_any=1
  fi
done

if [ "$killed_any" -eq 1 ]; then
  sleep 1
fi

echo "==> Stopping MongoDB..."
stop_mongo

sleep 1
echo "==> Final status:"
for port in 3000 4000 27017; do
  if nc -z 127.0.0.1 "$port" 2>/dev/null; then
    echo "    Port $port: still in use"
  else
    echo "    Port $port: free"
  fi
done
