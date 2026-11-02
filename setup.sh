#!/usr/bin/env bash
#
# Test Playground: one-click setup for macOS. On Windows, double-click setup.cmd instead.
#
# For every tool: not installed → installed; the minimum version or newer → kept; older → updated.
# Installs and updates use Homebrew when it is installed and has a prebuilt copy for this Mac;
# otherwise the official archive is downloaded (checksum-verified) into ~/.test-playground/tools.
# An older copy owned by another installer is left as it is: the new one is installed next to
# it and made the default through a marked block in ~/.zshrc (or ~/.bash_profile).
#
# Minimum versions: Node.js 26.3.1 · MongoDB 8.0.32 · mongosh 2.12.0 (optional)
# Then: npm packages, the HTTPS certificate, server/.env, MongoDB running, sample users,
# and finally the app itself (npm run start:all). Nothing needs administrator rights.
#
# On a company network that inspects HTTPS traffic, pass the company root certificate:
#   bash setup.sh --ca-cert ~/Downloads/company-root.cer
#
# Usage: bash setup.sh [--no-start] [--no-brew] [--ca-cert <file>]        (or: npm run setup)
# Full log: logs/setup.log

# Re-run under bash when started with sh or zsh
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi

set -o pipefail

NODE_PIN="26.3.1"
MONGO_PIN="8.0.32"
MONGOSH_PIN="2.12.0"
# mongosh publishes no checksum files, so these were taken from the official downloads.
MONGOSH_SHA_arm64="1b385d3dd6e29624e94616e6d1015bc8e17eb337a187cc6db8a8a8a1d60763fe"
MONGOSH_SHA_x64="7515f20dd08e900572d67610f22509fe0dc2f004a52f7f3d0c2d5e0166955b07"
MIN_FREE_GB=2
TOTAL_STEPS=11

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
LOG="$LOG_DIR/setup.log"
LOG_REL="logs/setup.log"
PROFILE_BEGIN="# >>> test-playground setup >>>"
PROFILE_END="# <<< test-playground setup <<<"

START_APP=1
CA_CERT="${TEST_PLAYGROUND_CA_CERT:-}"
while [ $# -gt 0 ]; do
    case "$1" in
        --no-start) START_APP=""; shift ;;
        --no-brew) export TEST_PLAYGROUND_NO_BREW=1; shift ;;
        --ca-cert) CA_CERT="${2:-}"; shift 2 ;;
        --ca-cert=*) CA_CERT="${1#*=}"; shift ;;
        -h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *) printf 'Unknown option: %s\nUsage: bash setup.sh [--no-start] [--no-brew] [--ca-cert <file>]\n' "$1" >&2; exit 64 ;;
    esac
done

# ─── Output ───────────────────────────────────────────────────────────────────

