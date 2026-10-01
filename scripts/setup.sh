#!/usr/bin/env bash
# One-time bootstrap for a fresh clone: Node, npm deps, MongoDB, dev TLS certs,
# and server/.env. Safe to re-run — every step detects existing state and skips it.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
source "$PROJECT_DIR/scripts/mongo.sh"

NODE_MIN_MAJOR=18
SUMMARY=()

note_done()    { SUMMARY+=("  ✔ $1"); }
note_skipped() { SUMMARY+=("  · $1 (already set up)"); }

echo "==> Setting up $PROJECT_DIR"
echo

# ── 1. Homebrew ──────────────────────────────────────────────────────────────
echo "==> Checking Homebrew..."
if ! command -v brew >/dev/null 2>&1; then
  echo
  echo "ERROR: Homebrew is required but not installed." >&2
  echo "Install it from https://brew.sh, then re-run this script:" >&2
  echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' >&2
  exit 1
fi
echo "    Homebrew found."

# ── 2. Node.js ────────────────────────────────────────────────────────────────
echo "==> Checking Node.js (need >= ${NODE_MIN_MAJOR}.x)..."
node_ok=0
if command -v node >/dev/null 2>&1; then
  node_major=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
  if [ "$node_major" -ge "$NODE_MIN_MAJOR" ]; then
    node_ok=1
  fi
fi

if [ "$node_ok" -eq 1 ]; then
  echo "    Node $(node -v) found."
  note_skipped "Node.js"
else
  echo "    Node missing or older than v${NODE_MIN_MAJOR} — installing via brew..."
  brew install node
  node_major=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
  if [ "$node_major" -lt "$NODE_MIN_MAJOR" ]; then
    echo "ERROR: Installed Node ($(node -v)) is still older than v${NODE_MIN_MAJOR}." >&2
    exit 1
  fi
  echo "    Installed Node $(node -v)."
  note_done "Node.js installed via brew"
fi

# ── 3. npm dependencies ───────────────────────────────────────────────────────
echo "==> Installing npm dependencies..."
npm install
note_done "npm dependencies installed"

# ── 4. MongoDB ────────────────────────────────────────────────────────────────
echo "==> Checking MongoDB ($MONGO_FORMULA)..."
if brew list --versions "$MONGO_FORMULA" >/dev/null 2>&1; then
  echo "    $(brew list --versions "$MONGO_FORMULA") already installed."
  note_skipped "MongoDB"
elif command -v mongod >/dev/null 2>&1; then
  # Don't replace someone else's MongoDB: other projects may depend on it or its data.
  echo
  echo "ERROR: A different MongoDB is installed: $(mongod --version | head -1)" >&2
  echo "This project uses $MONGO_FORMULA. To switch, stop and unlink the current one:" >&2
  echo "  brew services stop <formula>   # e.g. mongodb-community" >&2
  echo "  brew unlink <formula>" >&2
  echo "MongoDB 8.0 can't open data written by a newer version, so also move" >&2
  echo "$(brew --prefix)/var/mongodb aside (it will be recreated). Then re-run this script." >&2
  exit 1
else
  echo "    Installing $MONGO_FORMULA via brew..."
  brew tap mongodb/brew
  # --without-mongosh: Homebrew has no prebuilt mongosh for some Macs and would
  # compile it (plus Node) from source. mongosh comes from npm below instead.
  brew install "mongodb/brew/$MONGO_FORMULA" --without-mongosh
  note_done "MongoDB ($MONGO_FORMULA) installed via brew"
fi

if ! command -v mongosh >/dev/null 2>&1; then
  echo "    mongosh (optional shell) not found — installing via npm..."
  if npm install -g mongosh; then
    note_done "mongosh installed via npm"
  else
    echo "    Couldn't install mongosh; the app doesn't need it. Install later with: npm install -g mongosh"
  fi
fi

# ── 5. Dev TLS certs ──────────────────────────────────────────────────────────
echo "==> Checking dev TLS certs (certs/key.pem, certs/cert.pem)..."
if [ -f certs/key.pem ] && [ -f certs/cert.pem ]; then
  echo "    Certs already present."
  note_skipped "Dev TLS certs"
else
  echo "    Generating self-signed localhost cert..."
  mkdir -p certs
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout certs/key.pem -out certs/cert.pem \
    -days 365 -subj "/CN=localhost" >/dev/null 2>&1
  note_done "Dev TLS certs generated (certs/key.pem, certs/cert.pem)"
fi

# ── 6. server/.env ────────────────────────────────────────────────────────────
echo "==> Checking server/.env..."
if [ -f server/.env ]; then
  echo "    server/.env already present."
  note_skipped "server/.env"
else
  echo "    Creating server/.env from server/.env.example with a generated JWT secret..."
  cp server/.env.example server/.env
  JWT_SECRET=$(openssl rand -hex 32)
  # Portable in-place sed for both BSD (macOS) and GNU sed. Use a random suffix
  # for the required backup file so we never collide with (and delete) a file
  # the user already has, then clean up only the exact file we just created.
  sed_backup_suffix=".setup-sh-$$.bak"
  sed -i "${sed_backup_suffix}" "s#^JWT_SECRET=.*#JWT_SECRET=${JWT_SECRET}#" server/.env
  rm -f "server/.env${sed_backup_suffix}"
  note_done "server/.env created with a freshly generated JWT_SECRET"
fi

# ── 7. Seed sample users ──────────────────────────────────────────────────────
echo "==> Seeding sample users (alice@example.com, bob@example.com)..."
if start_mongo; then
  node server/seed.js
  note_done "Sample users seeded (alice@example.com / bob@example.com)"
else
  echo "ERROR: MongoDB did not start within 30s — skipping seed. Run 'npm run seed' manually once Mongo is up." >&2
fi
# Leave Mongo running either way — start:all will just detect it's already up.

# ── 8. Executable bits ────────────────────────────────────────────────────────
chmod +x scripts/start.sh scripts/stop.sh scripts/setup.sh

# ── 9. Summary ────────────────────────────────────────────────────────────────
echo
echo "==> Setup complete:"
for line in "${SUMMARY[@]}"; do
  echo "$line"
done
echo
echo "Next step:"
echo "  npm run start:all   # starts MongoDB + the API + the frontend"
