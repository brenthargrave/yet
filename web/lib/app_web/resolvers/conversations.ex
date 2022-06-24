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

  # defun upsert_conversation(
  #         _parent,
  #         %{input: input} = _args,
  #         %{context: %{customer: customer}} = _resolution
  #       ) :: resolver_result(ConversationPayload.t()) do
  #   IO.puts("INPUT")
  #   IO.puts(inspect(input))

  #   Conversations.upsert_conversation(customer, input)
  #   |> fmap(&%ConversationPayload{conversation: &1})
  # end
  def upsert_conversation(
        _parent,
        %{input: input} = _args,
        %{context: %{customer: customer}} = _resolution
      ) do
    Conversations.upsert_conversation(customer, input)
    |> fmap(&%ConversationPayload{conversation: &1})
  end

  defun find_conversation(
          _parent,
          %{id: id} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(Conversation.t()) do
    Conversations.find_conversation(id, customer)
  end
end
