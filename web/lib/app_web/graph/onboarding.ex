defmodule AppWeb.Graph.Onboarding do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.{Onboarding}
  alias App.{Profile, UserError}

  enum :profile_prop do
    value(:first_name, as: "first_name")
    value(:last_name, as: "last_name")
    value(:email, as: "email")
    value(:org, as: "org")
    value(:role, as: "role")
  end

  input_object :patch_profile_input do
    field(:id, non_null(:string))
    field(:prop, non_null(:profile_prop))
    field(:value, non_null(:string))
  end

  # same as Profile, but all fields optional, as profile is built-up
  object :onboarding_profile do
    field(:id, non_null(:id))
    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:name, :string)
    field(:org, :string)
    field(:role, :string)
  end

  union :patch_profile_result do
    types([:onboarding_profile, :user_error])

    resolve_type(fn
      %Profile{}, _ ->
        :onboarding_profile

      %UserError{}, _ ->
        :user_error
    end)
  end

  object :onboarding_mutations do
    field :patch_profile, :patch_profile_result do
      arg(:input, non_null(:patch_profile_input))
      resolve(&Onboarding.patch_profile/3)
    end
  end
end
