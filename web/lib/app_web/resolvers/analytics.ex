defmodule AppWeb.Resolvers.Analytics do
  alias App.Analytics

  def track_event(_parent, %{input: %{name: name}}, _resolution) do
    Analytics.create_event(%{name: name})
    # TODO: segment
  end

  def events(_parent, _args, _resolution) do
    {:ok, App.Analytics.list_events()}
  end
end
