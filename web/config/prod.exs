import Config

config :app, AppWeb.Endpoint,
  # TODO: restore
  # cache_static_manifest: "priv/static/cache_manifest.json",
  force_ssl: [rewrite_on: [:x_forwarded_proto]],
  url: [scheme: "https", port: 443]

config :logger, level: :info

config :app, App.Repo, ssl: true
