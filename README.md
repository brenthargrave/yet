# Yet

**A trusted referral network built on real conversations.**

→ [yet.app](https://yet.app)

## Tech

- [Elixir](https://elixir-lang.org/) + [Phoenix](https://www.phoenixframework.org/)
- [Absinthe](https://absinthe-graphql.org/) [GraphQL](https://graphql.org/)
- [Cycle.js](https://cycle.js.org/) + [RxJS](https://rxjs.dev/)
- [PostgreSQL](https://www.postgresql.org/)

## Repository

| Path | What |
| --- | --- |
| `web/` | The Phoenix app — Mix project, web UI (`web/ui/`), tests, deploy config. |
| `AGENTS.md` | How coding agents work here: setup, provider CLIs, deployment, safety. |
| `.config/` | Worktrunk worktree configuration. |

## Local development

Setup is documented in [`web/README.md`](./web/README.md). Note that secrets live
in Yet's private Infisical project, so a full local run needs access to it — the
code here is published for inspection.

## License

Source-available under the [GNU AGPL-3.0](./LICENSE).
