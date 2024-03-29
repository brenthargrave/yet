defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema
  import_types(Absinthe.Type.Custom)
  import_types(AppWeb.Graph.Analytics)
  import_types(AppWeb.Graph.Auth)
  import_types(AppWeb.Graph.Onboarding)
  import_types(AppWeb.Graph.Conversations)
  import_types(AppWeb.Graph.Opps)
  import_types(AppWeb.Graph.Timeline)
  import_types(AppWeb.Graph.Profiles)
  import_types(AppWeb.Graph.Payments)
  import_types(AppWeb.Graph.Settings)
  import_types(AppWeb.Graph.Notes)

  query do
    import_fields(:analytics_queries)
    import_fields(:auth_queries)
    import_fields(:conversations_queries)
    import_fields(:opps_queries)
    import_fields(:timeline_queries)
    import_fields(:profiles_queries)
    import_fields(:payments_queries)
    # import_fields(:notes_queries)
  end

  mutation do
    import_fields(:analytics_mutations)
    import_fields(:auth_mutations)
    import_fields(:onboarding_mutations)
    import_fields(:conversations_mutations)
    import_fields(:opps_mutations)
    import_fields(:profiles_mutations)
    import_fields(:payments_mutations)
    import_fields(:settings_mutations)
    import_fields(:notes_mutations)
  end

  subscription do
    import_fields(:conversations_subscriptions)
    import_fields(:timeline_subscriptions)
    import_fields(:notes_subscriptions)
  end
end
