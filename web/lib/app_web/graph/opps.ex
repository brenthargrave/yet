defmodule AppWeb.Graph.Opps do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Opps

  object :opp do
    field(:id, non_null(:id))
    field(:role, non_null(:string))
    field(:org, non_null(:string))
    field(:desc, :string)
    field(:creator, non_null(:contact))
  end

  object :opps_payload do
    field(:opps, non_null(list_of(non_null(:opp))))
  end

  object :opps_queries do
    field :get_opps, :opps_payload do
      resolve(&Opps.get_opps/3)
    end
  end
end