if [ -t 1 ]; then
    C_BLUE=$'\033[1;34m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RED=$'\033[1;31m'
    C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'; C_CMD=$'\033[36m'; C_OFF=$'\033[0m'
    WIDTH="$(tput cols 2>/dev/null || echo 80)"
else
    C_BLUE=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_BOLD=""; C_DIM=""; C_CMD=""; C_OFF=""
    WIDTH=100
fi
[ "$WIDTH" -lt 60 ] 2>/dev/null && WIDTH=60
[ "$WIDTH" -gt 100 ] 2>/dev/null && WIDTH=100

STEP_NO=0
STEP_NAME=""
ATTENTION=""     # one per line: "title|fix"  (fix may hold "text::command")
SUMMARY=""       # one per line: "status|component|version|result"

log() { printf '%s %s\n' "$(date '+%H:%M:%S')" "$*" >>"$LOG"; }

# para <first-line prefix> <indent of the other lines> <text>: word-wrapped to the window
para() {
    local prefix="$1" hang="$2" first=1 line
    printf '%s\n' "$3" | fold -s -w $((WIDTH - ${#hang})) | while IFS= read -r line; do
        if [ $first = 1 ]; then printf '%s%s\n' "$prefix" "${line% }"; first=0
        else printf '%s%s\n' "$hang" "${line% }"; fi
    done
}

step() {
    STEP_NO=$((STEP_NO + 1)); STEP_NAME="$1"
    printf '\n%s[%d/%d] %s%s\n' "$C_BLUE" "$STEP_NO" "$TOTAL_STEPS" "$1" "$C_OFF"
    log "=== [$STEP_NO/$TOTAL_STEPS] $1 ==="
}
skipped()   { para "  ${C_GREEN}✓${C_OFF} " "    " "$*"; log "skip: $*"; }
installed() { para "  ${C_GREEN}+${C_OFF} " "    " "$*"; log "installed: $*"; }
updated()   { para "  ${C_GREEN}↑${C_OFF} " "    " "$*"; log "updated: $*"; }
ok()        { para "  ${C_GREEN}✓${C_OFF} " "    " "$*"; log "ok: $*"; }
info()      { para "  • " "    " "$*"; log "info: $*"; }
warn()      { para "  ${C_YELLOW}!${C_OFF} " "    " "$*"; log "warn: $*"; }
summary()   { SUMMARY="$SUMMARY$1|$2|$3|$4"$'\n'; }
attention() { ATTENTION="$ATTENTION$1|$2"$'\n'; warn "$1"; }

# print_fix <prefix> <indent> <fix>: the text wrapped, then the command (after "::") on its own line
print_fix() {
    local prefix="$1" hang="$2" fix="$3" cmd=""
    case "$fix" in *::*) cmd="${fix#*::}" ;; esac
    para "$prefix" "$hang" "${fix%%::*}"
    LAST_FIX_HAD_COMMAND=""
    if [ -n "$cmd" ]; then
        printf '\n%s  %s%s%s\n\n' "$hang" "$C_CMD" "$cmd" "$C_OFF"
        LAST_FIX_HAD_COMMAND=1
    fi
}

SOFT_FAIL=""     # set while an optional step runs: fail_step then only warns
TAIL_LINES=0     # set before fail_step to show the last lines of the log under "Details"

# fail_step <problem> <cause> <fix> [fix …]: prints the guide and stops. A fix "text::command"
# shows the command on its own line.
fail_step() {
    local problem="$1" cause="$2" n=1 label fix
    shift 2
    if [ -n "$SOFT_FAIL" ]; then
        # An optional step: report it and let setup carry on (this runs in a subshell).
        para "  ${C_YELLOW}!${C_OFF} " "    " "$problem $cause"
        log "optional step failed: $problem | $cause"
        exit 1
    fi
    printf '\n%s✗ Step %d of %d failed: %s%s\n\n' "$C_RED" "$STEP_NO" "$TOTAL_STEPS" "$STEP_NAME" "$C_OFF"
    para "  ${C_BOLD}Problem${C_OFF}  " "           " "$problem"; printf '\n'
    para "  ${C_BOLD}Cause${C_OFF}    " "           " "$cause"; printf '\n'
    if [ "$TAIL_LINES" -gt 0 ]; then
        printf '  %sDetails%s  last lines of %s:\n' "$C_BOLD" "$C_OFF" "$LOG_REL"
        tail -n "$TAIL_LINES" "$LOG" | cut -c1-$((WIDTH - 13)) | sed "s/^/           ${C_DIM}│ /; s/\$/${C_OFF}/"
        printf '\n'
    fi
    for fix in "$@"; do
        [ -z "$fix" ] && continue
        if [ $n = 1 ]; then label="  ${C_BOLD}Fix${C_OFF}      "; else label="           "; fi
        print_fix "$label$n. " "              " "$fix"
        n=$((n + 1))
    done
    [ $n -gt 1 ] && [ -z "$LAST_FIX_HAD_COMMAND" ] && printf '\n'
    para "  ${C_BOLD}Then${C_OFF}     " "           " "Run setup again (bash setup.sh). Finished steps are skipped."
    printf '\n  %sLog%s      %s\n\n' "$C_BOLD" "$C_OFF" "$LOG_REL"
    log "FAILED: $problem | $cause"
    exit 1
}

INTERRUPT_MSG='printf "\n\n%sSetup was interrupted.%s Run bash setup.sh again to continue; finished steps are skipped.\n" "$C_YELLOW" "$C_OFF"; exit 130'
trap "$INTERRUPT_MSG" INT TERM

run_logged() { log "\$ $*"; "$@" >>"$LOG" 2>&1; }

# ─── Start-up checks that need no tools ───────────────────────────────────────

mkdir -p "$LOG_DIR" 2>/dev/null
if ! : >>"$LOG" 2>/dev/null; then
    printf '\n✗ Setup cannot write to the project folder.\n\n'
    para "  Cause    " "           " "$PROJECT_DIR is read-only or belongs to another user, usually because it was cloned or set up with sudo."
    printf '\n'
    para "  Fix      " "           " "Make it yours, then run setup again:"
    printf '\n                sudo chown -R %s "%s"\n\n' "$USER" "$PROJECT_DIR"
    exit 1
fi
printf '\n===== setup.sh started %s =====\n' "$(date)" >>"$LOG"

TP_OUT="$LOG"
# shellcheck source=scripts/lib.sh
if ! . "$PROJECT_DIR/scripts/lib.sh" 2>>"$LOG"; then
    printf '\n✗ Setup cannot start: scripts/lib.sh is missing.\n\n'
    para "  Fix      " "           " "setup.sh was copied on its own, or the download is incomplete. Clone the whole repository and run bash setup.sh from its folder."
    printf '\n'
    exit 1
fi
TP_WORK="$TP_HOME/downloads"
cd "$PROJECT_DIR" || exit 1

# ─── Network ──────────────────────────────────────────────────────────────────

CURL_CA=""
PROXY_SHOWN=""
PROXY_FIX="On a company network, ask IT for the proxy address and set it, then run setup again from the same window::export HTTPS_PROXY=http://<proxy-host>:<port>"
CA_FIX="Get the company root certificate from IT, or export it: Keychain Access → System → select the company certificate → File → Export Items → .cer. Then run setup with it::bash setup.sh --ca-cert <path-to-certificate>"

# Sets NET_CAUSE, NET_FIX1, NET_FIX2 for a curl exit code and HTTP status
explain_net() {
    local rc="$1" http="$2" host="$3"
    NET_FIX2="Check that the site opens in a browser: https://$host"
    case "$rc" in
        5)  NET_CAUSE="The proxy server ($PROXY_SHOWN) could not be found."
            NET_FIX1="Check the proxy address with IT and set it again::export HTTPS_PROXY=http://<proxy-host>:<port>" ;;
        6)  NET_CAUSE="The address $host could not be found. Either there is no internet connection, a VPN is not connected, or the company network requires a proxy."
            NET_FIX1="Connect to the internet or the VPN."
            NET_FIX2="$PROXY_FIX" ;;
        7|28|52|55|56)
            NET_CAUSE="The connection to $host was refused or timed out. This is usually a firewall, or a proxy that is not set."
            NET_FIX1="$PROXY_FIX" ;;
        35|51|58|59|60|77|83|90|91)
            NET_CAUSE="The secure (HTTPS) connection to $host is not trusted. Company networks that inspect HTTPS traffic replace the site's certificate with their own."
            NET_FIX1="$CA_FIX" ;;
        18|23)
            NET_CAUSE="The download stopped before it finished (an unstable connection or a full disk)."
            NET_FIX1="Check the internet connection and that at least $MIN_FREE_GB GB of disk space is free." ;;
        22)
            case "$http" in
                407) NET_CAUSE="The proxy ($PROXY_SHOWN) needs a user name and password."
                     NET_FIX1="Put them in the proxy address::export HTTPS_PROXY=http://<user>:<password>@<proxy-host>:<port>" ;;
                403) NET_CAUSE="$host refused the download (HTTP 403). A company web filter usually causes this."
                     NET_FIX1="Ask IT to allow https://$host." ;;
                404) NET_CAUSE="The file is not on $host (HTTP 404): the download address in setup.sh is out of date."
                     NET_FIX1="Get the latest version of the repository::git pull" ;;
                *)   NET_CAUSE="$host answered with an error (HTTP $http). This is usually a short problem on their side."
                     NET_FIX1="Wait a few minutes." ;;
            esac ;;
        *)  NET_CAUSE="The download from $host failed (curl error $rc)."
            NET_FIX1="Check the internet connection." ;;
    esac
}

curl_get() {   # curl_get <url> <out-file>; on failure NET_RC / NET_HTTP are set
    local http
    log "download $1"
    # shellcheck disable=SC2086
    http="$(curl --fail --location --silent --show-error --connect-timeout 20 --retry 3 --retry-delay 3 \
        $CURL_CA -w '%{http_code}' -o "$2" "$1" 2>>"$LOG")"
    NET_RC=$?
    NET_HTTP="$http"
    return $NET_RC
}

host_of() { printf '%s' "$1" | sed -E 's#^[a-z]+://([^/:]+).*#\1#'; }

# download <url> <dest> <expected sha256> <what>: a verified download, or fail_step
download() {
    local url="$1" dest="$2" expected="$3" what="$4" actual
    rm -f "$dest.part"
    if ! curl_get "$url" "$dest.part"; then
        rm -f "$dest.part"
        explain_net "$NET_RC" "$NET_HTTP" "$(host_of "$url")"
        fail_step "$what could not be downloaded." "$NET_CAUSE" "$NET_FIX1" "$NET_FIX2"
    fi
    actual="$(shasum -a 256 "$dest.part" | awk '{print $1}')"
    if [ -z "$expected" ] || [ "$actual" != "$expected" ]; then
        rm -f "$dest.part"
        log "checksum mismatch: expected ${expected:-(none)} got $actual"
        fail_step "The downloaded $what is damaged: its checksum does not match." \
            "The download was cut off, or a company proxy changed the file." \
            "Run setup again." "If it happens again, try another network, or ask IT whether downloads from $(host_of "$url") are changed by the proxy."
    fi
    mv -f "$dest.part" "$dest"
}

