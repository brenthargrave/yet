defmodule App.Conversations do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex

  alias App.{
    Repo,
    Conversation,
    Signature,
    Customer,
    Notification,
    Timeline,
    OppVersion,
    UserError,
    Participation
  }

  import Ecto.Query
  import App.Helpers, only: [format_ecto_errors: 1]

  @preloads [
    :creator,
    notes: [:creator],
    opps: [:creator, :owner],
    participations: [:participant, :conversation],
    # TODO: drop post-migration
    signatures: [:signer, :conversation]
  ]

  def preloads() do
    @preloads
  end

  def participation_preloads() do
    [
      :conversation
    ]
  end

  def upsert_conversation(
        customer,
        %{id: id, invitees: invitees, occurred_at: occurred_at} = _input
      ) do
    attrs = %{
      creator: customer,
      id: id,
      invitees: invitees,
      occurred_at: occurred_at || Timex.now()
    }

    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> convert_error(:not_found, %Conversation{})
    # only creator can edit
    |> bind(
      &if !is_nil(&1.creator_id) && &1.creator_id != customer.id,
        do: error(:unauthorized),
        else: ok(&1)
    )
    # NOTE: UI disables edititing once proposed
    |> bind(
      &if Enum.member?([:draft, :proposed], &1.status),
        do: ok(&1),
        else: error(:unauthorized)
    )
    |> fmap(&Conversation.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Repo.preload(&1, @preloads))
    |> fmap(&Conversation.update_subscriptions/1)
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
    |> convert_error(:not_found, UserError.not_found())
    |> convert_error(:unauthorized, UserError.unauthorized())
  end

  def delete_conversation(id, viewer) do
    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator == viewer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Conversation.tombstone_changeset(&1))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Timeline.delete(&1))
    |> convert_error(:not_found, UserError.not_found())
    |> convert_error(:unauthorized, UserError.unauthorized())
  end

  def propose_conversation(
        customer,
        %{id: id} = _input
      ) do
    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator == customer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Conversation.proposed_changeset/1)
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Conversation.update_subscriptions/1)
    |> fmap(&notify_registered_invitees/1)
    |> convert_error(:not_found, UserError.not_found())
    |> convert_error(:unauthorized, UserError.unauthorized())
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  def join_conversation(
        customer,
        %{id: id, conversation_url: conversation_url} = _input
      ) do
    attrs = %{participant: customer}

    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    # NOTE: can't join own conversation
    |> bind(&if &1.creator != customer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Map.merge(attrs, %{conversation: &1, occurred_at: Timex.now()}))
    |> fmap(&Participation.changeset(&1))
    |> bind(&Repo.insert_or_update(&1, on_conflict: :nothing))
    |> fmap(&Repo.preload(&1, participation_preloads()))
    |> fmap(&notify_creator_of_participation(&1, conversation_url))
    |> fmap(& &1.conversation)
    |> fmap(&Conversation.joined_changeset(&1))
    |> bind(&Repo.insert_or_update/1)
    |> fmap(&Repo.preload(&1, @preloads, force: true, in_parallel: true))
    |> fmap(&filter_notes(&1, customer))
    |> fmap(&Conversation.update_subscriptions/1)
    # NOTE: update timelines for convos joined w/ pre-existing notes
    |> fmap(&update_timelines(&1))
    |> convert_error(:not_found, UserError.not_found())
    |> convert_error(:unauthorized, UserError.unauthorized())
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  defp update_timelines(conversation) do
    Timeline.async_add(conversation, true)
    conversation
  end

  def get_conversation(id) do
    Repo.get(Conversation, id)
  rescue
    Ecto.Query.CastError -> nil
  end

  def filter_notes(conversation, viewer) do
    filtered_notes =
      conversation.notes
      |> Enum.reject(&(&1.status == :deleted))
      |> Enum.reject(&(&1.status == :draft && conversation.creator != viewer))

    Map.put(conversation, :notes, filtered_notes)
  end

  def get_conversation(id, viewer) do
    get_conversation(id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> bind(&if &1.status == :deleted, do: error(:not_found), else: ok(&1))
    |> bind(
      &if &1.status == :draft && viewer != &1.creator,
        do: error(:not_found),
        else: ok(&1)
    )
    |> fmap(&filter_notes(&1, viewer))
    |> convert_error(:not_found, UserError.not_found())
  end

  def get_conversations(%{id: id} = viewer) do
    get_conversations(id)
    # TODO: hack. debug db query
    |> Enum.sort_by(& &1.occurred_at, {:desc, DateTime})
    |> Enum.map(&filter_notes(&1, viewer))
    |> ok()
  end

  def get_conversations(viewer_id) do
    from(c in Conversation,
      preload: ^@preloads,
      where: c.status != :deleted,
      where: c.creator_id == ^viewer_id,
      left_join: p in assoc(c, :participations),
      or_where: p.participant_id == ^viewer_id
    )
    |> Repo.all()
  end

  ## Helpers

  def notify_creator_of_participation(participation, conversation_url) do
    conversation = participation.conversation
    recipient = conversation.creator

    Absinthe.Subscription.publish(
      AppWeb.Endpoint,
      participation,
      conversation_joined: participation.conversation_id
    )

    body =
      Notification.sms_message(
        "#{participation.participant.name} joined your conversation #{conversation_url}"
      )

    participant = participation.participant

    App.Task.async_nolink(fn ->
      Notification.changeset(%Notification{}, %{
        kind: :conversation_joined,
        body: body,
        conversation: conversation,
        participant: participant,
        recipient: recipient,
        delivered_at: Timex.now()
      })
      |> Repo.insert()
      |> fmap(&(App.Notifications.send(%{to: recipient.e164, body: body}) && &1))
    end)

    participation
  end

  defun notify_registered_invitees(conversation :: Conversation.t()) ::
          Conversation.t() do
    creator_name = conversation.creator.name
    url = Conversation.join_url(conversation)
    body = Notification.sms_message("#{creator_name} invited you to a conversation: #{url}")

    contact_ids =
      conversation.invitees
      |> Enum.filter(&(&1.is_contact == true))
      |> Enum.map(& &1.id)

    recipients = Repo.all(from(c in Customer, where: c.id in ^contact_ids))

    App.Task.async_nolink(fn ->
      Enum.each(recipients, fn recipient ->
        Notification.changeset(%Notification{}, %{
          kind: :proposed,
          body: body,
          conversation: conversation,
          recipient: recipient,
          delivered_at: Timex.now()
        })
        |> Repo.insert()
        |> fmap(&(App.Notifications.send(%{to: recipient.e164, body: body}) && &1))
      end)
    end)

    conversation
  end
end
