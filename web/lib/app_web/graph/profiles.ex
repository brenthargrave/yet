defmodule AppWeb.Graph.Profiles do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Profiles

  object :get_profile_payload do
    field(:contact, non_null(:contact))
    field(:events, non_null(:timeline_event))
  end

  input_object :get_profile_input do
    field(:id, non_null(:id))
  end

  object :profiles_queries do
    field :get_profile, :get_profile_payload do
      arg(:input, :get_profile_input)
      resolve(&Profiles.get/3)
    end
  end

  ## UpdateProfile

  object :profile do
    field(:id, non_null(:id))
    field(:name, non_null(:string))
  end

  object :update_profile_payload do
    field(:profile, :profile)
    field(:user_error, :user_error)
  end

  input_object :update_profile_input do
    field(:name, non_null(:string))
  end

  object :profiles_mutations do
    field :update_profile, :update_profile_payload do
      arg(:input, :update_profile_input)
      resolve(&Profiles.update/3)
    end
  end
end
