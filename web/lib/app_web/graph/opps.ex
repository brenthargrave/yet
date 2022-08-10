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

  object :opp_payload do
    field(:user_error, non_null(:user_error))
    field(:opp, non_null(:opp))
  end

  input_object :opp_input do
    field(:id, non_null(:string))
    field(:role, non_null(:string))
    field(:org, non_null(:string))
    field(:desc, :string)
  end

  object :opps_mutations do
    field :upsert_opp, :opp_payload do
      arg(:input, non_null(:opp_input))
      resolve(&Opps.upsert_opp/3)
    end
  end

  object :opps_queries do
    field :get_opps, :opps_payload do
      resolve(&Opps.get_opps/3)
    end
  end
end
