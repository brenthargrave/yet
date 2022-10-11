import Config

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
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  migration_primary_key: [name: :id, type: :binary_id],
  migration_timestamps: [type: :utc_datetime_usec]

config :phoenix, :template_engines,
  slim: PhoenixSlime.Engine,
  slime: PhoenixSlime.Engine

config :vite_phx,
  release_app: :app,
  environment: Mix.env(),
  vite_manifest: "priv/static/manifest.json"

config :ex_twilio,
  account_sid: {:system, "TWILIO_ACCOUNT_SID"},
  auth_token: {:system, "TWILIO_AUTH_TOKEN"}

config :sentry,
  dsn: {:system, "SENTRY_DSN_API"},
  included_environments: [:prod],
  environment_name: Mix.env(),
  enable_source_code_context: true,
  root_source_code_path: File.cwd!()

config :app, App.Scheduler,
  jobs: [
    daily_update: [
      schedule: "@hourly",
      # schedule: {:extended, "*/30"},
      task: {App.Scheduler, :daily_update, []}
    ]
  ]

config :app, App.Email.Mailer,
  adapter: Swoosh.Adapters.Postmark,
  api_key: {:system, "POSTMARK_API_KEY"}

# adapter: Swoosh.Adapters.Mailgun,
# api_key: {:system, "MAILGUN_API_KEY"},
# domain: {:system, "MAILGUN_DOMAIN"}
# adapter: Swoosh.Adapters.Sendgrid,
# api_key: {:system, "SENDGRID_API_KEY"}

import_config "#{Mix.env()}.exs"
