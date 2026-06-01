#!/usr/bin/env bash
# shellcheck shell=bash
# Run the browser e2e suite (Mocha + Puppeteer). Starts the test server if it
# isn't already serving 6443, waits for it, runs the suite, and stops only the
# server it started. If one is already up (e.g. `mise run test:server` in another
# shell) it's reused and left running, so iteration stays fast.
set -euo pipefail
cd "$(dirname "$0")/.."

sandbox="https://127.0.0.1:6443/sandbox"
server_pid=""

ready() { curl -sk -m 2 -o /dev/null -X POST "$sandbox" 2>/dev/null; }

if ! ready; then
  echo "e2e: starting test server..." >&2
  mise run test:server >/tmp/yet-e2e-server.log 2>&1 &
  server_pid=$!
  for _ in $(seq 1 60); do ready && break; sleep 1; done
  ready || { echo "e2e: test server did not come up; see /tmp/yet-e2e-server.log" >&2; exit 1; }
fi

cleanup() {
  [ -n "$server_pid" ] || return 0
  echo "e2e: stopping test server..." >&2
  kill "$server_pid" 2>/dev/null || true
  # Backstop on the test ports only (dev is 3443/8080, so it's untouched).
  lsof -ti tcp:6443 2>/dev/null | xargs kill 2>/dev/null || true
  lsof -ti tcp:8081 2>/dev/null | xargs kill 2>/dev/null || true
}
trap cleanup EXIT

cd ux && yarn test:ux
