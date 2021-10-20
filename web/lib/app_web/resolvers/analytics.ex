defmodule AppWeb.Resolvers.Analytics do
  alias App.Analytics

  def track_event(_parent, %{input: input}, _resolution) do
    IO.puts(inspect(input))
    %{name: name} = input
    name = Recase.to_snake(name)

    # TODO: Analytics.track_event
    case Analytics.create_event(%{name: name}) do
      {:ok, event} ->
        {:ok, %{event: event}}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  def events(_parent, _args, _resolution) do
    {:ok, App.Analytics.list_events()}
  end
end
