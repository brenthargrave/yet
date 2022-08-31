use Mix.Config

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
      "./dev.mjs",
      cd: Path.expand("../ui", __DIR__)
    ]
  ],
  https: [
    port: System.get_env("PORT_SSL"),
    cipher_suite: :strong,
    keyfile: "priv/cert/localhost-key.pem",
    certfile: "priv/cert/localhost-cert.pem"
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :absinthe,
  log: false

config :absinthe, Absinthe.Logger, pipeline: true
