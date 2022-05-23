defmodule AppWeb.Graph.Onboarding do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.{Onboarding}

  input_object :profile_input do
    field(:id, non_null(:string))
    field(:name, :string)
    field(:org, :string)
    field(:role, :string)
  end

  object :profile_payload do
    field(:me, non_null(:customer))
  end

  union :update_profile_result do
    types([:profile_payload, :user_error])

    resolve_type(fn
      %{success: true}, _ ->
        :update_profile_payload

      %{success: false}, _ ->
        :user_error
    end)
  end

  object :onboarding_mutations do
    field :update_profile, :update_profile_result do
      arg(:input, non_null(:profile_input))
      resolve(&Onboarding.update_profile/3)
    end
  end

  # object :onboarding_queries do
  # field :events, non_null(list_of(non_null(:event))) do
  #   resolve(&Resolvers.Analytics.events/3)
  # end
  # end
end
