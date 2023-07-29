# https://docs.sentry.io/platforms/elixir/#filtering-events
defmodule App.SentryEventFilter do
  @behaviour Sentry.EventFilter

  def exclude_exception?(%Phoenix.NotAcceptableError{}, :plug), do: true
  def exclude_exception?(%Phoenix.Router.NoRouteError{}, :plug), do: true
  def exclude_exception?(%Plug.Static.InvalidPathError{}, :plug), do: true
  def exclude_exception?(_exception, _source), do: false
end
