defmodule App.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    Logger.add_backend(Sentry.LoggerBackend)

    children = [
      # Start the Ecto repository
      App.Repo,
      # Start the Telemetry supervisor
      AppWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: App.PubSub},
      # Start the Endpoint (http/https)
      AppWeb.Endpoint,
      # Start a worker by calling: App.Worker.start_link(arg)
      # {App.Worker, arg}
      {Segment, System.get_env("SEGMENT_WRITE_KEY")},
      {Absinthe.Subscription, AppWeb.Endpoint},

      # https://dockyard.com/blog/2016/05/02/phoenix-tips-and-tricks
      {Task.Supervisor, name: App.TaskSupervisor},

      App.Scheduler
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: App.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    AppWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
