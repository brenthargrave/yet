defmodule AppWeb.Resolvers.Analytics do
  alias App.Analytics

  def track_event(_parent, args, _resolution) do
    IO.puts(inspect(args))
    %{name: name} = args
    # %{input: %{name: :tap_signup, properties: %{install: %{id: "foo "}}}}
    {:error, "TODO"}
    # TODO: insert event
    # TODO: segment

    case Analytics.create_event() do
      # TODO: nil? errors?
      # nil ->
      event ->
        {:ok, event}
    end
  end

  def events(_parent, _args, _resolution) do
    {:ok, App.Analytics.list_events()}
  end
end
