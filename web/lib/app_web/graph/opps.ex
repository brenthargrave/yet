defmodule AppWeb.Graph.Opps do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Conversations
  import_types(Absinthe.Type.Custom)

  object :opp do
    field(:id, non_null(:id))
    field(:role, non_null(:string))
    field(:org, non_null(:string))
    field(:desc, :string)
  end

  object :opps_payload do
    field(:opps, non_null(list_of(non_null(:opp))))
  end

  object :opps_queries do
    field :get_opps, :opps_payload do
      resolve(&Opps.get_opps/3)
    end
  end

  object :opp_mutations do
  end
end
