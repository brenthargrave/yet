use Mix.Config

config :app, AppWeb.Endpoint,
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  # TODO: watcher orphans process: https://bit.ly/3tugRhN
  # watchers: [
  #   yarn: [
  #     "snowpack",
  #     "dev",
  #     "--verbose",
  #     cd: Path.expand("../ui", __DIR__)
  #   ]
  # ],
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
