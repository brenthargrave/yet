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

    %Segment.Analytics.Track{
      timestamp: timestamp,
      anonymousId: anonymousId,
      userId: userId,
      event: eventName,
      properties: properties
    }
    |> Segment.Analytics.track()

    event
  end

  def identify(customer) do
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

    customer
  end
end
