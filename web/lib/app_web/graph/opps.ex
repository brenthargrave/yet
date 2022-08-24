defmodule AppWeb.Graph.Opps do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Opps
  import_types(Absinthe.Type.Custom.Money)

  object :opp do
    field(:id, non_null(:id))
    field(:role, non_null(:string))
    field(:org, non_null(:string))
    field(:desc, :string)
    field(:fee, non_null(:money))
    field(:url, :string)
    field(:creator, non_null(:contact))
    field(:inserted_at, non_null(:datetime))
    field(:conversations, non_null(list_of(non_null(:conversation))))
  end

  object :opps_payload do
    field(:opps, non_null(list_of(non_null(:opp))))
  end

  object :opp_payload do
    field(:user_error, :user_error)
    field(:opp, :opp)
  end

  input_object :opp_input do
    field(:id, non_null(:string))
    field(:role, non_null(:string))
    field(:org, non_null(:string))
    field(:desc, :string)
    field(:url, :string)
    field(:fee, non_null(:money_input))
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

    field :get_opp, :opp_payload do
      arg(:id, non_null(:id))
      resolve(&Opps.get_opp/3)
    end
  end
end
