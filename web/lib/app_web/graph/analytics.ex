defmodule AppWeb.Graph.Analytics do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers

  enum :event_name do
    value(:tap_signup, as: "tap_signup")
    value(:tap_signin, as: "tap_signin")
  end

  object :event do
    field(:name, non_null(:event_name))
  end

  input_object :event_properties do
    # TODO
  end

  input_object :track_event_input do
    field(:name, non_null(:event_name))
    field(:properties, non_null(:event_properties))
    field(:anon_id, non_null(:string))
    field(:user_id, :string)
  end

  object :analytics_mutations do
    field :track_event, :event do
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
