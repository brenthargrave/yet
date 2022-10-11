defmodule AppWeb.Graph.Settings do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers

  object :settings_mutations do
    field :unsubscribe, :settings_event do
      arg(:input, non_null(:unsubscribe_input))
      resolve(&Resolvers.Settings.unsubscribe/3)
    end
  end

  input_object :unsubscribe_input do
    field(:customer_id, non_null(:id))
    field(:occurred_at, non_null(:datetime))
    field(:kind, non_null(:settings_event_kind))
  end

  enum :settings_event_kind do
    value(:unsubscribe_digest)
  end

  object :settings_event do
    field(:occurred_at, non_null(:datetime))
    field(:customer_id, non_null(:id))
    field(:kind, non_null(:settings_event_kind))
  end
end
