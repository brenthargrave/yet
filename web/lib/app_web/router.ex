defmodule AppWeb.Router do
  use AppWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug(:accepts, ["json"])
    plug(:fetch_session)
    plug(:put_secure_browser_headers)
  end

  pipeline :authenticate do
    plug(AppWeb.Plug.Authenticate)
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through([:fetch_session, :protect_from_forgery])
      live_dashboard("/dashboard", metrics: AppWeb.Telemetry)
    end
  end

  pipeline :graphql do
    plug(AppWeb.DevPlug)
    plug(AppWeb.Graph.Context)
  end

  scope "/graphql" do
    pipe_through(:graphql)

    forward(
      "/",
      Absinthe.Plug,
      schema: AppWeb.Graph.Schema
    )
  end

  # https://goo.gl/4Q9MEx
  forward(
    "/graphiql",
    Absinthe.Plug.GraphiQL,
    schema: AppWeb.Graph.Schema,
    socket: AppWeb.UserSocket,
    interface: :advanced
  )

  # https://github.com/swoosh/swoosh#mailbox-preview-in-the-browser
  if Mix.env() in [:dev, :test] do
    scope "/dev" do
      pipe_through([:browser, :authenticate])
      forward("/mailbox", Plug.Swoosh.MailboxPreview)
      # email previews
      get("/digest", AppWeb.EmailController, :digest)
    end
  end

  scope "/auth", AppWeb do
    pipe_through([:browser])

    get("/:provider", AuthController, :request)
    get("/:provider/callback", AuthController, :callback)
  end

  scope "/api", AppWeb do
    pipe_through([:api])

    post("/session_create", AuthController, :session_create)
    post("/session_delete", AuthController, :session_delete)

    if Mix.env() in [:dev, :test] do
      get("/notifications", TestController, :notifications)
    end
  end

  scope "/", AppWeb do
    pipe_through([:browser])

    get("/privacy", PageController, :privacy)
    get("/terms", PageController, :terms)
    get("/deletion", PageController, :deletion)
    get("/*path", PageController, :index, as: :root)
  end
end
