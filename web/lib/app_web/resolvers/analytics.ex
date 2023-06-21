defmodule AppWeb.Resolvers.Analytics do
  require Logger
  alias App.Analytics
  use Brex.Result

  def track_event(_parent, %{input: input}, _resolution) do
    input
    |> Recase.Enumerable.convert_keys(&Recase.to_snake/1)
    |> Analytics.track_event()
  end

  def events(_parent, _args, _resolution) do
    {:ok, App.Analytics.list_events()}
  end
end
