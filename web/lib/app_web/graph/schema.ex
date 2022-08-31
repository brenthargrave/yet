defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema
  import_types(AppWeb.Graph.Analytics)
  import_types(AppWeb.Graph.Auth)
  import_types(AppWeb.Graph.Onboarding)
  import_types(AppWeb.Graph.Conversations)
  import_types(AppWeb.Graph.Opps)
  import_types(AppWeb.Graph.Timeline)
  import_types(AppWeb.Graph.Profiles)

  query do
    import_fields(:analytics_queries)
    import_fields(:auth_queries)
    import_fields(:conversations_queries)
    import_fields(:opps_queries)
    import_fields(:timeline_queries)
    import_fields(:profiles_queries)
  end

  mutation do
    import_fields(:analytics_mutations)
    import_fields(:auth_mutations)
    import_fields(:onboarding_mutations)
    import_fields(:conversations_mutations)
    import_fields(:opps_mutations)
    import_fields(:profiles_mutations)
  end

  subscription do
    import_fields(:conversations_subscriptions)
    import_fields(:timeline_subscriptions)
  end
end
