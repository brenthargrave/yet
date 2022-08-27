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
    Contacts,
    Contact,
    Customer,
    Opp,
    TimelineEvent
  }

  @preloads [
    conversation: [
      :creator,
      signatures: [:signer, :conversation],
      mentions: [opp: :creator]
    ]
  ]

  defun handle_published(conversation :: Conversation.t()) :: Conversation.t() do
    creator = conversation.creator
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
      participants
      |> Enum.concat(all_opps_viewers)
      |> Enum.uniq_by(&Map.get(&1, :id))
      # ? TODO: participants don't need informing of own conversation
      # |> Enum.drop_while(&Enum.member?(participants_ids, &1.id))
      |> IO.inspect(label: "all_viewers")

    Enum.each(all_viewers, fn viewer ->
      TimelineEvent.conversation_published_changeset(%{
        viewer: viewer,
        occurred_at: Timex.now(),
        conversation: conversation
      })
      |> Repo.insert()

      # TODO: notify subscriptions
    end)

    conversation
  end

  defun get_events(viewer :: Customer.t()) :: Brex.Result.s(list(Conversation.t())) do
    # contact_ids =
    #   Contacts.get_contacts(viewer)
    #   |> IO.inspect()
    #   |> Enum.map(&Map.get(&1, :id))
    #   |> IO.inspect()

    # opp_ids_subquery =
    #   from(o in Opp,
    #     select: [c.id],
    #     join: c in assoc(c, :conversation),
    #     join: s in assoc(c, :signatures),
    #     where: o.creator_id == ^viewer.id,
    #     or_where: )

    # query =
    #   from(e in TimelineEvent,
    #     preload: ^@preloads,
    #     join: c in assoc(e, :conversation),
    #     join: s in assoc(c, :signatures),
    #     # NOTE: contact signs conversation
    #     where: s.signer_id in ^contact_ids,
    #     # NOTE: contact publishes conversation
    #     or_where: c.creator_id in ^contact_ids,
    #     # NOTE: mentions of my created opps
    #     full_join: o in assoc(c, :opps),
    #     or_where: o.creator_id == ^viewer.id,
    #     # ? TODO: mentions of opps I've been exposed to?
    #     # Yes... given you want to receive attribution for forwarding it.
    #     order_by: [desc: e.occurred_at],
    #     distinct: e.id
    #   )

    # TODO:
    # query =
    #   from(e in TimelineEvent,
    #     preload: ^@preloads,
    #     where: e.viewer_id == ^viewer.id,
    #     order_by: [desc: e.occurred_at],
    #     distinct: e.id
    #   )
    # Repo.all(query)
    []
    |> IO.inspect()
    |> ok()
  end
end
