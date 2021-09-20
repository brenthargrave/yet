use Mix.Config

config :app,
  ecto_repos: [App.Repo]

config :app, AppWeb.Endpoint,
  http: [port: System.get_env("PORT")],
  # render_errors: [view: AppWeb.ErrorView, accepts: ~w(html json)],
  render_errors: [view: AppWeb.ErrorView, accepts: ~w(json), layout: false],
  secret_key_base: System.get_env("SECRET_KEY_BASE"),
  url: [scheme: System.get_env("SCHEME"), host: System.get_env("HOST")],
  pubsub_server: App.PubSub,
  live_view: [signing_salt: "VQGs/BUT"]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

config :app, App.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")

 config :phoenix, :template_engines,
    slim: PhoenixSlime.Engine,
    slime: PhoenixSlime.Engine

config :vite_phx,
  release_app: :app,
  environment: Mix.env(),
  vite_manifest: "priv/static/manifest.json"

import_config "#{Mix.env()}.exs"
