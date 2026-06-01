#!/usr/bin/env bash
# shellcheck shell=bash
# Build + deploy to Fly (yet-prod), feeding the image build the frontend Sentry
# values so sourcemaps upload and the browser bundle gets its DSN.
#
# Auth (FLY_API_TOKEN) comes from Infisical dev; the build-time Sentry values come
# from Infisical prod. SENTRY_AUTH_TOKEN goes in as a build *secret* (never baked
# into a layer). SENTRY_ORG defaults to "trawler" in the Dockerfile.
#
# Run via `mise run deploy`. Extra args pass through, e.g.
# `mise run deploy -- --build-only` to test the build + sourcemap upload without
# deploying (no DB needed).
set -euo pipefail

FLY_API_TOKEN="$(infisical run --env=dev --silent -- printenv FLY_API_TOKEN)"
export FLY_API_TOKEN

prod="$(infisical export --env=prod --format=dotenv)"
get() { printf '%s\n' "$prod" | sed -nE "s/^$1=//p" | tr -d "\"'"; }

exec flyctl deploy \
  --build-arg "VITE_SENTRY_DSN=$(get VITE_SENTRY_DSN)" \
  --build-secret "sentry_auth_token=$(get SENTRY_AUTH_TOKEN)" \
  "$@"
