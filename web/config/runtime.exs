import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.

      For the first redeploy, this should be the direct Neon Postgres
      connection string with sslmode=require. Use the direct URL for migrations;
      only switch to Neon's pooled URL if connection pressure proves it is
      needed.
      """

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.

      Generate one with:

          mix phx.gen.secret
      """

  host =
    System.get_env("PHX_HOST") ||
      System.get_env("HOST") ||
      raise """
      environment variable PHX_HOST or HOST is missing.
      """

  port = String.to_integer(System.get_env("PORT") || "4000")
  pool_size = String.to_integer(System.get_env("POOL_SIZE") || "5")
  database_host = URI.parse(database_url).host

  config :app, App.Repo,
    url: database_url,
    pool_size: pool_size,
    ssl: true,
    ssl_opts: [
      verify: :verify_peer,
      cacertfile: CAStore.file_path(),
      server_name_indication: String.to_charlist(database_host),
      customize_hostname_check: [
        match_fun: :public_key.pkix_verify_hostname_match_fun(:https)
      ]
    ]

  config :app, AppWeb.Endpoint,
    http: [
      ip: {0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base,
    server: true,
    url: [
      scheme: "https",
      host: host,
      port: 443
    ]
end
