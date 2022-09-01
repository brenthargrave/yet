defmodule AppWeb.Graph.Timeline do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers.Timeline
  alias App.{TimelineEvent}

  enum :persona do
    value(:participant)
    value(:contact)
    value(:opportunist)
    value(:public)
  end

  enum :timeline_event_type do
    value(:conversation_published)
    value(:contact_profile_changed)
  end

  object :conversation_published do
    field(:type, non_null(:timeline_event_type))
    field(:occurred_at, non_null(:datetime))
    field(:conversation, non_null(:conversation))
    field(:persona, non_null(:persona))
  end

  object :contact_profile_changed do
    field(:type, non_null(:timeline_event_type))
    field(:occurred_at, non_null(:datetime))
    field(:contact, non_null(:contact))
  end

  union :timeline_event do
    types([:conversation_published, :contact_profile_changed])

    resolve_type(fn
      %TimelineEvent{type: :conversation_published}, _ ->
        :conversation_published

      %TimelineEvent{type: :contact_profile_changed}, _ ->
        :contact_profile_changed
    end)
  end

  object :timeline_payload do
    field(:events, non_null(list_of(non_null(:timeline_event))))
  end

  input_object :timeline_filters do
    field(:opps, list_of(non_null(:id)))
    field(:omit_own, :boolean)
  end

  input_object :timeline_input do
    field(:filters, :timeline_filters)
  end

  object :timeline_queries do
    field :get_timeline, :timeline_payload do
      arg(:input, :timeline_input)
      resolve(&Timeline.get_timeline/3)
    end
  end

  input_object :timeline_events_added_input do
    field(:id, non_null(:id))
  end

  object :timeline_subscriptions do
    field :timeline_events_added, :timeline_payload do
      arg(:input, non_null(:timeline_events_added_input))

      config(fn args, _ ->
        {:ok, topic: args.input.id}
      end)

      resolve(fn payload, _, _ ->
        {:ok, payload}
      end)
    end
  end
end
