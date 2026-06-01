# AGENTS.md

This file gives coding agents the repo-specific context needed at the monorepo
root. The Phoenix app lives in `web/`; run app tasks from there for now.

## Project Overview

This is an older Phoenix application being redeployed with safer local
development, explicit deployment workflows, and private-volume symlinks removed
from the normal path.

## Common Commands

```shell
# First-time or refreshed local setup
cd web
./scripts/bootstrap.sh

# Create/migrate the local dev database (first run)
mise run db:setup

# Local dev server
mise run dev

# Run tests
mise run test

# Build static assets
mise run build

# Project-scoped provider CLIs (auth via Infisical; see Providers).
mise run fly -- status              # Fly.io
mise run neon -- projects list      # Neon control plane
mise run db -- -c 'select 1'        # read-only psql on Neon yet-prod
mise run sentry -- issues trawler/  # Sentry (all projects in the org)
mise run linear -- issue list       # Linear (Yet workspace)

# Deploy to Fly prod (see Deployment)
mise run deploy:secrets   # sync prod runtime secrets to Fly
mise run deploy           # build + deploy (uploads sourcemaps)

# Configure this clone's Git hooks
mise run git:install-hooks
```

Bootstrap requires Homebrew-managed prerequisites such as `mise` and `yarn`,
but it does not install Homebrew packages itself. If those are missing, install
them manually with `brew bundle install --file=.brewfile --no-upgrade` from
`web/`. Do not wrap first-time setup in a `mise` task. Keep other runnable app
tasks in `web/mise.toml` while the project remains scoped to the Phoenix app.
Add root tasks later only when there is real root-level work to coordinate.

## Architecture

- `web/` - Phoenix app, Mix project, deploy scripts, Vite UI, and tests.
- `web/ui/` - React/Vite frontend used by Phoenix.
- `web/ux/` - Mocha/Puppeteer browser e2e package.

## Environment

- Elixir 1.15.7 on OTP 26, currently pinned in `web/.tool-versions`.
- Node.js 18.16.0, currently pinned in `web/.tool-versions`.
- Postgres is required locally; do not assume the default system Postgres
  version beyond what the user-level instructions say.
- `_private/` is a local-only private volume (dotenv/REPL/port files live there).
  **Never commit a symlink whose target resolves outside the repo** (e.g. into
  `_private`, or an absolute path) — they are clone-local/machine-specific and
  leak broken refs. The `pre-commit` hook (`.githooks/pre-commit`, installed by
  `mise run git:install-hooks`) rejects them. In-repo symlinks are fine.
- Zed project settings map `.env*` files to Plain Text so the Bash language
  server does not run ShellCheck diagnostics on dotenv assignments. CLI
  ShellCheck still uses the committed `.shellcheckrc` files for shell scripts.

## Secrets

Secrets are managed with **Infisical** in run-mode: `infisical run --env=<env> --
<cmd>` injects per-environment secrets into the process at call time. There are
**no plaintext dotenv files at rest** — mise tasks wrap the app, tests, and
provider CLIs in `infisical run` (see `web/mise.toml`). The project/env pin is
committed in `web/.infisical.json`; run `infisical login` once per machine.

- **Infisical holds only secrets** (plus a few not-safe-to-commit values like
  emails and DSNs), per environment (`dev`/`test`/`prod`).
- **Non-secret config lives in committed config**: shared and dev/test defaults in
  `web/mise.toml [env]`, with `test`-task overrides for Elixir's separate test
  runtime (own DB, host, ports); prod runtime non-secrets in Infisical `prod`
  (tunable live) or `web/fly.toml [env]` (structural deploy flags); build-time
  values in `web/Dockerfile`. Ports default in `mise.toml [env]` and are overridden
  per worktree by the Worktrunk-generated `web/mise.local.toml` (`VITE_PORT_UI` is
  the Vite UI port).
- `infisical run` **overrides** the surrounding env, so each key lives in exactly
  one place — mise *or* Infisical, never both.
- **`_private/` is a local-only volume; never commit a symlink that points outside
  the repo** (the `pre-commit` hook enforces this). Do not commit plaintext dotenv
  files either.
- The dev keyset (which secrets to create) lives in Infisical's `dev` environment.

## Worktrunk

Project Worktrunk config lives in `.config/wt.toml`. New worktrees should be
usable from the repo root and should not depend on private symlink targets.
Branch-specific ports come from Worktrunk's `hash_port` filter.
Do not copy ignored private files between worktrees. Per-worktree values
(randomized ports) come from the Worktrunk-generated `web/mise.local.toml`;
secrets come from `infisical run`, so a fresh worktree needs no env setup.

## Git Practices

