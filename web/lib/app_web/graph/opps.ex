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
    field(:owner, non_null(:contact))
    field(:inserted_at, non_null(:datetime))
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

  input_object :get_opp_profile_input do
    field(:id, non_null(:id))
  end

  object :opp_profile do
    field(:opp, non_null(:opp))
    field(:events, non_null(list_of(non_null(:timeline_event))))
  end

  object :opp_profile_payload do
    field(:user_error, :user_error)
    field(:opp_profile, non_null(:opp_profile))
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

    field :get_opp_profile, :opp_profile_payload do
      arg(:input, non_null(:get_opp_profile_input))
      resolve(&Opps.get_opp_profile/3)
    end
  end
end
