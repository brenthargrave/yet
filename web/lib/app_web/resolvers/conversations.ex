defmodule AppWeb.Resolvers.Conversations do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
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
        ) :: resolver_result(Conversation.t()) do
    Conversations.upsert_conversation(customer, input)
  end

  defun delete_conversation(
          _parent,
          %{input: %{id: id}} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(Conversation.t()) do
    Conversations.delete_conversation(id, customer)
  end

  defun propose_conversation(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(Conversation.t()) do
    Conversations.propose_conversation(customer, input)
  end

  defun get_conversation(
          _parent,
          %{id: id} = _args,
          %{context: context} = _resolution
        ) :: resolver_result(Conversation.t()) do
    # NOTE: customer is optional, not available when lurking (unauth'd)
    customer = Map.get(context, :customer)
    Conversations.get_conversation(id, customer)
  end

  defun join_conversation(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ConversationPayload.t()) do
    Conversations.join_conversation(customer, input)
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

  def get_conversations(_parent, _args, _resolution) do
    ok([])
  end
end
