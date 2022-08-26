defmodule AppWeb.Resolvers.Timeline do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  alias App.{Timeline, TimelineEvent}
  require Logger

  typedstruct module: TimelinePayload do
    field(:events, list(TimelineEvent.t()))
  end

  defun get_timeline(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(TimelinePayload.t()) do
    Timeline.get_events(customer)
    |> fmap(&%TimelinePayload{events: &1})
    |> IO.inspect()
  end

  def get_timeline(_parent, _args, _resolution) do
    {:ok, []}
    |> fmap(&%TimelinePayload{events: &1})
  end
end
