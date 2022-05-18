defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema
  import_types(AppWeb.Graph.Analytics)
  import_types(AppWeb.Graph.Auth)

  query do
    import_fields(:analytics_queries)
  end

  mutation do
    import_fields(:analytics_mutations)
    import_fields(:auth_mutations)
  end
end
