defmodule AppWeb.Graph.Timeline do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Timeline
  alias App.{TimelineEvent}

  # ! interface
  # enum :timeline_event_type do
  #   value(:conversation_published)
  # end

  # interface :timeline_event do
  #   field(:type, non_null(:timeline_event_type))
  #   field(:occurred_at, non_null(:datetime))

  #   resolve_type(fn
  #     %{type: :conversation_published}, _ -> :conversation_published
  #     _, _ -> nil
  #   end)
  # end

  # object :conversation_published do
  #   field(:type, non_null(:timeline_event_type))
  #   field(:occurred_at, non_null(:datetime))
  #   field(:conversation, :conversation)
  # end

  # # !
  # enum :timeline_event_type do
  #   value(:conversation_published)
  # end

  # object :timeline_event do
  #   field(:type, non_null(:timeline_event_type))
  #   field(:occurred_at, non_null(:datetime))
  #   field(:conversation, :conversation)
  # end

  # ! union
  enum :timeline_event_type do
    value(:conversation_published)
  end

  object :conversation_published do
    field(:type, non_null(:timeline_event_type))
    field(:occurred_at, non_null(:datetime))
    field(:conversation, non_null(:conversation))
  end

  union :timeline_event do
    types([:conversation_published])

    resolve_type(fn
      %TimelineEvent{type: :conversation_published}, _ ->
        :conversation_published

      _, _ ->
        nil
    end)
  end

  object :timeline_payload do
    field(:events, non_null(list_of(non_null(:timeline_event))))
  end

  object :timeline_queries do
    field :get_timeline, :timeline_payload do
      # arg(:filters, non_null(:timeline_filters))
      resolve(&Timeline.get_timeline/3)
    end
  end
end
