defmodule AppWeb.Graph.Profiles do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Profiles

  object :profile do
    field(:id, non_null(:id))
    field(:first_name, non_null(:string))
    field(:last_name, non_null(:string))
    field(:name, non_null(:string))
    field(:email, :string)
    # TODO: filter (contacts-only) here in backend, not client
    field(:e164, :string)
    field(:phone, :string)
    field(:org, :string)
    field(:role, :string)
    field(:website, :string)
    field(:location, :string)
    field(:description, :string)
    field(:twitter_handle, :string)
    field(:facebook_url, :string)
    field(:facebook_name, :string)
    field(:facebook_image, :string)
    field(:events, list_of(non_null(:timeline_event)))
    field(:social_distance, :integer)
  end

  ## GetProfile

  object :get_profile_payload do
    field(:profile, non_null(:profile))
  end

  input_object :get_profile_input do
    field(:id, non_null(:id))
    field(:timeline_filters, :timeline_filters)
  end

  object :profiles_queries do
    field :get_profile, :get_profile_payload do
      arg(:input, :get_profile_input)
      resolve(&Profiles.get/3)
    end
  end

  ## UpdateProfile

  object :update_profile_payload do
    field(:profile, :profile)
    field(:user_error, :user_error)
  end

  input_object :update_profile_input do
    field(:first_name, non_null(:string))
    field(:last_name, non_null(:string))
    field(:org, :string)
    field(:role, :string)
  end

  object :profiles_mutations do
    field :update_profile, :update_profile_payload do
      arg(:input, :update_profile_input)
      resolve(&Profiles.update/3)
    end
  end
end
