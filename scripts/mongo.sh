# Shared MongoDB helpers for setup.sh, start.sh and stop.sh (macOS / Homebrew).
# Sourced, not executed.

# The only place the macOS MongoDB version is set. The versioned formula stays on
# the 8.0 LTS line (patch updates only). Windows pins the same line in setup.ps1.
MONGO_FORMULA="mongodb-community@8.0"

mongo_up() {
  nc -z 127.0.0.1 27017 2>/dev/null
}

# Starts MongoDB if needed and waits up to 30s for it to accept connections.
# Returns non-zero if it never comes up.
start_mongo() {
  if mongo_up; then
    echo "    Mongo already running."
    return 0
  fi

  echo "    Mongo not running — starting $MONGO_FORMULA via brew services..."
  if ! brew services start "$MONGO_FORMULA"; then
    # brew services breaks when Homebrew updates the formula past the installed
    # version: it looks for the service file in a keg that isn't installed.
    # mongod's --fork isn't supported on macOS, so background it ourselves; it logs
    # to the file set in mongod.conf.
    echo "    brew services failed — starting mongod directly from its config file..."
    nohup "$(brew --prefix "$MONGO_FORMULA")/bin/mongod" --config "$(brew --prefix)/etc/mongod.conf" >/dev/null 2>&1 &
  fi

  echo -n "    Waiting for Mongo to accept connections"
  for _ in $(seq 1 30); do
    if mongo_up; then
      echo " done."
      return 0
    fi
    echo -n "."
    sleep 1
  done
  echo
  return 1
}

stop_mongo() {
  brew services stop "$MONGO_FORMULA" 2>&1 | sed 's/^/    /' || true
  if mongo_up; then
    # Started directly by start_mongo's fallback, so brew services doesn't manage it.
    # SIGTERM is mongod's clean-shutdown signal.
    echo "    Shutting down mongod directly..."
    lsof -ti tcp:27017 -sTCP:LISTEN | xargs kill 2>/dev/null || true
    for _ in $(seq 1 10); do
      mongo_up || break
      sleep 1
    done
  fi
}
