#!/usr/bin/env bash
# shellcheck shell=bash
# Sync prod RUNTIME secrets/config from Infisical to Fly (yet-prod).
#
# Build-time vars (Sentry/Vite/NODE_OPTIONS) are excluded — they go into the image
# build via `mise run deploy` (--build-arg/--build-secret) or Dockerfile defaults,
# not Fly runtime. Auth (FLY_API_TOKEN) comes from Infisical dev; the secrets to
# push come from Infisical prod. Run via `mise run deploy:secrets`.
set -euo pipefail

app="yet-prod"
FLY_API_TOKEN="$(infisical run --env=dev --silent -- printenv FLY_API_TOKEN)"
export FLY_API_TOKEN

dotenv="$(infisical export --env=prod --format=dotenv)"

# Safety: refuse to push a non-Neon DATABASE_URL (e.g. a stale leftover value),
# which would overwrite the working Fly DB secret and break prod.
db="$(printf '%s\n' "$dotenv" | grep '^DATABASE_URL=' || true)"
case "$db" in
  *neon.tech*) ;;
  *) echo "ABORT: prod DATABASE_URL is not a Neon URL — fix it in Infisical first." >&2; exit 1 ;;
esac

printf '%s\n' "$dotenv" \
  | grep -vE '^(VITE_API_ENV|VITE_HOST|VITE_SENTRY_DSN|SENTRY_ORG|SENTRY_AUTH_TOKEN|NODE_OPTIONS)=' \
  | flyctl secrets import -a "$app"
