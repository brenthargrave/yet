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
    Customer,
    Opp,
    TimelineEvent
  }

  @preloads [
    conversation: [
      :creator,
      signatures: [:signer, :conversation],
      reviews: [:reviewer, :conversation],
      mentions: [opp: :creator]
    ]
  ]

  defun get_events(viewer :: Customer.t()) :: Brex.Result.s(list(Conversation.t())) do
    contact_ids =
      Contacts.get_contacts(viewer)
      |> IO.inspect()
      |> Enum.map(&Map.get(&1, :id))
      |> IO.inspect()

    # opp_ids_subquery =
    #   from(o in Opp,
    #     select: [c.id],
    #     join: c in assoc(c, :conversation),
    #     join: s in assoc(c, :signatures),
    #     where: o.creator_id == ^viewer.id,
    #     or_where: )

    query =
      from(e in TimelineEvent,
        preload: ^@preloads,
        join: c in assoc(e, :conversation),
        join: s in assoc(c, :signatures),
        # NOTE: contact signs conversation
        where: s.signer_id in ^contact_ids,
        # NOTE: contact publishes conversation
        or_where: c.creator_id in ^contact_ids,
        # NOTE: mentions of my created opps
        full_join: o in assoc(c, :opps),
        or_where: o.creator_id == ^viewer.id,
        # ? TODO: mentions of opps I've been exposed to?
        # Yes... given you want to receive attribution for forwarding it.
        order_by: [desc: e.occurred_at],
        distinct: e.id
      )

    Repo.all(query)
    |> IO.inspect()
    |> ok()
  end
end
