defmodule AppWeb.Router do
  use AppWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
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

  scope "/", AppWeb do
    pipe_through(:browser)

    get("/*path", PageController, :index, as: :root)
  end
end
