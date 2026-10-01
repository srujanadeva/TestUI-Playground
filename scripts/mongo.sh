# Shared MongoDB helpers for setup.sh, start.sh and stop.sh (macOS).
# Sourced, not executed. They work with whichever MongoDB the machine has.

mongo_up() {
  nc -z 127.0.0.1 27017 2>/dev/null
}

# Prints the Homebrew formula MongoDB comes from (e.g. mongodb-community or
# mongodb-community@8.0), or nothing if it isn't a Homebrew install.
mongo_formula() {
  local bin target formula
  bin=$(command -v mongod 2>/dev/null || true)
  if [ -n "$bin" ]; then
    # The linked mongod points into the Cellar folder of the formula that owns it.
    target=$(readlink "$bin" 2>/dev/null || true)
    formula=$(printf '%s' "$target" | sed -nE 's#.*/Cellar/([^/]+)/.*#\1#p')
    if [ -n "$formula" ]; then
      echo "$formula"
      return
    fi
  fi
  command -v brew >/dev/null 2>&1 || return 0
  brew list --formula -1 2>/dev/null | grep -E '^mongodb-community(@[0-9.]+)?$' | head -1
}

# Path to the mongod binary to run, or nothing if MongoDB isn't installed.
mongod_bin() {
  local formula
  if command -v mongod >/dev/null 2>&1; then
    command -v mongod
    return
  fi
  formula=$(mongo_formula)
  if [ -n "$formula" ] && [ -x "$(brew --prefix "$formula")/bin/mongod" ]; then
    echo "$(brew --prefix "$formula")/bin/mongod"
  fi
}

# Starts MongoDB if needed and waits up to 30s for it to accept connections.
# Returns non-zero (after printing why) if it never comes up.
start_mongo() {
  if mongo_up; then
    echo "    MongoDB already running."
    return 0
  fi

  local formula started=0
  formula=$(mongo_formula)
  if [ -n "$formula" ]; then
    echo "    Starting $formula via brew services..."
    if brew services start "$formula"; then
      started=1
    fi
  fi

  if [ "$started" -eq 0 ]; then
    # brew services fails when Homebrew has updated the formula past the installed
    # version, and doesn't apply to non-Homebrew installs. Run mongod directly.
    local bin config
    bin=$(mongod_bin)
    config="$(brew --prefix 2>/dev/null)/etc/mongod.conf"
    if [ -z "$bin" ]; then
      echo "    MongoDB isn't installed."
      return 1
    fi
    if [ ! -f "$config" ]; then
      echo "    Couldn't start MongoDB automatically: no config file at $config."
      echo "    Start it the way you normally do, then re-run this command."
      return 1
    fi
    # mongod's --fork isn't supported on macOS, so background it ourselves; it logs
    # to the file set in mongod.conf.
    echo "    Starting mongod directly with $config..."
    nohup "$bin" --config "$config" >/dev/null 2>&1 &
  fi

  echo -n "    Waiting for MongoDB to accept connections"
  for _ in $(seq 1 30); do
    if mongo_up; then
      echo " done."
      return 0
    fi
    echo -n "."
    sleep 1
  done
  echo
  echo "    MongoDB didn't start within 30s. Check its log: $(brew --prefix 2>/dev/null)/var/log/mongodb/mongo.log"
  return 1
}

stop_mongo() {
  local formula
  formula=$(mongo_formula)
  if [ -n "$formula" ]; then
    brew services stop "$formula" 2>&1 | sed 's/^/    /' || true
  fi
  if mongo_up; then
    # Started outside brew services: SIGTERM is mongod's clean-shutdown signal.
    # Only signal an actual mongod process, never whatever else might hold the port.
    local pid
    for pid in $(lsof -ti tcp:27017 -sTCP:LISTEN 2>/dev/null); do
      if ps -p "$pid" -o comm= | grep -q mongod; then
        echo "    Shutting down mongod (PID $pid)..."
        kill "$pid" 2>/dev/null || true
      fi
    done
    for _ in $(seq 1 10); do
      mongo_up || break
      sleep 1
    done
  fi
}
