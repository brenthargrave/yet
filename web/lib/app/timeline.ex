defmodule App.Timeline do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  import Ecto.Query

  alias App.{
    Repo,
    Conversation,
    Conversations,
    Contacts,
    Customer,
    TimelineEvent
  }

  alias AppWeb.Resolvers.Timeline.{TimelinePayload}

  @preloads [
    conversation: Conversations.preloads()
  ]

  def delete(conversation) do
    Repo.delete_all(from(e in TimelineEvent, where: e.conversation_id == ^conversation.id))

    conversation
  end

  def delete_note(note) do
    conversation = note.conversation

    unless Enum.any?(conversation.notes, &(&1.status == :posted)) do
      Repo.delete_all(from(e in TimelineEvent, where: e.conversation_id == ^conversation.id))
    end

    note
  end

  def backfill_all(notify_subscriptions \\ false) do
    from(c in Conversation,
      where: c.status == :joined,
      preload: ^Conversations.preloads()
    )
    |> Repo.all()
    |> Enum.reject(&Enum.empty?(&1.notes))
    |> Enum.each(&add(&1, notify_subscriptions))
  end

  def rebuild_all do
    Repo.delete_all(TimelineEvent)
    __MODULE__.backfill_all()
  end

  def async_add(
        conversation,
        _notify_subscriptions \\ false
      ) do
    # TODO: scalable solution
    # presently recalcs events for all convos on every convo-joined/note-published
    App.Task.async_nolink(fn ->
      backfill_all(false)
    end)

    # TODO: until refactored, ping all participants to refresh own profiles
    participants_ids = Enum.map(conversation.participations, & &1.participant_id)

    [conversation.creator_id | participants_ids]
    |> Enum.uniq()
    |> Contacts.get_for()
    |> Enum.uniq_by(& &1.id)
    |> Enum.map(& &1.id)
    |> Enum.each(
      &Absinthe.Subscription.publish(
        AppWeb.Endpoint,
        %TimelinePayload{events: []},
        timeline_events_added: &1
      )
    )

    conversation
  end

  def add(conversation, _notify_subscriptions \\ false) do
    # NOTE: omit conversations from timeline without posted notes
    if conversation.status == :joined && Enum.any?(conversation.notes, &(&1.status == :posted)) do
      all_participants = Conversation.get_all_participants(conversation)

      all_participants_ids = Enum.map(all_participants, & &1.id)

      # all contacts of participants + creator
      all_participants_contacts = Contacts.get_for(all_participants_ids)

      all_potential_viewers =
        all_participants_contacts
        |> Enum.uniq_by(&Map.get(&1, :id))

      _events =
        Enum.map(all_potential_viewers, fn viewer ->
          viewer_id = viewer.id

          contacts_id_set =
            Contacts.get_for(viewer.id)
            |> Enum.map(& &1.id)
            |> MapSet.new()

          participants_id_set = MapSet.new(all_participants_ids)

          is_participant = Enum.member?(all_participants_ids, viewer_id)

          is_contact =
            contacts_id_set
            |> MapSet.intersection(participants_id_set)
            |> Enum.any?()

          persona =
            cond do
              is_participant ->
                :participant

              is_contact ->
                :contact

              true ->
                :public
            end

          event =
            TimelineEvent.conversation_published_changeset(%{
              viewer: viewer,
              conversation: conversation,
              conversation_published_persona: persona
            })
            |> Repo.insert!(on_conflict: :nothing)

          event
        end)

      # if notify_subscriptions do
      #   Enum.each(
      #     all_potential_viewers,
      #     &Absinthe.Subscription.publish(
      #       AppWeb.Endpoint,
      #       %TimelinePayload{events: personalize(events)},
      #       timeline_events_added: &1.id
      #     )
      #   )
      # end
    end

    conversation
  end

  @type ids :: list(String.t())
  @type filters :: %{
          opp_ids: ids(),
          omit_own: boolean(),
          only_own: boolean(),
          occurred_after: DateTime.t()
        }

  defun get_events(
          viewer :: Customer.t(),
          filters :: filters()
        ) :: Brex.Result.s(list(TimelineEvent.t())) do
    query =
      from(e in TimelineEvent,
        preload: ^@preloads,
        where: e.viewer_id == ^viewer.id,
        order_by: [desc: e.occurred_at],
        distinct: e.id
      )

    since = Map.get(filters, :occurred_after, nil)

    query =
      if is_nil(since),
        do: query,
        else: from(e in query, where: e.occurred_at > ^since)

    omit_own = Map.get(filters, :omit_own)

    query =
      if omit_own,
        do:
          from(e in query,
            join: c in assoc(e, :conversation),
            join: s in assoc(c, :participations),
            where: c.creator_id != ^viewer.id and s.participant_id != ^viewer.id
          ),
        else: query

    only_own = Map.get(filters, :only_own, false)

    query =
      if only_own,
        do:
          from(e in query,
            join: c in assoc(e, :conversation),
            join: s in assoc(c, :participations),
            where: c.creator_id == ^viewer.id or s.participant_id == ^viewer.id
          ),
        else: query

    viewed_id = Map.get(filters, :only_with)

    query =
      if viewed_id,
        do:
          from(e in query,
            join: c in assoc(e, :conversation),
            join: s in assoc(c, :participations),
            where: c.creator_id == ^viewed_id or s.participant_id == ^viewed_id
          ),
        else: query

    Repo.all(query)
    # TODO: hack. debug db query
    |> Enum.sort_by(& &1.occurred_at, {:desc, DateTime})
    |> personalize()
    |> ok()
  end

  def personalize(events) do
    events
    |> Enum.map(
      &case &1 do
        %TimelineEvent{kind: :conversation_published} = event ->
          # rename key to persona
          {persona, event} = Map.pop(event, :conversation_published_persona)
          event = Map.put(event, :persona, persona)
          # NOTE: personas
          # participant | contact => include notes
          # opportunist | public => w/o notes
          if Enum.member?([:opportunist, :public], persona),
            do:
              put_in(
                event,
                [Access.key!(:conversation), Access.key!(:notes)],
                []
              ),
            else: event

        any ->
          any
      end
    )
  end
end
