#!/usr/bin/env bash
# One-time bootstrap (macOS). Every step checks the machine first: whatever already
# exists is used as is, and only missing pieces are created or installed. Nothing
# existing is replaced. Safe to re-run.
set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
source "$PROJECT_DIR/scripts/mongo.sh"

NODE_MIN_MAJOR=18
# Installed only when the machine has no MongoDB at all.
MONGO_INSTALL_FORMULA="mongodb-community@8.0"

SUMMARY=()
FAILED=0
note_done()    { SUMMARY+=("  ✔ $1"); }
note_skipped() { SUMMARY+=("  · $1 (already present)"); }
note_failed()  { SUMMARY+=("  ✘ $1"); FAILED=1; }

have() { command -v "$1" >/dev/null 2>&1; }
node_ok() { have node && [ "$(node -v | sed -E 's/^v([0-9]+).*/\1/')" -ge "$NODE_MIN_MAJOR" ]; }

echo "==> Setting up $PROJECT_DIR"

# ── 1. Node.js ────────────────────────────────────────────────────────────────
echo
echo "==> Node.js (need ${NODE_MIN_MAJOR}+)"
if node_ok; then
  echo "    Found Node $(node -v)."
  note_skipped "Node.js $(node -v)"
elif ! have brew; then
  echo "    Node ${NODE_MIN_MAJOR}+ is missing, and Homebrew isn't installed to install it."
  echo "    Install Node from https://nodejs.org (or Homebrew from https://brew.sh), then re-run."
  note_failed "Node.js missing (no Homebrew to install it)"
else
  echo "    Node ${NODE_MIN_MAJOR}+ missing — installing via Homebrew..."
  if brew install node && node_ok; then
    note_done "Node.js $(node -v) installed via Homebrew"
  else
    note_failed "Node.js install failed (see output above)"
  fi
fi

# ── 2. npm dependencies ───────────────────────────────────────────────────────
echo
echo "==> npm dependencies"
if ! node_ok; then
  echo "    Skipped: needs Node."
  note_failed "npm dependencies not installed (needs Node)"
elif npm install; then
  note_done "npm dependencies installed"
else
  note_failed "npm install failed (see output above)"
fi

# ── 3. Dev TLS certs ──────────────────────────────────────────────────────────
echo
echo "==> Dev TLS certs (certs/cert.pem, certs/key.pem)"
if [ -f certs/cert.pem ] && [ -f certs/key.pem ]; then
  echo "    Both present."
  note_skipped "Dev TLS certs"
else
  echo "    Missing — generating a self-signed localhost certificate..."
  mkdir -p certs
  if cert_output=$(openssl req -x509 -newkey rsa:2048 -nodes \
        -keyout certs/key.pem -out certs/cert.pem \
        -days 365 -subj "/CN=localhost" 2>&1) \
     && [ -f certs/cert.pem ] && [ -f certs/key.pem ]; then
    note_done "Dev TLS certs created (certs/cert.pem, certs/key.pem)"
  else
    printf '%s\n' "$cert_output" | sed 's/^/    /'
    note_failed "Dev TLS certs couldn't be created (openssl output above)"
  fi
fi

# ── 4. server/.env ────────────────────────────────────────────────────────────
echo
echo "==> server/.env"
if [ -f server/.env ]; then
  echo "    Present."
  note_skipped "server/.env"
else
  echo "    Missing — creating it from server/.env.example with a generated JWT secret..."
  if jwt_secret=$(openssl rand -hex 32) && cp server/.env.example server/.env; then
    # BSD and GNU sed both accept an attached backup suffix; use a unique one so we
    # never touch a file the user already has, then remove only the one we made.
    sed_backup_suffix=".setup-sh-$$.bak"
    sed -i "${sed_backup_suffix}" "s#^JWT_SECRET=.*#JWT_SECRET=${jwt_secret}#" server/.env
    rm -f "server/.env${sed_backup_suffix}"
    note_done "server/.env created with a generated JWT_SECRET"
  else
    note_failed "server/.env couldn't be created"
  fi
fi

# ── 5. MongoDB installed ──────────────────────────────────────────────────────
echo
echo "==> MongoDB"
mongo_bin=$(mongod_bin)
if [ -n "$mongo_bin" ]; then
  mongo_version=$("$mongo_bin" --version 2>/dev/null | head -1 | sed 's/^db version //')
  echo "    Found MongoDB ${mongo_version} ($mongo_bin) — using it."
  note_skipped "MongoDB ${mongo_version}"
elif ! have brew; then
  echo "    MongoDB isn't installed, and Homebrew isn't installed to install it."
  echo "    Install Homebrew from https://brew.sh (or MongoDB yourself), then re-run."
  note_failed "MongoDB missing (no Homebrew to install it)"
else
  echo "    MongoDB isn't installed — installing ${MONGO_INSTALL_FORMULA} via Homebrew..."
  brew tap mongodb/brew
  # Newer Homebrew refuses third-party taps until they're trusted; older versions
  # have no `trust` command, so ignore errors.
  brew trust mongodb/brew >/dev/null 2>&1 || true
  # --without-mongosh: Homebrew has no prebuilt mongosh on some Macs and would
  # compile it (plus Node) from source. mongosh comes from npm below instead.
  if brew install "mongodb/brew/${MONGO_INSTALL_FORMULA}" --without-mongosh && [ -n "$(mongod_bin)" ]; then
    note_done "MongoDB installed (${MONGO_INSTALL_FORMULA})"
  else
    note_failed "MongoDB install failed (see output above)"
  fi
fi

if ! have mongosh && node_ok; then
  echo "    mongosh (optional shell) not found — installing via npm..."
  if npm install -g mongosh; then
    note_done "mongosh installed via npm"
  else
    echo "    Couldn't install mongosh; the app doesn't need it. Install later with: npm install -g mongosh"
  fi
fi

# ── 6. MongoDB running ────────────────────────────────────────────────────────
echo
echo "==> MongoDB running on 127.0.0.1:27017"
if mongo_up; then
  echo "    Already running."
  note_skipped "MongoDB running"
elif [ -z "$(mongod_bin)" ]; then
  echo "    Skipped: MongoDB isn't installed."
  note_failed "MongoDB not running (not installed)"
elif start_mongo; then
  note_done "MongoDB started"
else
  note_failed "MongoDB couldn't be started (see messages above)"
fi

# ── 7. Sample users ───────────────────────────────────────────────────────────
echo
echo "==> Sample users (alice@example.com, bob@example.com)"
if ! mongo_up; then
  echo "    Skipped: MongoDB isn't running."
  note_failed "Sample users not seeded (MongoDB isn't running)"
elif ! node_ok || [ ! -d node_modules ]; then
  echo "    Skipped: needs Node and npm dependencies."
  note_failed "Sample users not seeded (needs Node and npm dependencies)"
elif node server/seed.js; then
  note_done "Sample users ready (existing ones are left as is)"
else
  note_failed "Seeding failed (see output above)"
fi
# MongoDB is left running; start:all just detects that it's already up.

chmod +x scripts/start.sh scripts/stop.sh scripts/setup.sh

# ── Summary ───────────────────────────────────────────────────────────────────
echo
echo "==> Summary"
for line in "${SUMMARY[@]}"; do
  echo "$line"
done
echo
if [ "$FAILED" -ne 0 ]; then
  echo "Some steps failed (✘ above). Fix them and re-run: npm run setup"
  exit 1
fi
echo "All set. Next step:"
echo "  npm run start:all   # starts MongoDB + the API + the frontend"
