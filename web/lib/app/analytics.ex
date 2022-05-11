defmodule App.Analytics do
  import Ecto.Query, warn: false
  alias App.Repo
  alias App.Analytics.Event

  def list_events do
    Repo.all(Event)
  end

  def create_event(attrs \\ %{}) do
    # TODO: track_event (call segment)
    %Event{}
    |> Event.changeset(attrs)
    |> Repo.insert()
  end
end
