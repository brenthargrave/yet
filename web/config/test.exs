import Config

# NOTE: default generated config
# config :app, AppWeb.Endpoint, server: false
# config :logger, level: :warn

# NOTE: reuse dev config for api/webpack servers
import_config "dev.exs"

config :app, App.Repo,
  pool: Ecto.Adapters.SQL.Sandbox,
  sql_sandbox: true,
  ownership_timeout: String.to_integer(System.get_env("ECTO_OWNERSHIP_TIMEOUT")) || 3_600_000

config :logger, :console,
  level: String.to_atom(System.get_env("TEST_LOG_LEVEL", "debug")) || :debug

config :segment, send_to_http: false
