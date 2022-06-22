defmodule AppWeb.Resolvers.Conversations do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  # import ShorterMaps
  alias App.Conversations
  alias App.Conversation
  alias App.UserError

  typedstruct module: ConversationPayload do
    field :conversation, Conversation.t()
    field :user_error, UserError.t()
  end

  defun upsert_conversation(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ConversationPayload.t()) do
    # ! TODO: resolve arbitrary upstream errors to absinthe format?
    Conversations.upsert_conversation(input, customer)
    |> fmap(&%ConversationPayload{conversation: &1})
  end
end