# fetch_text <variable> <url>: the body into the variable, empty on failure. Not used as $(…):
# a subshell would lose NET_RC / NET_HTTP, which explain_net needs.
fetch_text() {
    local tmp="$TP_WORK/fetch.tmp" body=""
    if curl_get "$2" "$tmp"; then body="$(cat "$tmp")"; fi
    rm -f "$tmp"
    printf -v "$1" '%s' "$body"
}

# unpack <archive> <target folder> <what>: replaces the target with the archive's single top folder
unpack() {
    local stage="$TP_WORK/stage" top
    rm -rf "$stage" && mkdir -p "$stage" "$(dirname "$2")"
    case "$1" in
        *.zip) ditto -x -k "$1" "$stage" 2>>"$LOG" ;;
        *)     tar -xzf "$1" -C "$stage" 2>>"$LOG" ;;
    esac || fail_step "$3 could not be unpacked." "The disk is full, or the download is damaged." \
        "Free at least $MIN_FREE_GB GB of disk space, then run setup again."
    top="$(find "$stage" -mindepth 1 -maxdepth 1 -type d | head -n1)"
    rm -rf "$2"
    mv "$top" "$2"
    rm -rf "$stage" "$1"
}

# ─── Homebrew ─────────────────────────────────────────────────────────────────

# True when Homebrew can install or update a formula without administrator rights and without
# compiling: its folder is writable, and the formula and everything it needs come prebuilt
# for this macOS. Without a prebuilt copy Homebrew compiles from source, which takes hours.
brew_ready() {
    [ -n "$BREW" ] || return 1
    [ -w "$("$BREW" --prefix)/Cellar" ] || { log "Homebrew folder is not writable by $USER"; return 1; }
    case "$1" in mongodb/*|mongodb-community*) return 0 ;; esac   # the MongoDB tap downloads MongoDB's own build
    # Homebrew passes only HOMEBREW_* variables through to `brew ruby`.
    HOMEBREW_TP_FORMULA="$1" "$BREW" ruby -e '
        tag = Utils::Bottles.tag
        f = Formula[ENV["HOMEBREW_TP_FORMULA"]]
        all = [f] + f.recursive_dependencies.reject(&:build?).map(&:to_formula)
        missing = all.reject { |x| x.latest_version_installed? || x.bottle_specification.tag?(tag) }
        puts "no prebuilt copy for #{tag}: #{missing.map(&:name).join(", ")}" unless missing.empty?
        exit(missing.empty? ? 0 : 1)' >>"$LOG" 2>&1
}

brew_run() {   # brew_run install|upgrade <formula> [args]: quiet, logged
    local action="$1" formula="$2"; shift 2
    if [ "$action" = install ]; then info "Installing $formula with Homebrew (this can take a few minutes)"
    else info "Updating $formula with Homebrew (this can take a few minutes)"; fi
    HOMEBREW_NO_INSTALL_CLEANUP=1 HOMEBREW_NO_ENV_HINTS=1 run_logged "$BREW" "$action" --quiet "$formula" "$@"
}

# ─── Generic tool check ───────────────────────────────────────────────────────

# ensure_tool <label> <command> <minimum> <version-fn> <own folder> <archive-install-fn>
#             <brew formula for a new install, or ""> [guard-fn]
# Not installed → Homebrew when ready, else the archive. Minimum or newer → kept.
# Older → Homebrew upgrade when Homebrew owns it (and guard-fn allows it), else the archive is
# installed next to it. Sets TOOL_BIN, TOOL_VERSION, TOOL_RESULT, TOOL_OWN (1 = setup's copy).
ensure_tool() {
    local label="$1" cmd="$2" min="$3" vfn="$4" folder="$5" ifn="$6" formula="$7" guard="${8:-}"
    local own="$TP_TOOLS/$folder/bin/$cmd" c v old="" oldbin="" src short
    TOOL_OWN=""
    for c in "$(command -v "$cmd" 2>/dev/null)" "$own"; do
        [ -n "$c" ] && [ -x "$c" ] || continue
        v="$($vfn "$c")"
        [ -n "$v" ] || continue
        if version_ge "$v" "$min"; then
            TOOL_BIN="$c"; TOOL_VERSION="$v"; TOOL_RESULT="already installed"
            [ "$c" = "$own" ] && TOOL_OWN=1
            if [ "$v" = "$min" ]; then skipped "$label $v is already installed ($c). Nothing to do."
            else skipped "$label $v is already installed ($c). It is newer than $min, so it is kept."; fi
            return 0
        fi
        if [ -z "$old" ]; then old="$v"; oldbin="$c"; fi
    done

    if [ -n "$old" ]; then
        info "$label $old ($oldbin) is older than $min. Updating it."
        src="$(source_of "$oldbin")"
        if [ "${src%%:*}" = brew ] && { [ -z "$guard" ] || $guard "$old"; } && brew_ready "${src#brew:}"; then
            if brew_run upgrade "${src#brew:}"; then
                hash -r
                v="$($vfn "$oldbin")"
                if [ -n "$v" ] && version_ge "$v" "$min"; then
                    TOOL_BIN="$oldbin"; TOOL_VERSION="$v"; TOOL_RESULT="updated from $old"
                    updated "Updated $label $old → $v with Homebrew."
                    return 0
                fi
            fi
            info "Homebrew could not update it, so $label is downloaded instead."
        fi
        $ifn
        TOOL_BIN="$own"; TOOL_VERSION="$($vfn "$own")"; TOOL_RESULT="updated from $old"; TOOL_OWN=1
        if [ "$src" = ours ]; then
            updated "Updated $label $old → $TOOL_VERSION."
        else
            updated "Installed $label $TOOL_VERSION in $TP_TOOLS/$folder and made it the default. The old version ($oldbin) belongs to another installer and is left as it is."
        fi
        return 0
    fi

    if [ -n "$formula" ] && brew_ready "$formula"; then
        if brew_run install "$formula" "${BREW_ARGS[@]}"; then
            hash -r
            short="${formula##*/}"
            c="$("$BREW" --prefix "$short" 2>/dev/null)/bin/$cmd"
            v="$($vfn "$c")"
            if [ -n "$v" ] && version_ge "$v" "$min"; then
                TOOL_BIN="$c"; TOOL_VERSION="$v"; TOOL_RESULT="installed with Homebrew"
                installed "Installed $label $v with Homebrew."
                return 0
            fi
        fi
        info "Homebrew could not install $label $min or later, so it is downloaded instead."
    elif [ -n "$formula" ] && [ -n "$BREW" ]; then
        info "Homebrew has no prebuilt $label for this Mac and would compile it for hours, so the official download is used instead."
    fi
    $ifn
    TOOL_BIN="$own"; TOOL_VERSION="$($vfn "$own")"; TOOL_RESULT="installed"; TOOL_OWN=1
    installed "Installed $label $TOOL_VERSION in $TP_TOOLS/$folder."
}

