# syntax=docker/dockerfile:1

ARG ELIXIR_VERSION=1.15.7
ARG ERLANG_VERSION=26.1.2
ARG DEBIAN_VERSION=bookworm-20231009
ARG NODE_DEBIAN_VERSION=bookworm
ARG NODE_VERSION=18.16.0

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${ERLANG_VERSION}-debian-${DEBIAN_VERSION}-slim"
ARG RUNNER_IMAGE="debian:${DEBIAN_VERSION}-slim"
ARG NODE_IMAGE="node:${NODE_VERSION}-${NODE_DEBIAN_VERSION}-slim"

FROM ${NODE_IMAGE} AS ui

WORKDIR /app

ENV MIX_ENV=prod
ENV NODE_OPTIONS=--max_old_space_size=2560
ARG VITE_API_ENV=prod
ARG VITE_HOST=yet.app
# Frontend Sentry: the public browser DSN is baked into the bundle, and SENTRY_ORG
# is needed for the sourcemap upload (project is hard-coded "ui" in vite.config.ts).
# SENTRY_AUTH_TOKEN is NOT an ARG — it arrives as a build secret on the `yarn build`
# step below so it never lands in an image layer. Pass these via `mise run deploy`.
ARG VITE_SENTRY_DSN=
ARG SENTRY_ORG=trawler
ENV VITE_API_ENV=${VITE_API_ENV}
ENV VITE_HOST=${VITE_HOST}
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
ENV SENTRY_ORG=${SENTRY_ORG}

COPY tsconfig.json ./
COPY ui/package.json ui/yarn.lock ui/
WORKDIR /app/ui
RUN yarn install --frozen-lockfile

COPY ui ./
# @sentry/vite-plugin uploads sourcemaps here. SENTRY_AUTH_TOKEN comes from the
# build secret; if absent (e.g. a local build) the plugin simply skips upload.
RUN --mount=type=secret,id=sentry_auth_token \
    SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" \
    yarn build

FROM ${BUILDER_IMAGE} AS builder

WORKDIR /app

ENV MIX_ENV=prod
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends build-essential git && \
    rm -rf /var/lib/apt/lists/*

RUN mix local.hex --force && \
    mix local.rebar --force

COPY mix.exs mix.lock ./
RUN mix deps.get --only prod && \
    mkdir config

COPY config/config.exs config/prod.exs config/
RUN mix deps.compile

COPY config/runtime.exs config/
COPY lib lib
COPY priv priv
COPY --from=ui /app/priv/static priv/static

RUN mix compile
RUN mix release

FROM ${RUNNER_IMAGE}

WORKDIR /app

ENV MIX_ENV=prod
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends ca-certificates libstdc++6 openssl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=nobody:root /app/_build/prod/rel/app ./

USER nobody

CMD ["/app/bin/app", "start"]
