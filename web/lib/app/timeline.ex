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
    Opp,
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
    Task.Supervisor.async_nolink(App.TaskSupervisor, fn ->
      handle_published(conversation, notify_subscriptions)
      # ! TODO: backfill every time someone makes a new contact
      # if notify_subscriptions do
      #   from(c in Conversation, where: c.status != :deleted)
      #   |> Repo.all(preload: Conversations.preloads())
      #   |> Enum.each(&handle_published(&1, false))
      # end
    end)

    conversation
  end

  defun handle_published(
          conversation :: Conversation.t(),
          notify_subscriptions \\ false
        ) :: Conversation.t() do
    participants = Conversation.get_participants(conversation)

    # all contacts of signers
    # all contacts of creator
    participants_contacts = Contacts.get_contacts_for_viewers(participants)

    opps_ids =
      conversation.opps
      |> IO.inspect(label: "opps")
      |> Enum.map(&Map.get(&1, :id))
      |> IO.inspect(label: "opps_ids")

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

    # participants_ids = Enum.map(participants, &Map.get(&1, :id))

    all_viewers =
      participants_contacts
      |> Enum.concat(all_opps_viewers)
      |> Enum.uniq_by(&Map.get(&1, :id))
      # ? TODO: participants don't need informing of own conversation
      # |> Enum.drop_while(&Enum.member?(participants_ids, &1.id))
      |> IO.inspect(label: "all_viewers")

    Enum.map(all_viewers, fn viewer ->
      event =
        TimelineEvent.conversation_published_changeset(%{
          viewer: viewer,
          conversation: conversation
        })
        |> Repo.insert!(on_conflict: :nothing)

      payload =
        %TimelinePayload{events: [event]}
        |> IO.inspect(label: "payload")

      Absinthe.Subscription.publish(
        AppWeb.Endpoint,
        payload,
        timeline_events_added: viewer.id
      )
      |> IO.inspect(label: "timeline_events_added")
    end)

    conversation
  end

  @type ids :: list(String.t())
  @type filters :: %{opp_ids: ids()}
  @type input :: %{filters: filters()}
  defun get_events(
          viewer :: Customer.t(),
          input :: input()
        ) :: Brex.Result.s(list(Conversation.t())) do
    opp_ids =
      input
      |> get_in([:filters, :opps])

    base =
      from(e in TimelineEvent,
        preload: ^@preloads,
        where: e.viewer_id == ^viewer.id,
        order_by: [desc: e.occurred_at],
        distinct: e.id
      )

    query =
      if is_nil(opp_ids),
        do: base,
        else:
          from(e in base,
            join: c in assoc(e, :conversation),
            join: o in assoc(c, :opps),
            where: e.type == :conversation_published,
            where: o.id in ^opp_ids
          )

    Repo.all(query)
    |> ok()
  end
end
