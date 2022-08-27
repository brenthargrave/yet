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

  @preloads [
    conversation: [
      :creator,
      :opps,
      signatures: [:signer, :conversation],
      reviews: [:reviewer, :conversation],
      mentions: [:opp]
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
      TimelineEvent.conversation_published_changeset(%{
        viewer: viewer,
        conversation: conversation
      })
      |> Repo.insert!(on_conflict: :nothing)

      # TODO: notify subscriptions if  notify arg
    end)
    |> IO.inspect(label: "events")

    conversation
  end

  defun get_events(viewer :: Customer.t()) :: Brex.Result.s(list(Conversation.t())) do
    Repo.all(
      from(e in TimelineEvent,
        preload: ^@preloads,
        where: e.viewer_id == ^viewer.id,
        order_by: [desc: e.occurred_at],
        distinct: e.id
      )
    )
    |> ok()
  end
end