PATH_ADD=""
path_add() {
    case ":$PATH_ADD:" in *":$1:"*) ;; *) PATH_ADD="${PATH_ADD:+$PATH_ADD:}$1" ;; esac
    export PATH="$1:$PATH"
}

# ─── Archive installs ─────────────────────────────────────────────────────────

install_node() {
    local base sums file sha
    base="https://nodejs.org/dist/v$NODE_PIN"
    fetch_text sums "$base/SHASUMS256.txt"
    if [ -z "$sums" ]; then
        explain_net "$NET_RC" "$NET_HTTP" "nodejs.org"
        fail_step "The Node.js download list could not be downloaded." "$NET_CAUSE" "$NET_FIX1" "$NET_FIX2"
    fi
    file="node-v$NODE_PIN-darwin-$NODE_ARCH.tar.gz"
    sha="$(printf '%s\n' "$sums" | awk -v f="$file" '$2 == f {print $1; exit}')"
    info "Downloading Node.js $NODE_PIN (about 50 MB)"
    download "$base/$file" "$TP_WORK/node.tar.gz" "$sha" "Node.js $NODE_PIN"
    unpack "$TP_WORK/node.tar.gz" "$TP_TOOLS/node" "Node.js"
    if [ -z "$(node_version_of "$TP_TOOLS/node/bin/node")" ]; then
        fail_step "The installed Node.js does not start." "The download does not match this Mac's processor, or macOS blocked it." \
            "Delete it so it is downloaded again::rm -rf ~/.test-playground/tools/node"
    fi
}

install_mongo() {
    local url sha pid
    url="https://fastdl.mongodb.org/osx/mongodb-macos-$MONGO_ARCH-$MONGO_PIN.tgz"
    fetch_text sha "$url.sha256"
    sha="${sha%% *}"
    if [ -z "$sha" ]; then
        explain_net "$NET_RC" "$NET_HTTP" "fastdl.mongodb.org"
        fail_step "The MongoDB checksum could not be downloaded." "$NET_CAUSE" "$NET_FIX1" "$NET_FIX2"
    fi
    info "Downloading MongoDB $MONGO_PIN (about 120 MB)"
    download "$url" "$TP_WORK/mongodb.tgz" "$sha" "MongoDB $MONGO_PIN"
    # Replacing setup's own copy while it runs would pull the files from under it.
    pid="$(port_pid 27017)"
    if [ -n "$pid" ] && ps -p "$pid" -o comm= | grep -q "^$TP_TOOLS/"; then
        info "Stopping setup's old MongoDB before replacing it"
        stop_mongo
    fi
    unpack "$TP_WORK/mongodb.tgz" "$TP_TOOLS/mongodb" "MongoDB"
    if [ -z "$(mongod_version_of "$TP_TOOLS/mongodb/bin/mongod")" ]; then
        fail_step "The installed MongoDB does not start." "The download does not match this Mac's processor, or macOS blocked it." \
            "Delete it so it is downloaded again::rm -rf ~/.test-playground/tools/mongodb"
    fi
}

install_mongosh() {
    local sha_var="MONGOSH_SHA_$NODE_ARCH"
    info "Downloading mongosh $MONGOSH_PIN (about 80 MB)"
    download "https://downloads.mongodb.com/compass/mongosh-$MONGOSH_PIN-darwin-$NODE_ARCH.zip" \
        "$TP_WORK/mongosh.zip" "${!sha_var}" "mongosh $MONGOSH_PIN"
    unpack "$TP_WORK/mongosh.zip" "$TP_TOOLS/mongosh" "mongosh"
    if [ -z "$(mongosh_version_of "$TP_TOOLS/mongosh/bin/mongosh")" ]; then
        fail_step "The installed mongosh does not start." "macOS blocked it, or the download does not match this Mac." \
            "Delete it so it is downloaded again::rm -rf ~/.test-playground/tools/mongosh"
    fi
}

# An in-place Homebrew update of MongoDB is only safe within one release series (8.0.x → 8.0.y);
# a newer series can need a data upgrade that the old version can't undo.
same_mongo_series() { [ "$(printf '%s' "$1" | cut -d. -f1-2)" = "$(printf '%s' "$MONGO_PIN" | cut -d. -f1-2)" ]; }

# ─── Shell profile ────────────────────────────────────────────────────────────

profile_file() {
    case "$(basename "${SHELL:-/bin/zsh}")" in
        bash) printf '%s' "$HOME/.bash_profile" ;;
        zsh)  printf '%s' "$HOME/.zshrc" ;;
    esac
}

profile_block() {
    printf '%s\n' "$PROFILE_BEGIN"
    printf '# Written by test-playground setup.sh; run it again to update. Remove this block to undo.\n'
    [ -n "$PATH_ADD" ] && printf 'export PATH="%s:$PATH"\n' "$PATH_ADD"
    [ -n "$CA_PEM" ] && printf 'export NODE_EXTRA_CA_CERTS="%s"\n' "$CA_PEM"
    printf '%s\n' "$PROFILE_END"
}

# Writes (or removes, when nothing is needed) the marked block; PROFILE_RESULT = present |
# set | updated | removed | not needed | failed
save_profile() {
    local file tmp old new=""
    PROFILE_RESULT="failed"
    file="$(profile_file)"
    PROFILE_SAVED="$file"
    [ -n "$file" ] || return 1
    [ -n "$PATH_ADD$CA_PEM" ] && new="$(profile_block)"
    old=""
    [ -f "$file" ] && old="$(awk -v b="$PROFILE_BEGIN" -v e="$PROFILE_END" '$0==b{on=1} on{print} $0==e{on=0}' "$file")"
    if [ "$old" = "$new" ]; then
        if [ -n "$new" ]; then PROFILE_RESULT="present"; else PROFILE_RESULT="not needed"; fi
        return 0
    fi
    touch "$file" 2>/dev/null || return 1
    [ -s "$file" ] && [ ! -f "$file.test-playground-backup" ] && cp "$file" "$file.test-playground-backup"
    tmp="$file.test-playground-tmp"
    # Drop the old block and add the new one after one blank line; cat > keeps a symlinked profile
    awk -v b="$PROFILE_BEGIN" -v e="$PROFILE_END" '$0==b{skip=1;next} $0==e{skip=0;next} !skip' "$file" >"$tmp" &&
        { [ -z "$new" ] || { [ -z "$(tail -n1 "$tmp")" ] || printf '\n'; printf '%s\n' "$new"; }; } >>"$tmp" &&
        cat "$tmp" >"$file" && rm -f "$tmp" || { rm -f "$tmp"; return 1; }
    if [ -z "$new" ]; then PROFILE_RESULT="removed"
    elif [ -n "$old" ]; then PROFILE_RESULT="updated"
    else PROFILE_RESULT="set"; fi
}

