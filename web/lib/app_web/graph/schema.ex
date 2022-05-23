defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema
  import_types(AppWeb.Graph.Analytics)
  import_types(AppWeb.Graph.Auth)
  import_types(AppWeb.Graph.Onboarding)

  query do
    import_fields(:analytics_queries)
    import_fields(:auth_queries)
  end

  mutation do
    import_fields(:analytics_mutations)
    import_fields(:auth_mutations)
    import_fields(:onboarding_mutations)
  end
end
