use Mix.Config

config :app, AppWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  force_ssl: [rewrite_on: [:x_forwarded_proto]],
  url: [scheme: "https", port: 443],
  https: [
    port: System.get_env("PORT_SSL"),
    cipher_suite: :strong,
    keyfile: "priv/cert/localhost-key.pem",
    certfile: "priv/cert/localhost-cert.pem"
  ]

config :logger, level: :info

# config :app, App.Repo, ssl: true
