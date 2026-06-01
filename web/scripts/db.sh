#!/usr/bin/env bash
# shellcheck shell=bash
# Read-only psql against the Neon yet-prod database. NEON_API_KEY is injected by
# `infisical run` (dev env); NEON_PROJECT_ID comes from mise [env]. The session
# defaults to read-only transactions so accidental writes fail — a soft guard,
# not a dedicated read-only role. Args after `--` pass through, e.g.
# `mise run db -- -c 'select 1'`.
set -euo pipefail

url="$(neonctl connection-string --project-id "$NEON_PROJECT_ID")"
exec env PGOPTIONS="-c default_transaction_read_only=on" psql "$url" "$@"