# ─── npm diagnosis ────────────────────────────────────────────────────────────

npm_fail() {
    local problem="$1" t
    t="$(tail -n 200 "$LOG")"
    TAIL_LINES=10
    if printf '%s' "$t" | grep -qE 'SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_GET_ISSUER_CERT|UNABLE_TO_VERIFY_LEAF_SIGNATURE|CERT_UNTRUSTED|unable to verify the first certificate'; then
        fail_step "$problem" "Node does not trust the HTTPS connection to the npm registry. Company networks that inspect HTTPS traffic (Zscaler, Netskope …) cause this." \
            "$CA_FIX" "Don't turn off npm's SSL checks (strict-ssl false) to get past this."
    elif printf '%s' "$t" | grep -qE 'E407|407 Proxy'; then
        fail_step "$problem" "The proxy needs a user name and password." \
            "Put them in the proxy address::export HTTPS_PROXY=http://<user>:<password>@<proxy-host>:<port>"
    elif printf '%s' "$t" | grep -qE 'E401|E403|401 Unauthorized|403 Forbidden'; then
        fail_step "$problem" "The package registry refused access. Either ~/.npmrc points npm at a company registry that needs a login, or a web filter blocks registry.npmjs.org or cdn.sheetjs.com." \
            "See which registry npm uses::npm config get registry" \
            "Log in to the company registry (npm login), or ask IT to allow https://registry.npmjs.org and https://cdn.sheetjs.com."
    elif printf '%s' "$t" | grep -qE 'ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|socket hang up|network request'; then
        fail_step "$problem" "npm could not reach registry.npmjs.org or cdn.sheetjs.com (SheetJS is installed from its own site). Either there is no internet connection, a VPN is not connected, or a proxy is needed." \
            "Connect to the internet or the VPN." "$PROXY_FIX"
    elif printf '%s' "$t" | grep -qE 'EINTEGRITY|integrity checksum failed'; then
        fail_step "$problem" "A downloaded package does not match its checksum in package-lock.json: npm's cache is damaged, or a proxy changed the file." \
            "Clear npm's cache::npm cache clean --force" "If it happens again, try another network."
    elif printf '%s' "$t" | grep -qE 'ENOSPC|no space left'; then
        fail_step "$problem" "The disk is full." "Free at least $MIN_FREE_GB GB of disk space."
    elif printf '%s' "$t" | grep -qE 'EACCES|EPERM|permission denied'; then
        fail_step "$problem" "npm may not write to the project folder or its cache, usually because npm was once run with sudo." \
            "Make them yours again::sudo chown -R \"$USER\" \"$PROJECT_DIR\" ~/.npm"
    elif printf '%s' "$t" | grep -qE 'can only install packages when your package.json and package-lock.json|are in sync|Missing: .* from lock file'; then
        fail_step "$problem" "package.json and package-lock.json don't match, so the checked-out code is incomplete or was edited locally." \
            "Get the latest version of the repository::git pull" \
            "If you changed package.json yourself, update the lock file::npm install"
    else
        fail_step "$problem" "npm reported an error; the Details above show it." \
            "Read the lines starting with \"npm error\" in the Details." \
            "If it fails the same way again, send $LOG_REL to the team."
    fi
}

# Describes the process holding a port: "<name> (PID <pid>)", or "another program"
port_holder() {
    local pid; pid="$(port_pid "$1")"
    if [ -n "$pid" ]; then printf '%s (PID %s)' "$(basename "$(ps -p "$pid" -o comm= 2>/dev/null)")" "$pid"
    else printf 'another program'; fi
}

# True when the process on a port is this project's dev server (its command or folder is the project)
port_is_ours() {
    local pid; pid="$(port_pid "$1")"
    [ -n "$pid" ] || return 1
    ps -p "$pid" -o command= 2>/dev/null | grep -qF "$PROJECT_DIR" && return 0
    [ "$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')" = "$PROJECT_DIR" ]
}

# ══════════════════════════════════════════════════════════════════════════════

printf '%sTest Playground setup%s · %s\n' "$C_BOLD" "$C_OFF" "$PROJECT_DIR"
para "" "" "Each tool is checked: missing tools are installed, older ones are updated, the rest are kept. The first run takes 5–15 minutes. Nothing needs administrator rights."

# ─── 1. This computer ─────────────────────────────────────────────────────────
step "Checking this computer"

case "$(uname -s)" in
    Darwin) ;;
    MINGW*|MSYS*|CYGWIN*)
        fail_step "setup.sh was started on Windows." "Windows has its own setup file." \
            "Close this window and double-click setup.cmd in the project folder." ;;
    *)  fail_step "This system ($(uname -s)) is not supported." "setup.sh is for macOS and setup.cmd is for Windows; Linux is not supported yet." \
            "Install Node.js $NODE_MIN and MongoDB $MONGO_MIN yourself, then follow \"Manual setup\" in README.md." ;;
esac

if [ "$(id -u)" = "0" ]; then
    fail_step "setup.sh was started with sudo." \
        "Running as the root user installs everything for root, and leaves files your own user cannot change." \
        "Run it without sudo::bash setup.sh"
fi

MACOS_VERSION="$(sw_vers -productVersion)"
MACOS_MAJOR="${MACOS_VERSION%%.*}"
MACOS_MINOR="$(printf '%s' "$MACOS_VERSION" | cut -d. -f2)"
if [ "$MACOS_MAJOR" -lt 13 ] || { [ "$MACOS_MAJOR" -eq 13 ] && [ "${MACOS_MINOR:-0}" -lt 5 ]; }; then
    fail_step "macOS $MACOS_VERSION is too old." "Node.js ${NODE_MIN%%.*} needs macOS 13.5 (Ventura) or later." \
        "Update macOS: Apple menu → System Settings → General → Software Update."
fi

ARCH="$(uname -m)"
# A Terminal running under Rosetta reports x86_64 on an Apple Silicon Mac
if [ "$ARCH" = "x86_64" ] && [ "$(sysctl -in sysctl.proc_translated 2>/dev/null)" = "1" ]; then ARCH="arm64"; fi
case "$ARCH" in
    arm64)  NODE_ARCH="arm64"; MONGO_ARCH="arm64";  CHIP="Apple Silicon" ;;
    x86_64) NODE_ARCH="x64";   MONGO_ARCH="x86_64"; CHIP="Intel" ;;
    *) fail_step "Unknown processor type: $ARCH." "setup.sh supports Apple Silicon and Intel Macs." "Send $LOG_REL to the team." ;;
esac
ok "macOS $MACOS_VERSION ($CHIP)"

for f in package.json package-lock.json server/.env.example server/seed.js scripts/check-deps.js \
         scripts/make-cert.js scripts/make-env.js scripts/mongo-admin.js scripts/start.sh; do
    if [ ! -f "$PROJECT_DIR/$f" ]; then
        fail_step "The project file $f is missing." "setup.sh was copied on its own, or the repository download is incomplete." \
            "Clone the whole repository and run bash setup.sh from its folder."
    fi