Commit messages are checked by the repo-local `commit-msg` hook. From `web/`,
run `mise run git:install-hooks` to set `core.hooksPath=.githooks` for this
clone. The checker lives at `web/scripts/check-commit-msg.sh`.

## Providers

Agents inspect this project's services through CLIs that are **project-scoped**:
they authenticate against this project's accounts, never your global CLI login.
Run each with `mise run <task> -- <args>`; the tasks wrap the CLI in `infisical
run --env=dev`, injecting the token from Infisical's dev environment.

- CLIs are installed by `web/.brewfile`: `flyctl`, `neonctl`,
  `getsentry/tools/sentry` (the new `cli.sentry.dev` CLI for inspection — **not**
  legacy `sentry-cli`; sourcemaps upload via `@sentry/vite-plugin` in the Docker
  build), and `schpet/tap/linear`.
- Agent tokens live in Infisical's **dev** environment (`FLY_API_TOKEN`,
  `NEON_API_KEY`, `SENTRY_AUTH_TOKEN`). Non-secret addresses (`NEON_PROJECT_ID`,
  `SENTRY_ORG`) are in `mise.toml [env]`. There is no `SENTRY_PROJECT` — the CLI
  uses the org-form and the frontend sourcemap project is hard-coded in
  `vite.config.ts`.
- `mise run db -- <psql args>` opens a **read-only** `psql` on the **Neon
  yet-prod** DB, pulling a fresh connection string from Neon at call time (no
  prod URL is stored). The session defaults to read-only transactions, so
  accidental writes fail; it is a soft guard, not a dedicated read-only role.
- Each task self-verifies: if a CLI is missing or a token is wrong, the command
  fails with an obvious error. Run any one (e.g. `mise run fly -- status`) to
  confirm it reaches the right account.

Scoping per provider:

- **Fly** — `FLY_API_TOKEN` (app-scoped deploy token: `fly tokens create deploy
  -a yet-prod`); the app is read from `web/fly.toml`.
- **Neon** — `NEON_API_KEY` scoped to the Yet org, so commands resolve `yet-prod`
  with no org flag. Prefer direct connection strings with `sslmode=require`.
- **Sentry** — `SENTRY_AUTH_TOKEN` (Infisical dev) + `SENTRY_ORG` (`mise.toml
  [env]`); the task sets `SENTRY_FORCE_ENV_TOKEN=1` so the env token beats any
  global login. Two projects — reach them via the org-form: `mise run sentry --
  issues trawler/` (both), `trawler/api` (backend), `trawler/ui` (frontend).
- **Linear** — uses the keyring credential (`linear auth login`) plus
  `web/.linear.toml` (`workspace = "yetapp"`) to stay on the Yet workspace. Do
  **not** set `LINEAR_API_KEY`: a key is bound to its own workspace and would
  override the pin (this is how it ends up on ChartX by mistake).

Never commit a token, connection string, or DSN, and never print them in agent
output.

## Deployment

Production is Fly.io (`yet-prod`, region `iad`) + Neon Free Postgres, served at
`yet.app` / `www.yet.app`.

- `mise run deploy:secrets` syncs prod runtime secrets/config from Infisical's
  **prod** environment to Fly (excludes build-time vars; refuses a non-Neon
  `DATABASE_URL`).
- `mise run deploy` runs `flyctl deploy`, passing the frontend Sentry DSN
  (build-arg) and `SENTRY_AUTH_TOKEN` (build-secret) so the UI build uploads
  sourcemaps; `release_command` migrates. `mise run deploy -- --build-only`
  builds without deploying.
- Use the `fly`/`neon` provider tasks for ad-hoc control-plane work.

`yet.app` DNS is Cloudflare-managed (DNS-only records to Fly). Do not change DNS
unless the Fly deploy is healthy. The technical-preview `cf` CLI could not
resolve account context here, so the cutover used Cloudflare's official DNS API
with a zone-scoped `CLOUDFLARE_API_TOKEN`; keep that token zone-scoped (DNS edit
+ zone read) and make record changes explicit and reviewable.

OAuth exists historically for social account/profile enrichment, not primary
login. Git history shows Twitter was made to work, Facebook was punted, and the
current onboarding/profile buttons that would trigger `/auth/:provider` are
commented out. Keep the `oauth` side-effect category disabled until the social
linking UI is deliberately restored and provider callback URLs are verified for
`yet.app`.

## Safety Notes

- Do not deploy a raw production database dump without an explicit scrub/import
  plan.
- Disable or sandbox outbound side effects before verification and domain
  cutover: SMS, email, Segment, OAuth writes, and scheduled jobs. Re-enable real
  production integrations deliberately after each path is verified.
- Keep README bootstrap instructions in sync with root command changes.
