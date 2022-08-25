defmodule AppWeb.Graph.Timeline do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Timeline
  alias App.{Conversation}
  # import_types(Absinthe.Type.Custom)

  union :timeline_event do
    types([:conversation])

    resolve_type(fn
      %Conversation{}, _ ->
        :conversation
    end)
  end

  object :timeline_payload do
    field(:events, non_null(list_of(non_null(:timeline_event))))
  end

  input_object :timeline_filters do
    # TODO: opp id
    # field(:filters, :filters_input)
  end

  object :timeline_queries do
    field :get_timeline, :timeline_payload do
      arg(:filters, non_null(:timeline_filters))
      resolve(&Timeline.get_timeline/3)
    end
  end

  # object :timeline_subscriptions do
  # end
end