done
case "$PROJECT_DIR" in
    */Library/Mobile\ Documents/*|*/Library/CloudStorage/*)
        warn "The project is in iCloud Drive or another synced folder. Syncing node_modules (thousands of files) can make installs slow or fail; a folder such as ~/Projects works best." ;;
esac
ok "Project folder is complete and writable"

FREE_GB=$(( $(df -Pk "$HOME" | awk 'NR==2 {print $4}') / 1024 / 1024 ))
if [ "$FREE_GB" -lt "$MIN_FREE_GB" ]; then
    fail_step "Only $FREE_GB GB of disk space is free." "Setup downloads Node.js, MongoDB and the npm packages, and needs room to unpack them." \
        "Free at least $MIN_FREE_GB GB: empty the Bin and remove large files."
fi
ok "$FREE_GB GB of free disk space"

if ! mkdir -p "$TP_TOOLS" "$TP_WORK" 2>>"$LOG" || [ ! -w "$TP_HOME" ]; then
    fail_step "Setup cannot write to $TP_HOME." "The folder belongs to another user, usually because setup was once run with sudo." \
        "Make it yours again::sudo chown -R \"$USER\" \"$TP_HOME\""
fi

# Company certificate: kept as PEM for curl and Node
CA_PEM=""
if [ -n "$CA_CERT" ]; then
    CA_CERT="${CA_CERT/#\~/$HOME}"
    if [ ! -f "$CA_CERT" ]; then
        fail_step "The certificate file $CA_CERT does not exist." "The path given to --ca-cert is wrong." \
            "Check the path. Tip: drag the file into Terminal to paste its exact path."
    fi
    CA_PEM="$TP_HOME/company-ca.pem"
    if grep -q 'BEGIN CERTIFICATE' "$CA_CERT"; then
        cp "$CA_CERT" "$CA_PEM"
    elif ! openssl x509 -inform der -in "$CA_CERT" -out "$CA_PEM" >>"$LOG" 2>&1; then
        fail_step "$CA_CERT is not a certificate setup can read." "It must be a .pem, .crt or .cer certificate, not a .p12 or .pfx bundle." \
            "Export the certificate again as .cer: Keychain Access → File → Export Items."
    fi
    cat /etc/ssl/cert.pem "$CA_PEM" >"$TP_HOME/ca-bundle.pem"
    CURL_CA="--cacert $TP_HOME/ca-bundle.pem"
    export NODE_EXTRA_CA_CERTS="$CA_PEM"
    ok "Company certificate loaded ($(openssl x509 -noout -subject -in "$CA_PEM" 2>/dev/null | sed 's/^subject= *//'))"
fi
# Node also trusts certificates in the macOS Keychain, where IT installs a company proxy's
# certificate, so npm usually works behind such a proxy without --ca-cert.
export NODE_USE_SYSTEM_CA=1

PROXY_URL="${HTTPS_PROXY:-${https_proxy:-${HTTP_PROXY:-${http_proxy:-}}}}"
PROXY_SOURCE="environment"
if [ -z "$PROXY_URL" ]; then
    SC="$(scutil --proxy 2>/dev/null)"
    if printf '%s' "$SC" | grep -q 'HTTPSEnable : 1'; then
        PROXY_URL="http://$(printf '%s' "$SC" | awk '/HTTPSProxy :/ {print $3}'):$(printf '%s' "$SC" | awk '/HTTPSPort :/ {print $3}')"
        PROXY_SOURCE="macOS network settings"
    elif printf '%s' "$SC" | grep -q 'ProxyAutoConfigEnable : 1'; then
        info "This Mac uses an automatic proxy script. If downloads fail, ask IT for the proxy address and set HTTPS_PROXY."
    fi
fi
if [ -n "$PROXY_URL" ]; then
    case "$PROXY_URL" in *://*) ;; *) PROXY_URL="http://$PROXY_URL" ;; esac
    export HTTPS_PROXY="$PROXY_URL" HTTP_PROXY="$PROXY_URL" https_proxy="$PROXY_URL" http_proxy="$PROXY_URL"
    export NO_PROXY="localhost,127.0.0.1${NO_PROXY:+,$NO_PROXY}" no_proxy="localhost,127.0.0.1${no_proxy:+,$no_proxy}"
    PROXY_SHOWN="$(printf '%s' "$PROXY_URL" | sed -E 's#//[^@/]*@#//***@#')"
    ok "Proxy $PROXY_SHOWN (from $PROXY_SOURCE)"
fi

if [ -n "$BREW" ]; then ok "Homebrew found ($BREW); used where it has a prebuilt copy for this Mac"
else info "Homebrew is not installed, so tools are downloaded from their official sites."; fi

# ─── 2. Node.js ───────────────────────────────────────────────────────────────
step "Node.js ($NODE_MIN or later)"

BREW_ARGS=()
ensure_tool "Node.js" node "$NODE_MIN" node_version_of node install_node node
[ -n "$TOOL_OWN" ] && path_add "$TP_TOOLS/node/bin"
# A Homebrew Node that isn't on PATH (no `brew shellenv` in the profile) still has to be found.
[ "$(resolve "$(command -v node 2>/dev/null || echo /nonexistent)")" = "$(resolve "$TOOL_BIN")" ] || path_add "$(dirname "$TOOL_BIN")"
NODE_BIN="$TOOL_BIN"
if [ "$ARCH" = arm64 ] && [ "$("$NODE_BIN" -p process.arch 2>/dev/null)" = x64 ]; then
    info "This Node.js is an Intel build running under Rosetta on an Apple Silicon Mac. It works, but more slowly."
fi
summary ok "Node.js" "$TOOL_VERSION" "$TOOL_RESULT"
NODE_VERSION="$TOOL_VERSION"; NODE_RESULT="$TOOL_RESULT"

# ─── 3. MongoDB ───────────────────────────────────────────────────────────────
step "MongoDB ($MONGO_MIN or later)"

MONGO_FORMULA="mongodb/brew/mongodb-community@$(printf '%s' "$MONGO_PIN" | cut -d. -f1-2)"
# Check every MongoDB the Mac has, not only the one on PATH: a Homebrew formula may be unlinked.
EXISTING_MONGOD="$(pick_mongod)"
if [ -n "$EXISTING_MONGOD" ] && [ "$EXISTING_MONGOD" != "$(command -v mongod 2>/dev/null)" ] && [ "$EXISTING_MONGOD" != "$TP_TOOLS/mongodb/bin/mongod" ]; then
    MONGO_VERSION="$(mongod_version_of "$EXISTING_MONGOD")"
    skipped "MongoDB $MONGO_VERSION is already installed ($EXISTING_MONGOD). Nothing to do."
    MONGO_BIN="$EXISTING_MONGOD"; MONGO_RESULT="already installed"; TOOL_OWN=""
