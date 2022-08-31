defmodule AppWeb.Graph.Onboarding do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.{Onboarding}

  enum :profile_prop do
    value(:name, as: "name")
    value(:org, as: "org")
    value(:role, as: "role")
  end

  input_object :patch_profile_input do
    field(:id, non_null(:string))
    field(:prop, non_null(:profile_prop))
    field(:value, non_null(:string))
  end

  object :patch_profile_payload do
    field(:me, :customer)
    field(:user_error, :user_error)
  end

  object :onboarding_mutations do
    field :patch_profile, :patch_profile_payload do
      arg(:input, non_null(:patch_profile_input))
      resolve(&Onboarding.patch_profile/3)
    end
  end
end
