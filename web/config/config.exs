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

filter_fields = ["password", "secret", "token"]
config :phoenix, :filter_parameters, filter_fields
config :absinthe, Absinthe.Logger, filter_variables: filter_fields

config :phoenix, :json_library, Jason

config :app, App.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  migration_primary_key: [name: :id, type: :binary_id],
  migration_timestamps: [type: :utc_datetime_usec]

config :phoenix, :template_engines,
  slim: PhoenixSlime.Engine,
  slime: PhoenixSlime.Engine,
  md: PhoenixMarkdown.Engine

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
  root_source_code_path: File.cwd!(),
  filter: App.SentryEventFilter

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

config :phoenix_markdown, :earmark, %{
  gfm: true,
  breaks: true
}

config :ueberauth, Ueberauth,
  providers: [
    twitter:
      {Ueberauth.Strategy.Twitter,
       [
         callback_params: ["auth_id"]
       ]},
    facebook:
      {Ueberauth.Strategy.Facebook,
       [
         callback_params: ["auth_id"],
         default_scope: "email,public_profile,user_link"
         #  profile_fields: "name,email,first_name,last_name"
       ]}
  ]

config :ueberauth, Ueberauth.Strategy.Twitter.OAuth,
  consumer_key: System.get_env("TWITTER_CONSUMER_KEY"),
  consumer_secret: System.get_env("TWITTER_CONSUMER_SECRET")

config :ueberauth, Ueberauth.Strategy.Facebook.OAuth,
  client_id: System.get_env("FACEBOOK_CLIENT_ID"),
  client_secret: System.get_env("FACEBOOK_CLIENT_SECRET")

import_config "#{Mix.env()}.exs"
