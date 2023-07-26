import Config

config :app, AppWeb.Endpoint,
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [
    yarn: [
      "watch:graph",
      cd: Path.expand("..", __DIR__)
    ],
    node: [
      "./node_modules/vite/bin/vite.js",
      cd: Path.expand("../ui", __DIR__)
    ]
  ],
  https: [
    port: System.get_env("PORT_SSL"),
    cipher_suite: :strong,
    keyfile: "priv/cert/localhost-key.pem",
    certfile: "priv/cert/localhost-cert.pem"
  ],
  # NOTE: see https://github.com/slime-lang/phoenix_slime_example/blob/8841c7a24c8a7ef1a06103472638c1515aa74d04/config/dev.exs
  live_reload: [
    patterns: [
      ~r{priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$},
      ~r{lib/app_web/views/.*(ex)$},
      ~r{lib/app_web/templates/.*(eex|slim|md)$},
      ~r{lib/app/email/.*(ex|slim)$}
    ]
  ]

config :slime, :keep_lines, true

# Do not include metadata nor timestamps in development logs
config :logger, :console,
  format: "[$level] $message\n",
  level:
    System.get_env("DEV_LOG_LEVEL", "error")
    |> String.to_atom()

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :absinthe,
  log: true

config :absinthe, Absinthe.Logger, pipeline: true

# config :app, App.Email.Mailer, adapter: Swoosh.Adapters.Local

# NOTE: code reload on mjml
# https://github.com/falood/exsync#config
config :exsync, extensions: [".mjml.slim"]
