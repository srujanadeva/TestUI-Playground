# Shared by setup.sh, start.sh and stop.sh (macOS): minimum versions, where setup keeps its own
# tools (~/.test-playground, outside the project), and how MongoDB is found, started and stopped.
# Sourced, not executed. Command output goes to $TP_OUT (setup points it at its log).

# The minimums are the versions of the reference machine. Keep NODE_MIN in step with
# "engines" in package.json, which start.sh checks through check-deps.js.
NODE_MIN="26.3.1"
MONGO_MIN="8.0.32"
MONGOSH_MIN="2.12.0"

TP_HOME="$HOME/.test-playground"
TP_TOOLS="$TP_HOME/tools"            # setup's own Node, MongoDB and mongosh, one folder each
TP_DB="$TP_HOME/mongodb-data"        # data folder of a mongod that setup starts itself
TP_DB_CONF="$TP_HOME/mongod.conf"
TP_DB_LOG="$TP_HOME/mongod.log"
TP_OUT="${TP_OUT:-/dev/null}"

# TEST_PLAYGROUND_NO_BREW=1 (setup --no-brew) ignores Homebrew, e.g. when it is broken.
BREW="$([ -n "${TEST_PLAYGROUND_NO_BREW:-}" ] || command -v brew 2>/dev/null || { [ -x /opt/homebrew/bin/brew ] && echo /opt/homebrew/bin/brew; } || { [ -x /usr/local/bin/brew ] && echo /usr/local/bin/brew; })"

have() { command -v "$1" >/dev/null 2>&1; }

# version_ge A B: true when A >= B (dotted numbers, up to four parts)
version_ge() {
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -t. -k1,1n -k2,2n -k3,3n -k4,4n | head -n1)" = "$2" ]
}

node_version_of()    { [ -x "$1" ] && "$1" -p 'process.versions.node' 2>/dev/null; }
mongod_version_of()  { [ -x "$1" ] && "$1" --version 2>/dev/null | sed -n 's/^db version v//p' | head -n1; }
mongosh_version_of() { [ -x "$1" ] && "$1" --version 2>/dev/null | head -n1; }

# The real location of a file (symbolic links followed)
resolve() {
  local p="$1" l
  while [ -L "$p" ]; do
    l="$(readlink "$p")"
    case "$l" in /*) p="$l" ;; *) p="$(dirname "$p")/$l" ;; esac
  done
  (cd -P "$(dirname "$p")" 2>/dev/null && printf '%s/%s' "$(pwd)" "$(basename "$p")")
}

# Who owns a binary: "ours" (setup's copy), "brew:<formula>" or "other"
source_of() {
  local r; r="$(resolve "$1")"
  case "$r" in
    "$TP_TOOLS"/*) printf 'ours' ;;
    */Cellar/*) printf 'brew:%s' "$(printf '%s' "$r" | sed -E 's#.*/Cellar/([^/]+)/.*#\1#')" ;;
    *) printf 'other' ;;
  esac
}

# Puts setup's own copy of a tool first on PATH, but only when the one already on PATH is
# missing or older than the minimum, so a newer tool the user installed keeps winning.
# use_own_tool <command> <folder in TP_TOOLS> <version-fn> <minimum>
use_own_tool() {
  local current v
  [ -x "$TP_TOOLS/$2/bin/$1" ] || return 0
  current="$(command -v "$1" 2>/dev/null)"
  v="$($3 "$current")"
  if [ -z "$v" ] || ! version_ge "$v" "$4"; then
    export PATH="$TP_TOOLS/$2/bin:$PATH"
  fi
}

use_own_tools() {
  use_own_tool node node node_version_of "$NODE_MIN"
  use_own_tool mongod mongodb mongod_version_of "$MONGO_MIN"
  use_own_tool mongosh mongosh mongosh_version_of "$MONGOSH_MIN"
}

# ─── MongoDB ──────────────────────────────────────────────────────────────────

mongo_up() { nc -z 127.0.0.1 27017 2>/dev/null; }

# PID of the process listening on a TCP port, if this user can see it
port_pid() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null | head -n1; }

# The mongod to use: the first of PATH, any Homebrew MongoDB formula and setup's own copy
# that meets MONGO_MIN. Setup, start and stop all pick it the same way.
pick_mongod() {
  local c f
  for c in "$(command -v mongod 2>/dev/null)" \
           $( [ -n "$BREW" ] && for f in $("$BREW" list --formula -1 2>/dev/null | grep -E '^mongodb-community(@[0-9.]+)?$'); do
                printf '%s ' "$("$BREW" --prefix "$f" 2>/dev/null)/bin/mongod"; done ) \
           "$TP_TOOLS/mongodb/bin/mongod"; do
    [ -n "$c" ] && [ -x "$c" ] || continue
    if version_ge "$(mongod_version_of "$c")" "$MONGO_MIN"; then
      printf '%s' "$c"
      return 0
    fi
  done
  return 1
}

