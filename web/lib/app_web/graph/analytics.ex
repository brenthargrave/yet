defmodule AppWeb.Graph.Analytics do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers

  enum :event_name do
    value(:tap_signup)
  end

  object :event do
    field(:name, non_null(:event_name))
  end

  input_object :event_properties do
    field(:install_id, non_null(:string))
  end

  input_object :track_event_input do
    field(:name, non_null(:event_name))
    field(:properties, non_null(:event_properties))
  end

  object :track_event_result do
    field :event, type: :event
  end

  object :analytics_mutations do
    field :track_event, :track_event_result do
      arg(:input, non_null(:track_event_input))
      resolve(&Resolvers.Analytics.track_event/3)
    end
  end

  object :analytics_queries do
    field :events, non_null(list_of(non_null(:event))) do
      resolve(&Resolvers.Analytics.events/3)
    end
  end
end
