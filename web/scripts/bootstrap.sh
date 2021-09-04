#!/bin/bash
set -x
set -u
set -e
set -v

brew bundle -v --file=.brewfile --no-upgrade --no-lock

asdf plugin-add elixir
asdf plugin-add erlang
asdf install

yarn --prefer-offline --check-files

mix local.hex --if-missing --force
mix deps.get

# TODO: also execute ./ui boostrap script
