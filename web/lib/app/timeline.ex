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
    Contact,
    Customer,
    TimelineEvent
  }

  alias AppWeb.Resolvers.Timeline.{TimelinePayload}

  @preloads [
    conversation: [
      :creator,
      opps: [:creator, :owner],
      signatures: [:signer, :conversation],
      reviews: [:reviewer, :conversation]
    ]
  ]

  defun async_handle_published(
          conversation :: Conversation.t(),
          notify_subscriptions \\ false
        ) ::
          Conversation.t() do
    App.Task.async_nolink(fn ->
      handle_published(conversation, notify_subscriptions)
      # ! TODO: scalable solution
      # NOTE: rerun for all prior records every time someone makes new contacts
      if notify_subscriptions do
        from(c in Conversation,
          where: c.status != :deleted,
          preload: ^Conversations.preloads()
        )
        |> Repo.all()
        |> Enum.each(&handle_published(&1, false))
      end
    end)

    conversation
  end

  defun handle_published(
          conversation :: Conversation.t(),
          _notify_subscriptions \\ false
        ) :: Conversation.t() do
    participants = Conversation.get_participants(conversation)

    participants_ids = Enum.map(participants, & &1.id)

    # all contacts of signers
    # all contacts of creator
    participants_contacts = Contacts.get_contacts_for_viewers(participants)

    opps_ids =
      conversation.opps
      |> Enum.map(&Map.get(&1, :id))

    # all owners of conversations mentioning this convo's opps
    creators =
      from(contact in Contact,
        join: conversation in assoc(contact, :conversations),
        left_join: opp in assoc(conversation, :opps),
        where: opp.id in ^opps_ids
      )

    # ditto, but all signers
    signers =
      from(contact in Contact,
        join: signature in assoc(contact, :signatures),
        join: conversation in assoc(signature, :conversation),
        left_join: opp in assoc(conversation, :opps),
        where: opp.id in ^opps_ids
      )

    all_opps_viewers =
      Repo.all(
        from contact in Contact,
          union: ^creators,
          union: ^signers,
          distinct: contact.id
      )

    all_opps_viewers_ids = Enum.map(all_opps_viewers, &Map.get(&1, :id))

    all_viewers =
      participants_contacts
      |> Enum.concat(all_opps_viewers)
      |> Enum.uniq_by(&Map.get(&1, :id))

    # NOTE: exclude participants, any need to see own activity?
    # NOTE: preserve for "viewed as contact" in profile view
    # |> Enum.drop_while(&Enum.member?(participants_ids, &1.id))

    Enum.map(all_viewers, fn viewer ->
      viewer_id = viewer.id

      contacts_id_set = MapSet.new(viewer.contacts_ids)

      participants_id_set = MapSet.new(participants_ids)

      is_participant = Enum.member?(participants_ids, viewer_id)

      is_contact =
        contacts_id_set
        |> MapSet.intersection(participants_id_set)
        |> Enum.empty?()

      is_opportunist = Enum.member?(all_opps_viewers_ids, viewer_id)

      persona =
        cond do
          is_participant ->
            :participant

          is_contact ->
            :contact

          is_opportunist ->
            :opportunist

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

      payload = %TimelinePayload{events: personalize([event])}

      Absinthe.Subscription.publish(
        AppWeb.Endpoint,
        payload,
        timeline_events_added: viewer.id
      )

      payload
    end)

    conversation
  end

  @type ids :: list(String.t())
  @type omit_own :: boolean()
  @type filters :: %{opp_ids: ids()}
  @type input :: %{filters: filters()} | %{}

  defun get_events(
          viewer :: Customer.t(),
          input :: input()
        ) :: Brex.Result.s(list(TimelineEvent.t())) do
    filters = Map.get(input, :filters, %{})

    opp_ids = Map.get(filters, :opps, nil)

    omit_own = Map.get(filters, :omit_own, false)

    query =
      from(e in TimelineEvent,
        preload: ^@preloads,
        where: e.viewer_id == ^viewer.id,
        order_by: [desc: e.occurred_at],
        distinct: e.id
      )

    query =
      if is_nil(opp_ids),
        do: query,
        else:
          from(e in query,
            join: c in assoc(e, :conversation),
            join: o in assoc(c, :opps),
            where: e.type == :conversation_published,
            where: o.id in ^opp_ids
          )

    query =
      if omit_own,
        do:
          from(e in query,
            join: c in assoc(e, :conversation),
            join: s in assoc(c, :signatures),
            where: c.creator_id != ^viewer.id and s.signer_id != ^viewer.id
          ),
        else: query

    Repo.all(query)
    |> personalize()
    |> IO.inspect(label: "THIS events")
    |> ok()
  end

  defun personalize(events :: list(TimelineEvent.t())) :: list(TimelineEvent.t()) do
    events
    |> Enum.map(
      &case &1 do
        %TimelineEvent{type: :conversation_published} = event ->
          # rename key to persona
          {persona, event} = Map.pop(event, :conversation_published_persona)
          event = Map.put(event, :persona, persona)
          # NOTE: personas
          # participant | contact => include notes
          # opportunist | public => w/o notes
          if Enum.member?([:opportunist, :public], persona),
            do: put_in(event, [:conversation, :note], nil),
            else: event

        any ->
          any
      end
    )
  end
end
