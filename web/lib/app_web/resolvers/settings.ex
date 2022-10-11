defmodule AppWeb.Resolvers.Settings do
  require Logger
  use Brex.Result

  alias App.Settings

  def unsubscribe(_parent, %{input: input}, _resolution) do
    input
    |> Settings.unsubscribe()
  end
end
