defmodule AppWeb.Graph.Profiles do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Profiles

  object :profile do
    field(:contact, non_null(:contact))
    field(:events, non_null(list_of(non_null(:timeline_event))))
  end

  object :profile_payload do
    field(:profile, non_null(:profile))
  end

  input_object :get_profile_input do
    field(:id, non_null(:id))
  end

  object :profiles_queries do
    field :get_profile, :profile_payload do
      arg(:input, :get_profile_input)
      resolve(&Profiles.get/3)
    end
  end
end
