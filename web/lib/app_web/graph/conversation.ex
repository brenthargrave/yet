defmodule AppWeb.Graph.Conversation do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers

  object :contact do
    field(:id, non_null(:string))
    field(:name, non_null(:string))
    field(:org, non_null(:string))
    field(:role, non_null(:string))
  end

  object :invitee do
    field(:name, non_null(:string))
    field(:id, :string)
  end

  enum :conversation_state do
    value(:draft, as: "draft")
    value(:abandoned, as: "abandoned")
    value(:cosigned, as: "cosigned")
  end

  object :conversation do
    field(:id, non_null(:string))
    field(:invitees, non_null(list_of(non_null(:invitee))))
    field(:state, non_null(:conversation_state))
  end

  input_object :invitee_input do
    field(:name, non_null(:string))
    field(:id, :string)
  end

  input_object :conversation_input do
    field(:id, non_null(:string))
    field(:invitees, non_null(list_of(non_null(:invitee_input))))
  end

  object :conversation_queries do
    field :contacts, non_null(list_of(non_null(:contact))) do
      resolve(fn _parents, _args, _resolution -> {:ok, []} end)
    end
  end

  object :conversation_mutations do
    field :upsert_conversation, :conversation do
      arg(:input, non_null(:conversation_input))
      resolve(&Resolvers.Conversation.upsert/3)
    end
  end
end