else
    if [ -n "$BREW" ] && brew_ready "$MONGO_FORMULA" && [ -z "$(command -v mongod 2>/dev/null)" ]; then
        run_logged "$BREW" tap mongodb/brew
        # Newer Homebrew asks for third-party taps to be trusted; older versions have no `trust`.
        "$BREW" trust mongodb/brew >>"$LOG" 2>&1 || true
    fi
    # mongosh comes in its own step: Homebrew's mongosh has no prebuilt copy on some Macs.
    BREW_ARGS=(--without-mongosh)
    ensure_tool "MongoDB" mongod "$MONGO_MIN" mongod_version_of mongodb install_mongo "$MONGO_FORMULA" same_mongo_series
    BREW_ARGS=()
    MONGO_BIN="$TOOL_BIN"; MONGO_VERSION="$TOOL_VERSION"; MONGO_RESULT="$TOOL_RESULT"
fi
[ -n "$TOOL_OWN" ] && path_add "$TP_TOOLS/mongodb/bin"
if [ -n "$TOOL_OWN" ]; then info "MongoDB keeps this project's data in $TP_DB."; fi
summary ok "MongoDB" "$MONGO_VERSION" "$MONGO_RESULT"

# ─── 4. mongosh (optional) ────────────────────────────────────────────────────
step "mongosh $MONGOSH_MIN or later (optional MongoDB shell)"

# Optional: run in a subshell with SOFT_FAIL, so a failure is reported at the end instead of
# stopping setup. The result comes back through a file because the subshell can't set variables.
SOFT_FAIL=1
( ensure_tool "mongosh" mongosh "$MONGOSH_MIN" mongosh_version_of mongosh install_mongosh mongosh &&
    printf '%s|%s|%s\n' "$TOOL_VERSION" "$TOOL_RESULT" "$TOOL_OWN" >"$TP_WORK/mongosh.result" )
MONGOSH_RC=$?
SOFT_FAIL=""
if [ "$MONGOSH_RC" -eq 0 ] && [ -f "$TP_WORK/mongosh.result" ]; then
    IFS='|' read -r MONGOSH_VERSION MONGOSH_RESULT MONGOSH_OWN <"$TP_WORK/mongosh.result"
    [ -n "$MONGOSH_OWN" ] && path_add "$TP_TOOLS/mongosh/bin"
    summary ok "mongosh" "$MONGOSH_VERSION" "$MONGOSH_RESULT"
else
    attention "mongosh could not be installed (reason above). The app does not need it; it is only for looking at the data yourself." \
        "Run setup again later, or download it from https://www.mongodb.com/try/download/shell."
    summary warn "mongosh" "" "needs attention"
fi
rm -f "$TP_WORK/mongosh.result"

# ─── 5. New Terminal windows ──────────────────────────────────────────────────
step "Making these tools the default in new Terminal windows"

if save_profile; then
    case "$PROFILE_RESULT" in
        present)      skipped "$PROFILE_SAVED already puts setup's tools first. Nothing to do." ;;
        "not needed") skipped "No setup copies are in use, so ${PROFILE_SAVED:-the shell profile} needs no change." ;;
        set)          installed "Added a marked block to $PROFILE_SAVED that puts setup's tools first." ;;
        updated)      updated "Updated the marked block in $PROFILE_SAVED." ;;
        removed)      updated "Removed setup's block from $PROFILE_SAVED; it is no longer needed." ;;
    esac
    summary ok "Terminal PATH" "" "$PROFILE_RESULT"
elif [ -z "$(profile_file)" ]; then
    attention "Your shell ($(basename "${SHELL:-unknown}")) is not zsh or bash, so setup did not change its settings." \
        "Add setup's tools to PATH in your shell's start file::export PATH=\"$PATH_ADD:\$PATH\""
    summary warn "Terminal PATH" "" "needs attention"
else
    attention "$PROFILE_SAVED could not be changed, so new Terminal windows may use older tools." \
        "Add this line to it yourself::export PATH=\"$PATH_ADD:\$PATH\""
    summary warn "Terminal PATH" "" "needs attention"
fi

# ─── 6. npm packages ──────────────────────────────────────────────────────────
step "npm packages"

DEPS_OUT="$(node scripts/check-deps.js 2>&1)"; DEPS_RC=$?
log "check-deps: rc=$DEPS_RC $DEPS_OUT"
if [ "$DEPS_RC" -eq 0 ]; then
    skipped "All packages are installed at the versions in package-lock.json. Nothing to do."
    summary ok "npm packages" "" "already installed"
else
    case "$DEPS_RC" in
        3) info "The installed packages were built for another computer or processor. Installing them again." ;;
        1) info "$DEPS_OUT" ;;
        *) info "$DEPS_OUT" ;;
    esac
    info "Installing the packages from package-lock.json (1–3 minutes)"
    if ! run_logged npm ci --no-audit --no-fund; then
        npm_fail "The npm packages could not be installed."
    fi
    DEPS_OUT="$(node scripts/check-deps.js 2>&1)"
    if [ $? -ne 0 ]; then
        log "$DEPS_OUT"; TAIL_LINES=4
        fail_step "The npm packages are still incomplete after installing them." "$DEPS_OUT" \
            "Delete node_modules so it is installed again from scratch::rm -rf node_modules"
    fi
    installed "Installed the npm packages (SheetJS $(node -p "require('./node_modules/xlsx/package.json').version") from cdn.sheetjs.com)."
    summary ok "npm packages" "" "installed"
fi

# ─── 7. HTTPS certificate ─────────────────────────────────────────────────────
step "HTTPS certificate for localhost (certs/)"

CERT_OUT="$(node scripts/make-cert.js 2>>"$LOG")"; CERT_RC=$?
log "make-cert: $CERT_OUT"
case "$CERT_OUT" in
    present*) skipped "The certificate is ${CERT_OUT}. Nothing to do."; summary ok "Certificate" "" "already present" ;;
    created*) installed "Created a self-signed certificate for localhost, ${CERT_OUT#created, }."; summary ok "Certificate" "" "created" ;;
    renewed*) updated "Renewed the certificate: the old one was ${CERT_OUT#renewed (}"; summary ok "Certificate" "" "renewed" ;;
    *) [ "$CERT_RC" -ne 0 ] && fail_step "The HTTPS certificate could not be created." "${CERT_OUT#failed: }" \
           "Check that the certs folder can be written::ls -la \"$PROJECT_DIR/certs\"" ;;
esac

# ─── 8. server/.env ───────────────────────────────────────────────────────────
step "Server settings (server/.env)"

ENV_OUT="$(node scripts/make-env.js 2>>"$LOG")"; ENV_RC=$?
log "make-env: $ENV_OUT"
case "$ENV_OUT" in
    present) skipped "server/.env has every setting. Nothing to do."; summary ok "server/.env" "" "already present" ;;
    created*) installed "Created server/.env ${ENV_OUT#created, }."; summary ok "server/.env" "" "created" ;;
    added*) updated "server/.env was missing ${ENV_OUT#added }; added them. Your existing values are unchanged."; summary ok "server/.env" "" "updated" ;;
    *) [ "$ENV_RC" -ne 0 ] && fail_step "server/.env could not be created." "${ENV_OUT#failed: }" \
           "Check that the server folder can be written::ls -la \"$PROJECT_DIR/server\"" ;;
