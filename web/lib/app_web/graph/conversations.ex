defmodule AppWeb.Graph.Conversations do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Conversations

  object :contact do
    field(:id, non_null(:string))
    field(:name, non_null(:string))
    field(:org, non_null(:string))
    field(:role, non_null(:string))
  end

  object :invitee do
    field(:name, non_null(:string))
    field(:id, non_null(:string))
  end

  enum :conversation_state do
    value(:draft, as: "draft")
    value(:abandoned, as: "abandoned")
    value(:cosigned, as: "cosigned")
  end

  object :conversation do
    field(:id, non_null(:string))
    field(:invitees, non_null(list_of(non_null(:invitee))))
    # TODO # field(:state, non_null(:conversation_state))
  end

  input_object :invitee_input do
    field(:name, non_null(:string))
    field(:id, non_null(:string))
  end

  input_object :conversation_input do
    field(:id, non_null(:string))
    field(:invitees, non_null(list_of(non_null(:invitee_input))))
  end

  object :conversation_payload do
    field(:conversation, :conversation)
    field(:user_error, :user_error)
  end

  object :conversations_payload do
    field(:conversations, non_null(list_of(non_null(:conversation))))
  end

  object :conversations_mutations do
    field :upsert_conversation, :conversation_payload do
      arg(:input, non_null(:conversation_input))
      resolve(&Conversations.upsert_conversation/3)
    end
  end

  object :conversations_queries do
    field :get_conversation, :conversation_payload do
      arg(:id, non_null(:id))
      resolve(&Conversations.get_conversation/3)
    end

    field :get_conversations, :conversations_payload do
      resolve(&Conversations.get_conversations/3)
    end

    field :contacts, non_null(list_of(non_null(:contact))) do
      resolve(fn _parents, _args, _resolution -> {:ok, []} end)
    end
  end
end
