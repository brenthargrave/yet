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
    field(:contact_id, :string)
  end

  object :conversation do
    field(:id, non_null(:string))
    field(:invitees, non_null(list_of(non_null(:invitee))))
  end

  input_object :invitee_input do
    field(:name, non_null(:string))
    field(:contact_id, :string)
  end

  input_object :conversation_input do
    field(:invitees, non_null(list_of(non_null(:invitee_input))))
  end

  object :conversation_queries do
    field :contacts, non_null(list_of(non_null(:contact))) do
      resolve(&contacts/3)
    end
  end

  object :conversation_mutations do
    field :upsert_conversation, :conversation do
      arg(:input, non_null(:conversation_input))
      # resolve(&Resolvers.Analytics.track_event/3)
      resolve({:ok, {}})
    end
  end

  defp contacts(_parent, _args, _resolution) do
    {:ok, []}
  end
end