esac

# ─── 9. MongoDB running ───────────────────────────────────────────────────────
step "MongoDB running on 127.0.0.1:27017"

if mongo_up; then
    RUNNING_VERSION="$(node scripts/mongo-admin.js version 2>>"$LOG")"
    if [ $? -ne 0 ] || [ -z "$RUNNING_VERSION" ]; then
        fail_step "Port 27017, which MongoDB needs, is used by $(port_holder 27017)." \
            "Another program is listening on MongoDB's port, and it does not answer as MongoDB." \
            "Quit that program (Activity Monitor → search for it → Quit), or see what it is::lsof -nP -iTCP:27017 -sTCP:LISTEN"
    fi
    if ! version_ge "$RUNNING_VERSION" "$MONGO_MIN"; then
        PID="$(port_pid 27017)"; RUN_BIN="$(ps -p "${PID:-0}" -o comm= 2>/dev/null)"; RUN_SRC="$(source_of "${RUN_BIN:-/nonexistent}")"
        if [ "${RUN_SRC%%:*}" = brew ]; then STOP_FIX="Stop it::brew services stop ${RUN_SRC#brew:}"
        elif printf '%s' "$RUN_BIN" | grep -qi docker; then STOP_FIX="Stop the MongoDB container (docker ps shows it)::docker stop <container>"
        else STOP_FIX="Stop it (Activity Monitor → mongod → Quit), or::kill ${PID:-<pid>}"; fi
        fail_step "An older MongoDB ($RUNNING_VERSION) is already running on port 27017." \
            "Only one MongoDB can use the port, and this project needs $MONGO_MIN or later, which is installed but can't start while the old one runs. The old one and its data are not changed." \
            "$STOP_FIX"
    fi
    skipped "MongoDB $RUNNING_VERSION is already running. Nothing to do."
    summary ok "MongoDB running" "$RUNNING_VERSION" "already running"
else
    info "Starting MongoDB"
    if start_mongo; then
        installed "Started MongoDB ($MONGO_HOW)."
        summary ok "MongoDB running" "$MONGO_VERSION" "started"
    elif [ "$MONGO_HOW" = "not installed" ]; then
        fail_step "No MongoDB $MONGO_MIN or later could be found." "Step 3 should have installed it; it may have been removed since." \
            "Run setup again."
    else
        log "--- end of $MONGO_LOGFILE ---"; tail -n 20 "$MONGO_LOGFILE" >>"$LOG" 2>/dev/null
        explain_mongo_log "$MONGO_LOGFILE"
        TAIL_LINES=6
        fail_step "MongoDB did not start ($MONGO_HOW)." "$MONGO_CAUSE" "$MONGO_FIX"
    fi
fi

# ─── 10. Sample users ─────────────────────────────────────────────────────────
step "Sample users (alice@example.com, bob@example.com)"

if run_logged node server/seed.js; then
    ok "Sample users are ready (existing ones are left as they are)."
    summary ok "Sample users" "" "ready"
else
    TAIL_LINES=8
    if tail -n 30 "$LOG" | grep -qE 'Authentication failed|requires authentication|Unauthorized'; then
        fail_step "The sample users could not be created." "The running MongoDB requires a user name and password, and MONGO_URI in server/.env has none." \
            "Put the credentials in MONGO_URI in server/.env::MONGO_URI=mongodb://<user>:<password>@127.0.0.1:27017/test-playground?authSource=admin"
    fi
    fail_step "The sample users could not be created." "server/seed.js reported an error; the Details above show it." \
        "Check MONGO_URI in server/.env points to this MongoDB (mongodb://127.0.0.1:27017/test-playground)." \
        "If it fails the same way again, send $LOG_REL to the team."
fi

# ─── 11. Start the app ────────────────────────────────────────────────────────
step "Starting the app"

APP_RUNNING=""
for port in $([ -n "$START_APP" ] && echo 3000 4000); do
    if nc -z 127.0.0.1 "$port" 2>/dev/null; then
        if port_is_ours "$port"; then
            APP_RUNNING=1
        else
            fail_step "Port $port, which the app needs, is used by $(port_holder "$port")." \
                "Another program is listening on port $port (the app uses 3000 for the website and 4000 for the API)." \
                "Quit that program, or see what it is::lsof -nP -iTCP:$port -sTCP:LISTEN"
        fi
    fi
done

if [ -n "$APP_RUNNING" ]; then
    skipped "The app is already running: https://localhost:3000"
elif [ -z "$START_APP" ]; then
    info "Not started (--no-start). Start it with: npm run start:all"
else
    ok "Ports 3000 and 4000 are free"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────

rm -rf "$TP_WORK"
printf '\n%sSummary%s\n\n' "$C_BOLD" "$C_OFF"
printf '%s' "$SUMMARY" | while IFS='|' read -r status name version result; do
    [ -z "$name" ] && continue
    if [ "$status" = ok ]; then mark="${C_GREEN}✓${C_OFF}"; else mark="${C_YELLOW}!${C_OFF}"; fi
    printf '  %s %-16s %-10s %s\n' "$mark" "$name" "$version" "$result"
done

if [ -n "$ATTENTION" ]; then
    printf '\n%sSetup finished, but these need your attention:%s\n\n' "$C_YELLOW" "$C_OFF"
    printf '%s' "$ATTENTION" | while IFS='|' read -r title fix; do
        [ -z "$title" ] && continue
        para "  ${C_YELLOW}!${C_OFF} " "    " "$title"
        print_fix "    Fix: " "         " "$fix"
        [ -z "$LAST_FIX_HAD_COMMAND" ] && printf '\n'
    done
else
    printf '\n%sSetup complete.%s\n' "$C_GREEN" "$C_OFF"
fi
printf '\n%sNext%s\n' "$C_BOLD" "$C_OFF"
[ -n "$PATH_ADD" ] && para "  • " "    " "Open a NEW Terminal window before using node or npm yourself, so it picks up the updated tools."
para "  • " "    " "Sign in at https://localhost:3000 as alice@example.com / hunter2pass. The browser warns about the self-signed certificate once: choose Advanced → Proceed."
para "  • " "    " "Later: npm run start:all to start, npm run stop:all to stop. Run setup again any time; it only changes what is missing or out of date."
log "finished"

if [ -n "$START_APP" ] && [ -z "$APP_RUNNING" ]; then
    printf '\n%sStarting the app%s (Ctrl+C stops it)\n\n' "$C_BOLD" "$C_OFF"
    trap - INT TERM
    exec bash "$PROJECT_DIR/scripts/start.sh"
fi
exit 0
