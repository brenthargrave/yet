# Yet — web app

Phoenix 1.7 (Elixir 1.15 / OTP 26) with a React + Vite UI. This page covers
local setup only. Deployment, the provider CLIs, and agent workflows are
documented in the root [`AGENTS.md`](../AGENTS.md).

## Prerequisites

Install the Homebrew-managed tools (`mise`, `yarn`, `mkcert`, `infisical`, the
provider CLIs, and the Erlang build deps):

```shell
brew bundle install --file=.brewfile --no-upgrade
```

`mise` then provides the pinned Elixir, Erlang, and Node versions. A local
PostgreSQL is also required; the dev `DATABASE_URL` (in Infisical) points at it.

## Setup

1. Authenticate to Infisical once. Secrets are injected at run time by
   `infisical run` (wired into the `mise` tasks) — there are no local `.env`
   files to create.

   ```shell
   infisical login
   ```

2. Install dependencies and configure this clone's git hooks:

   ```shell
   ./scripts/bootstrap.sh
   ```

3. Trust a localhost certificate — the dev server runs over HTTPS:

   ```shell
   mkcert -install
   (cd priv/cert && mkcert \
     --cert-file localhost-cert.pem --key-file localhost-key.pem \
     yet.localhost test.localhost localhost 127.0.0.1 ::1)
   ```

4. Create and migrate the dev database:

   ```shell
   mise run db:setup
   ```

## Run

```shell
mise run dev     # Phoenix (HTTPS on PORT_SSL) + Vite dev servers
mise run test    # test suite
mise run build   # production UI assets
```

## Everything else

Deployment (Fly), the production database (Neon), error reporting (Sentry),
issue tracking (Linear), and the project-scoped provider tasks
(`mise run fly|neon|db|sentry|linear`) are all covered in
[`AGENTS.md`](../AGENTS.md). Project plans and decisions live in
[`../plans/`](../plans/).
