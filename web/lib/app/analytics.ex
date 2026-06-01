defmodule App.Analytics do
  import Ecto.Query, warn: false
  alias App.{Repo}
  alias App.Analytics.Event
  use Brex.Result
  use Croma

  def list_events do
    Repo.all(Event)
  end

  defun track_event(attrs \\ %{}) :: Brex.Result.s(Event.t()) do
    %Event{}
    |> Event.changeset(attrs)
    |> Repo.insert()
    |> fmap(&send_track(&1))
  end

  defun send_track(event :: Event.t()) :: Event.t() do
    %{
      name: eventName,
      customer_id: userId,
      anon_id: anonymousId,
      properties: properties,
      occurred_at: timestamp
    } = event

    if App.SideEffects.enabled?(:segment) do
      %Segment.Analytics.Track{
        timestamp: timestamp,
        anonymousId: anonymousId,
        userId: userId,
        event: eventName,
        properties: properties
      }
      |> Segment.Analytics.track()
    end

    event
  end

  def identify(customer) do
    if App.SideEffects.enabled?(:segment) do
      send_identify(customer)
    end

    customer
  end

  defp send_identify(customer) do
    id = customer.id

    traits =
      customer
      |> Map.from_struct()
      |> Map.take([
        :e164,
        :email,
        :name,
        :first_name,
        :last_name,
        :twitter_handle,
        :digest
      ])

    Segment.Analytics.identify(id, traits)
  end
end
