#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

log() {
  printf '\n==> %s\n' "$1"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'missing required command: %s\n' "$1" >&2
    printf '%s\n' "$2" >&2
    exit 1
  }
}

require_command brew "Install Homebrew first: https://brew.sh"
require_command mise "Install project Homebrew deps manually: brew bundle install --file=.brewfile --no-upgrade"
require_command yarn "Install project Homebrew deps manually: brew bundle install --file=.brewfile --no-upgrade"

log "Installing pinned runtime tools"
mise trust --yes mise.toml
mise install

log "Configuring Git hooks"
./scripts/install-git-hooks.sh

log "Installing root JavaScript dependencies"
mise exec -- yarn install --frozen-lockfile --prefer-offline --check-files

log "Installing Elixir package managers"
mise exec -- mix local.hex --if-missing --force
mise exec -- mix local.rebar --if-missing --force

log "Installing Mix dependencies"
mise exec -- mix deps.get

log "Installing UI dependencies"
(cd ui && mise exec -- yarn install --frozen-lockfile --prefer-offline --check-files)

log "Installing UX dependencies"
(cd ux && mise exec -- yarn install --frozen-lockfile --prefer-offline --check-files)
