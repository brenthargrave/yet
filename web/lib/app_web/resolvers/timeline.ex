defmodule AppWeb.Resolvers.Timeline do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  alias App.Conversation
  # alias App.Timeline
  require Logger

  typedstruct module: TimelinePayload do
    field(:events, list(Conversation.t()))
  end

  defun get_timeline(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(TimelinePayload.t()) do
    # Conversations.get_conversations(customer)
    # |> fmap(&%ConversationsPayload{conversations: &1})
  end

  def get_timeline(_parent, _args, _resolution) do
    ok([])
  end
end