# Writes the config used when setup starts mongod itself (not through Homebrew)
write_mongo_conf() {
  mkdir -p "$TP_DB" || return 1
  cat >"$TP_DB_CONF" <<EOF
# Written by test-playground setup. MongoDB for this project, reachable only from this Mac.
storage:
  dbPath: "$TP_DB"
systemLog:
  destination: file
  path: "$TP_DB_LOG"
  logAppend: true
net:
  bindIp: 127.0.0.1
  port: 27017
EOF
}

# Starts MongoDB if it isn't running and waits up to 30 s for it. MONGO_LOGFILE is set to the
# log to read when it fails, and MONGO_HOW to how it was started.
start_mongo() {
  local bin src formula config i
  MONGO_LOGFILE="$TP_DB_LOG"
  MONGO_HOW=""
  mongo_up && { MONGO_HOW="already running"; return 0; }
  bin="$(pick_mongod)" || { MONGO_HOW="not installed"; return 1; }
  src="$(source_of "$bin")"

  if [ "${src%%:*}" = brew ]; then
    formula="${src#brew:}"
    MONGO_LOGFILE="$("$BREW" --prefix)/var/log/mongodb/mongo.log"
    if "$BREW" services start "$formula" >>"$TP_OUT" 2>&1; then
      MONGO_HOW="Homebrew service $formula"
    else
      # brew services fails when Homebrew has moved the formula past the installed version.
      config="$("$BREW" --prefix)/etc/mongod.conf"
      [ -f "$config" ] || { write_mongo_conf || return 1; config="$TP_DB_CONF"; MONGO_LOGFILE="$TP_DB_LOG"; }
      nohup "$bin" --config "$config" >>"$TP_OUT" 2>&1 &
      MONGO_HOW="$bin with $config"
    fi
  else
    write_mongo_conf || return 1
    # mongod's --fork isn't supported on macOS, so it is backgrounded here.
    nohup "$bin" --config "$TP_DB_CONF" >>"$TP_OUT" 2>&1 &
    MONGO_HOW="$bin with $TP_DB_CONF"
  fi

  for i in $(seq 1 30); do
    mongo_up && return 0
    sleep 1
  done
  return 1
}

# Sets MONGO_CAUSE and MONGO_FIX from the end of a mongod log, for a mongod that didn't start
explain_mongo_log() {
  local t
  t="$(tail -n 300 "$1" 2>/dev/null)"
  MONGO_FIX="Read the end of the MongoDB log::tail -n 40 \"$1\""
  if printf '%s' "$t" | grep -qE 'Address already in use'; then
    MONGO_CAUSE="Another program took port 27017 while MongoDB was starting."
    MONGO_FIX="Find and quit it::lsof -nP -iTCP:27017 -sTCP:LISTEN"
  elif printf '%s' "$t" | grep -qE 'Unable to lock the lock file|Another mongod instance is already running'; then
    MONGO_CAUSE="Another MongoDB is already using the data folder."
    MONGO_FIX="Stop the other MongoDB (Activity Monitor → mongod → Quit)."
  elif printf '%s' "$t" | grep -qE 'featureCompatibilityVersion|UPGRADE PROBLEM|Wrong mongod version|unsupported WiredTiger file version'; then
    MONGO_CAUSE="The data folder was created by a different MongoDB version, which this one cannot open."
    MONGO_FIX="Start the MongoDB that created it, or, if its data isn't needed, move the data folder aside and run setup again."
  elif printf '%s' "$t" | grep -qE 'No space left on device'; then
    MONGO_CAUSE="The disk is full."
    MONGO_FIX="Free at least 2 GB of disk space."
  elif printf '%s' "$t" | grep -qE 'Permission denied|Operation not permitted'; then
    MONGO_CAUSE="MongoDB may not write to its data or log folder, usually because it was once started with sudo."
    MONGO_FIX="Make the folders yours again::sudo chown -R \"$USER\" \"$TP_HOME\" \"$("$BREW" --prefix 2>/dev/null)/var/mongodb\""
  else
    MONGO_CAUSE="MongoDB did not start within 30 seconds; its log says why."
  fi
}

# Stops MongoDB whichever way it was started. Only signals an actual mongod process.
stop_mongo() {
  local bin src pid i
  bin="$(pick_mongod)"
  src="$(source_of "${bin:-/nonexistent}")"
  if [ "${src%%:*}" = brew ]; then
    "$BREW" services stop "${src#brew:}" >>"$TP_OUT" 2>&1 || true
  fi
  mongo_up || return 0
  pid="$(port_pid 27017)"
  if [ -n "$pid" ] && ps -p "$pid" -o comm= | grep -q mongod; then
    # SIGTERM is mongod's clean-shutdown signal.
    kill "$pid" 2>/dev/null || true
  fi
  for i in $(seq 1 15); do
    mongo_up || return 0
    sleep 1
  done
  return 1
}
