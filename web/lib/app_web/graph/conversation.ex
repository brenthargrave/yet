defmodule AppWeb.Graph.Conversation do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers

  object :contact do
    field(:name, non_null(:string))
    field(:org, non_null(:string))
    field(:role, non_null(:string))
  end

  object :conversation_queries do
    field :contacts, non_null(list_of(non_null(:contact))) do
      resolve(&contacts/3)
    end
  end

  defp contacts(_parent, _args, _resolution) do
    {:ok, []}
  end
end
