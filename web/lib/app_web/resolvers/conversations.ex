defmodule AppWeb.Resolvers.Conversations do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  # import ShorterMaps
  alias App.Conversations
  alias App.Conversation
  alias App.UserError
  require Logger

  typedstruct module: ConversationPayload do
    field(:conversation, Conversation.t())
    field(:user_error, UserError.t())
  end

  defun upsert_conversation(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ConversationPayload.t()) do
    Conversations.upsert_conversation(customer, input)
    |> fmap(&%ConversationPayload{conversation: &1})
  end

  defun get_conversation(
          _parent,
          %{id: id} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ConversationPayload.t()) do
    Conversations.get_conversation(id, customer)
    |> fmap(&%ConversationPayload{conversation: &1})
    |> convert_error(:not_found, %ConversationPayload{
      user_error: %UserError{message: "Not found", code: :not_found}
    })
    |> convert_error(:unauthorized, %ConversationPayload{
      user_error: %UserError{message: "Unauthorized", code: :unauthorized}
    })
  end

  defun delete_conversation(
          _parent,
          %{input: %{id: id}} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ConversationPayload.t()) do
    Conversations.delete_conversation(id, customer)
    |> fmap(&%ConversationPayload{conversation: &1})
    |> convert_error(:not_found, %ConversationPayload{
      user_error: %UserError{message: "Not found", code: :not_found}
    })
    |> convert_error(:unauthorized, %ConversationPayload{
      user_error: %UserError{message: "Unauthorized", code: :unauthorized}
    })
  end

  typedstruct module: ConversationsPayload do
    field(:conversations, list(Conversation.t()))
  end

  defun get_conversations(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ConversationsPayload.t()) do
    Conversations.get_conversations(customer)
    |> fmap(&%ConversationsPayload{conversations: &1})
  end
end
