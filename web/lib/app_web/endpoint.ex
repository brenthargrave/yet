defmodule AppWeb.Endpoint do
  use Sentry.PlugCapture
  use Phoenix.Endpoint, otp_app: :app
  use Absinthe.Phoenix.Endpoint

  # supports UX tests
  if System.get_env("MIX_ENV") == "test" do
    plug(Phoenix.Ecto.SQL.Sandbox,
      at: "/sandbox",
      repo: App.Repo,
      timeout: 60_000 * 10
      # header: "sandbox"
    )
  end

  plug(Corsica, origins: "*")

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_app_key",
    signing_salt: "lrelcTN2",
    # 100 years
    max_age: 24 * 60 * 60 * 365 * 100,
    encryption_salt: System.get_env("PHX_ENCRYPTION_SALT")
  ]

  socket("/socket", AppWeb.UserSocket,
    # NOTE: https://bit.ly/3DXAu6Q
    websocket: [timeout: 45_000],
    longpoll: false
  )

  socket("/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]])

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug(Plug.Static,
    at: "/",
    from: :app,
    # TODO: restore w/ vite compat
    # only_matching: ~w(css fonts images js favicon.ico robots.txt)
    gzip: true
  )

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug(Phoenix.CodeReloader)
    plug(Phoenix.Ecto.CheckRepoStatus, otp_app: :app)
  end

  plug(Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"
  )

  plug(Plug.RequestId)
  plug(Plug.Telemetry, event_prefix: [:phoenix, :endpoint])

  plug(Sentry.PlugTunnel, at: "/api/sentry")

  plug(Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json, Absinthe.Plug.Parser],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()
  )

  plug(Sentry.PlugContext)
  plug(Plug.MethodOverride)
  plug(Plug.Head)
  plug(Plug.Session, @session_options)
  plug(AppWeb.Router)
end
