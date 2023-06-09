defmodule AppWeb.Graph.Conversations do
  use Absinthe.Schema.Notation
  import_types(Absinthe.Type.Custom)

  alias AppWeb.Resolvers.{
    Conversations,
    Profiles
  }

  object :invitee do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
    field(:is_contact, non_null(:boolean))
  end

  enum :conversation_status do
    value(:draft, as: :draft)
    value(:proposed, as: :proposed)
    value(:signed, as: :signed)
    value(:deleted, as: :deleted)
  end

  object :signature do
    field(:id, non_null(:id))
    field(:conversation_id, non_null(:id))
    field(:signed_at, non_null(:datetime))
    field(:signer, non_null(:profile))
  end

  object :review do
    field(:id, non_null(:id))
    field(:conversation_id, non_null(:id))
    field(:reviewer, non_null(:profile))
    field(:inserted_at, non_null(:datetime))
  end

  object :conversation do
    field(:id, non_null(:id))
    field(:creator, non_null(:profile))
    field(:invitees, non_null(list_of(non_null(:invitee))))
    field(:note, :string)
    field(:status, non_null(:conversation_status))
    field(:occurred_at, non_null(:datetime))
    field(:inserted_at, :datetime)
    field(:deleted_at, :datetime)
    field(:signatures, non_null(list_of(non_null(:signature))))
    field(:reviews, non_null(list_of(non_null(:review))))
    field(:opps, non_null(list_of(non_null(:opp))))
  end

  input_object :invitee_input do
    field(:name, non_null(:string))
    field(:id, non_null(:string))
    field(:is_contact, non_null(:boolean))
  end

  input_object :mention_input do
    field(:id, non_null(:id))
    field(:opp_id, non_null(:id))
  end

  input_object :conversation_input do
    field(:id, non_null(:string))
    field(:invitees, non_null(list_of(non_null(:invitee_input))))
    field(:occurred_at, non_null(:datetime))
    field(:note, :string)
    field(:status, :conversation_status)
    field(:mentions, non_null(list_of(non_null(:mention_input))))
  end

  object :conversation_payload do
    field(:conversation, :conversation)
    field(:user_error, :user_error)
  end

  object :conversations_payload do
    field(:conversations, non_null(list_of(non_null(:conversation))))
  end

  input_object :delete_conversation_input do
    field(:id, non_null(:string))
    field(:deleted_at, :datetime)
  end

  input_object :sign_input do
    field(:id, non_null(:id))
    field(:signed_at, :datetime)
    field(:conversation_url, non_null(:string))
  end

  input_object :propose_input do
    field(:id, non_null(:id))
    field(:proposed_at, :datetime)
  end

  input_object :review_input do
    field(:id, non_null(:id))
  end

  input_object :conversation_changed_input do
    field(:id, non_null(:id))
  end

  object :conversations_mutations do
    field :upsert_conversation, :conversation_payload do
      arg(:input, non_null(:conversation_input))
      resolve(&Conversations.upsert_conversation/3)
    end

    field :delete_conversation, :conversation_payload do
      arg(:input, non_null(:delete_conversation_input))
      resolve(&Conversations.delete_conversation/3)
    end

    field :sign, :conversation_payload do
      arg(:input, non_null(:sign_input))
      resolve(&Conversations.sign_conversation/3)
    end

    field :propose, :conversation_payload do
      arg(:input, non_null(:propose_input))
      resolve(&Conversations.propose_conversation/3)
    end

    field :review, :conversation_payload do
      arg(:input, non_null(:review_input))
      resolve(&Conversations.review_conversation/3)
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

    field :contacts, non_null(list_of(non_null(:profile))) do
      resolve(&Profiles.get_contacts/3)
    end
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
  end
end
