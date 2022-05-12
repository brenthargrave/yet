defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema
  import_types(AppWeb.Graph.Analytics)
  import_types(AppWeb.Graph.Verification)

  query do
    import_fields(:analytics_queries)
  end

  mutation do
    import_fields(:analytics_mutations)
    import_fields(:mutations_verification)
  end
end
