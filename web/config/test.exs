import Config

# NOTE: default generated config
# config :app, AppWeb.Endpoint, server: false
# config :logger, level: :warn

# NOTE: reuse dev config for api/webpack servers
import_config "dev.exs"

# 5 minutes
timeout = 60_000 * 10

config :app, App.Repo,
  ownership_timeout: timeout,
  timeout: timeout,
  pool: Ecto.Adapters.SQL.Sandbox,
  sql_sandbox: true

config :logger, :console, level: String.to_atom(System.get_env("TEST_LOG_LEVEL") || "warn")

config :segment, send_to_http: false
