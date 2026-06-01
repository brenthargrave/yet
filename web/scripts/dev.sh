#!/usr/bin/env sh
set -eu

# Ports come from mise: the [env] defaults in mise.toml plus the per-worktree
# mise.local.toml that Worktrunk generates. Nothing to source here.

check_port() {
  name="$1"
  port="$2"

  if [ -z "$port" ] || ! command -v lsof >/dev/null 2>&1; then
    return
  fi

  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    printf '%s=%s is already in use.\n' "$name" "$port" >&2
    printf 'Change the value in mise.local.toml or stop the process using that port.\n' >&2
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >&2
    exit 1
  fi
}

check_port PORT "${PORT:-}"
check_port PORT_SSL "${PORT_SSL:-}"
check_port VITE_PORT_UI "${VITE_PORT_UI:-}"

exec mix phx.server
