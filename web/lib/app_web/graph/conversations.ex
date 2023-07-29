defmodule AppWeb.Graph.Conversations do
  use Absinthe.Schema.Notation

  alias AppWeb.Resolvers.{
    Conversations
  }

  alias App.{
    Conversation,
    UserError
  }

  object :invitee do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:is_contact, non_null(:boolean))
  end

  enum :conversation_status do
    value(:draft, as: :draft)
    value(:proposed, as: :proposed)
    value(:joined, as: :joined)
    value(:deleted, as: :deleted)
  end

  object :participation do
    field(:id, non_null(:id))
    field(:conversation_id, non_null(:id))
    field(:participant, non_null(:profile))
    field(:occurred_at, non_null(:datetime))
  end

  input_object :participate_input do
    field(:id, non_null(:id))
    field(:conversation_url, non_null(:string))
  end

  object :conversation do
    field(:id, non_null(:id))
    field(:creator, non_null(:profile))
    field(:invitees, non_null(list_of(non_null(:invitee))))
    field(:status, non_null(:conversation_status))
    field(:occurred_at, non_null(:datetime))
    field(:inserted_at, :datetime)
    field(:deleted_at, :datetime)
    field(:participations, non_null(list_of(non_null(:participation))))
    field(:opps, non_null(list_of(non_null(:opp))))
    field(:notes, non_null(list_of(non_null(:note))))
  end

  input_object :invitee_input do
    field(:name, non_null(:string))
    field(:id, non_null(:string))
    field(:is_contact, non_null(:boolean))
  end

  input_object :conversation_input do
    field(:id, non_null(:string))
    field(:invitees, non_null(list_of(non_null(:invitee_input))))
    field(:occurred_at, non_null(:datetime))
    field(:status, :conversation_status)
  end

  object :conversation_payload do
    field(:conversation, :conversation)
    field(:user_error, :user_error)
  end

  union :conversation_result do
    types([:conversation, :user_error])

    resolve_type(fn
      %Conversation{}, _ ->
        :conversation

      %UserError{}, _ ->
        :user_error
    end)
  end

  object :conversations_payload do
    field(:conversations, non_null(list_of(non_null(:conversation))))
  end

  input_object :delete_conversation_input do
    field(:id, non_null(:string))
    field(:deleted_at, :datetime)
  end

  input_object :propose_input do
    field(:id, non_null(:id))
    field(:proposed_at, :datetime)
  end

  object :conversations_mutations do
    field :upsert_conversation, :conversation_result do
      arg(:input, non_null(:conversation_input))
      resolve(&Conversations.upsert_conversation/3)
    end

    field :delete_conversation, :conversation_result do
      arg(:input, non_null(:delete_conversation_input))
      resolve(&Conversations.delete_conversation/3)
    end

    field :propose, :conversation_result do
      arg(:input, non_null(:propose_input))
      resolve(&Conversations.propose_conversation/3)
    end

    field :participate, :conversation_result do
      arg(:input, non_null(:participate_input))
      resolve(&Conversations.join_conversation/3)
    end
  end

  object :conversations_queries do
    field :get_conversation, :conversation_result do
      arg(:id, non_null(:id))
      resolve(&Conversations.get_conversation/3)
    end

    field :get_conversations, :conversations_payload do
      resolve(&Conversations.get_conversations/3)
    end
  end

  input_object :conversation_changed_input do
    field(:id, non_null(:id))
  end

  input_object :conversation_joined_input do
    field(:conversation_id, non_null(:id))
  end

  object :conversations_subscriptions do
    field :conversation_changed, :conversation do
      arg(:input, non_null(:conversation_changed_input))

      config(fn args, _ ->
        {:ok, topic: args.input.id}
      end)

      resolve(fn conversation, _, _ ->
        {:ok, conversation}
      end)
    end

    field :conversation_joined, :participation do
      arg(:input, non_null(:conversation_joined_input))

      config(fn args, _ ->
        {:ok, topic: args.input.conversation_id}
      end)

      resolve(fn p, _, _ ->
        {:ok, p}
      end)
    end
  end
end
