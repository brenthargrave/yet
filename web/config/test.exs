import Config

# NOTE: default generated config
# config :app, AppWeb.Endpoint, server: false
# config :logger, level: :warn

# NOTE: reuse dev config for api/webpack servers
import_config "dev.exs"

config :app, App.Repo,
  pool: Ecto.Adapters.SQL.Sandbox,
  sql_sandbox: true

# config :logger, :console, level: :warn
config :logger, :console, level: :debug
