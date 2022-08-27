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
    participants =
      Conversation.get_participants(conversation)
      |> IO.inspect(label: "participants")

    # all contacts of signers
    # all contacts of creator
    participants_contacts =
      Contacts.get_contacts(participants)
      |> IO.inspect(label: "participants_contacts")

    # for each opp mentioned everyone who has previously discussed it
    all_opps_viewers =
      Conversation.all_viewers_of_opps(conversation)
      |> IO.inspect(label: "all_opps_viewers")

    opps_ids =
      conversation.opps
      |> Enum.map(&Map.get(&1, :id))
      |> IO.inspect(label: "opps_ids")

    query =
      from(
        contact in Contact,
        join: conversation in assoc(contact, :conversations),
        join: mentions in assoc(conversation, :mentions),
        where: conversation.id == ^conversation.id,
        where: mentions.opp_id in opps_ids
      )

    # ? why would I need to see a convo if I just signed it?
    # except: creator
    # except: signers

    # TODO: async creates

    # TimelineEvent.conversation_published_changeset(%{
    #   occurred_at: Timex.now(),
    #   conversation: conversation
    # })
    # |> Repo.insert()

    # TODO: subscriptions

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
