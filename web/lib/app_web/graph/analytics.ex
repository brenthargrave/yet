defmodule AppWeb.Graph.Analytics do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers

  enum :event_name do
    value(:tap_signup, as: "tap_signup")
    value(:tap_signin, as: "tap_signin")
    value(:tap_new_conversation, as: "tap_new_conversation")
    value(:tap_propose, as: "tap_propose")
    value(:review_conversation, as: "review_conversation")
    value(:view_conversation, as: "view_conversation")
  end

  enum :intent do
    value(:sign, as: "sign")
    value(:view, as: "view")
    value(:edit, as: "edit")
  end

  enum :platform do
    value(:web, as: "web")
  end

  # TODO: macro to dedupe input_object/object
  input_object :event_properties_input do
    field(:conversation_id, :id)
    field(:intent, :intent)
    field(:platform, :platform)
    field(:signature_count, :integer)
  end

  object :event_properties do
    field(:conversation_id, :id)
    field(:intent, :intent)
    field(:platform, :platform)
    field(:signature_count, :integer)
  end

  input_object :track_event_input do
    field(:occurred_at, non_null(:datetime))
    field(:name, non_null(:event_name))
    field(:anon_id, non_null(:string))
    field(:properties, non_null(:event_properties_input))
    field(:customer_id, :string)
  end

  object :event do
    field(:occurred_at, non_null(:datetime))
    field(:name, non_null(:event_name))
    field(:anon_id, non_null(:string))
    field(:properties, non_null(:event_properties))
    field(:customer_id, :string)
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
