defmodule AppWeb.Resolvers.Analytics do
  alias App.Analytics

  def track_event(_parent, %{input: input}, _resolution) do
    %{name: name, anon_id: anon_id} = input
    name = Recase.to_snake(name)

    # TODO: Analytics.track_event
    case Analytics.create_event(%{name: name, anon_id: anon_id}) do
      {:ok, event} ->
        {:ok, event}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  def events(_parent, _args, _resolution) do
    {:ok, App.Analytics.list_events()}
  end
end
