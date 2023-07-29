defmodule AppWeb.Graph.Profiles do
  use Absinthe.Schema.Notation

  alias AppWeb.Resolvers.Profiles

  alias App.{
    Profile,
    UserError
  }

  object :base_profile do
    field(:id, non_null(:id))
    field(:first_name, non_null(:string))
    field(:last_name, non_null(:string))
    field(:name, non_null(:string))
    field(:email, :string)
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
    field(:social_distance, :integer)
  end

  interface :profile_like do
    import_fields(:base_profile)

    resolve_type(fn
      %{events: _}, _ -> :profile
      _, _ -> :contact
    end)
  end

  object :contact do
    import_fields(:base_profile)
    field(:conversation_count_with_subject, :integer)
  end

  object :profile do
    import_fields(:base_profile)
    field(:events, list_of(non_null(:timeline_event)))
    field(:contacts, list_of(non_null(:contact)))
  end

  object :contact_list do
    field(:contacts, non_null(list_of(non_null(:contact))))
  end

  union :profile_result do
    types([:profile, :user_error])

    resolve_type(fn
      %Profile{}, _ ->
        :profile

      %UserError{}, _ ->
        :user_error
    end)
  end

  ## GetProfile

  input_object :get_profile_input do
    field(:id, non_null(:id))
    field(:timeline_filters, :timeline_filters)
  end

  object :profiles_queries do
    field :get_profile, :profile_result do
      arg(:input, non_null(:get_profile_input))
      resolve(&Profiles.get/3)
    end

    field :get_contacts, :contact_list do
      resolve(&Profiles.get_contacts/3)
    end
  end

  ## UpdateProfile

  input_object :update_profile_input do
    field(:first_name, non_null(:string))
    field(:last_name, non_null(:string))
    field(:org, :string)
    field(:role, :string)
  end

  object :profiles_mutations do
    field :update_profile, :profile_result do
      arg(:input, :update_profile_input)
      resolve(&Profiles.update/3)
    end
  end
end
