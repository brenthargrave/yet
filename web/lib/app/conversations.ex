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
    Contact,
    Review,
    Customer,
    Notification,
    Timeline
  }

  import Ecto.Query
  import App.Helpers, only: [format_ecto_errors: 1]

  @preloads [
    :creator,
    :opps,
    signatures: [:signer, :conversation],
    reviews: [:reviewer, :conversation],
    mentions: [:opp]
  ]

  def preloads() do
    @preloads
  end

  defun upsert_conversation(
          customer,
          %{id: id, invitees: invitees, note: note, occurred_at: occurred_at, mentions: mentions} =
            _input
        ) :: Brex.Result.s(Conversation.t()) do
    attrs = %{
      creator: customer,
      id: id,
      invitees: invitees,
      note: note,
      mentions: Enum.map(mentions, &Map.put(&1, :conversation_id, id)),
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
    # NOTE: disable edititing once proposed
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
  end

  defun get_conversation(id :: id()) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
  end

  defun delete_conversation(
          id :: id(),
          viewer :: Customer.t()
        ) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator == viewer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Conversation.tombstone_changeset(&1))
    |> bind(&Repo.insert_or_update(&1))
  end

  defun get_conversations(viewer :: Customer.t()) :: Brex.Result.s(list(Conversation.t())) do
    signed =
      from(c in Conversation,
        preload: ^@preloads,
        join: signature in assoc(c, :signatures),
        where: signature.signer_id == ^viewer.id,
        where: c.status != :deleted
      )

    reviewed =
      from(c in Conversation,
        preload: ^@preloads,
        join: review in assoc(c, :reviews),
        where: review.reviewer_id == ^viewer.id,
        where: c.status != :deleted
      )

    created =
      from(c in Conversation,
        preload: ^@preloads,
        where: c.creator_id == ^viewer.id,
        where: c.status != :deleted
      )

    Repo.all(from(c in created, union: ^signed, union: ^reviewed))
    |> ok()
  end

  defun sign_conversation(
          customer,
          %{id: id, conversation_url: conversation_url} = input
        ) :: Brex.Result.s(Conversation.t()) do
    attrs = %{
      signer: customer,
      signed_at: Map.get(input, :signed_at) || Timex.now()
    }

    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> fmap(&Map.put(attrs, :conversation, &1))
    # TODO: multi
    |> fmap(&Signature.changeset(%Signature{}, &1))
    |> bind(&Repo.insert(&1))
    |> fmap(&tap_notify_creator_of_signature(&1, conversation_url))
    |> fmap(&Conversation.signed_changeset/1)
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Repo.preload(&1, @preloads, force: true, in_parallel: true))
    |> fmap(&Conversation.update_subscriptions/1)
    |> fmap(&Timeline.async_handle_published(&1, true))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  defun propose_conversation(
          customer,
          %{id: id} = _input
        ) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator == customer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Conversation.proposed_changeset/1)
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Conversation.update_subscriptions/1)
    |> fmap(&notify_registered_invitees/1)
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  defun review_conversation(
          customer,
          %{id: id} = _input
        ) :: Brex.Result.s(Conversation.t()) do
    attrs = %{reviewer: customer}

    Repo.get(Conversation, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    # NOTE: can't review own conversation
    |> bind(&if &1.creator != customer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Map.put(attrs, :conversation, &1))
    |> fmap(&Review.changeset(%Review{}, &1))
    |> bind(&Repo.insert_or_update(&1, on_conflict: :nothing))
    |> fmap(& &1.conversation)
    |> fmap(&Conversation.update_subscriptions/1)
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  ## Helpers

  def clear_signatures(conversation_id) do
    Repo.delete_all(from(s in Signature, where: s.conversation_id == ^conversation_id))
  end

  def clear_reviews(conversation_id) do
    Repo.delete_all(from(r in Review, where: r.conversation_id == ^conversation_id))
  end

  defun tap_notify_creator_of_signature(
          signature :: Signature.t(),
          conversation_url :: String.t()
        ) ::
          Signature.t() do
    to = signature.conversation.creator.e164
    body = Signature.signed_sms_message(signature, conversation_url)

    Task.Supervisor.async_nolink(App.TaskSupervisor, fn ->
      App.Notifications.send(%{to: to, body: body})
    end)

    signature
  end

  defun notify_registered_invitees(conversation :: Conversation.t()) :: Conversation.t() do
    creator_name = conversation.creator.name
    url = Conversation.show_url(conversation)
    body = ~s<#{creator_name} has notes for you to cosign #{url}>

    contact_ids =
      conversation.invitees
      |> Enum.filter(&(&1.is_contact == true))
      |> Enum.map(& &1.id)

    recipients = Repo.all(from c in Customer, where: c.id in ^contact_ids)

    Task.Supervisor.async_nolink(App.TaskSupervisor, fn ->
      Enum.each(recipients, fn recipient ->
        Notification.changeset(%Notification{}, %{
          kind: :proposed,
          body: body,
          conversation: conversation,
          recipient: recipient,
          delivered_at: Timex.now()
        })
        |> Repo.insert()
        # TODO: Brex.Result tap()
        |> fmap(&(App.Notifications.send(%{to: recipient.e164, body: body}) && &1))
      end)
    end)

    conversation
  end
end
