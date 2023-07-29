defmodule App.Notes do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex

  alias App.{
    UserError,
    Repo,
    Note,
    Conversation,
    Conversations,
    Notification,
    Timeline
  }

  import App.Helpers, only: [format_ecto_errors: 1]

  @preloads [
    :creator,
    :conversation
  ]

  def preloads() do
    @preloads
  end

  def upsert(viewer, %{id: id} = input) do
    attrs =
      Map.take(input, ~w[
         id
         conversation_id
         created_at
         status
         text
       ]a)
      |> Map.put(:creator, viewer)

    Repo.get(Note, id)
    |> lift(nil, :not_found)
    |> convert_error(:not_found, %Note{})
    # NOTE: only creator can edit
    # TODO: share w/ App.Conversations
    |> bind(
      &if !is_nil(&1.creator_id) && &1.creator_id != viewer.id,
        do: error(:unauthorized),
        else: ok(&1)
    )
    # TODO: share w/ App.Conversations
    |> bind(
      &if Enum.member?([:draft], &1.status),
        do: ok(&1),
        else: error(:unauthorized)
    )
    |> fmap(&Repo.preload(&1, @preloads))
    |> fmap(&Note.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Repo.preload(&1, @preloads))
    |> fmap(&preload_conversation_for_viewer(&1, viewer))
    |> fmap(&update_conversation_subs(&1))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
    |> convert_error(:not_found, UserError.not_found())
    |> convert_error(:unauthorized, UserError.unauthorized())
  end

  def delete(id, viewer) do
    Repo.get(Note, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    # NOTE: for now, only creator can delete a note.
    |> bind(&if &1.creator == viewer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Note.tombstone_changeset(&1))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&preload_conversation_for_viewer(&1, viewer))
    |> fmap(&update_conversation_subs(&1))
    |> fmap(&Timeline.delete_note(&1))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
    |> convert_error(:not_found, UserError.not_found())
    |> convert_error(:unauthorized, UserError.unauthorized())
  end

  def post(id, viewer) do
    Repo.get(Note, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator == viewer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Note.post_changeset(&1))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&preload_conversation_for_viewer(&1, viewer))
    |> fmap(&update_conversation_subs(&1))
    |> fmap(&notify_other_participants(&1, viewer))
    |> fmap(&update_timelines(&1))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
    |> convert_error(:not_found, UserError.not_found())
    |> convert_error(:unauthorized, UserError.unauthorized())
  end

  defp preload_conversation_for_viewer(note, viewer) do
    conversation =
      Conversation
      |> Conversation.by_id(note.conversation_id)
      |> Repo.one()
      |> Repo.preload(Conversations.preloads())
      |> Conversations.filter_notes(viewer)

    Map.put(note, :conversation, conversation)
  end

  defp update_conversation_subs(note) do
    Absinthe.Subscription.publish(
      AppWeb.Endpoint,
      note,
      note_added: note.conversation_id
    )

    Conversation.update_subscriptions(note.conversation)
    note
  end

  defp notify_other_participants(note, viewer) do
    conversation = note.conversation

    all_participants =
      conversation.participations
      |> Enum.map(& &1.participant)
      |> Enum.concat([conversation.creator])

    recipients =
      all_participants
      |> Enum.reject(&(&1.id == viewer.id))

    App.Task.async_nolink(fn ->
      Enum.each(recipients, fn recipient ->
        url = Conversation.show_url(conversation)
        body = Notification.sms_message("#{viewer.name} just added a note: #{url}")

        Notification.changeset(%Notification{}, %{
          kind: :note_posted,
          body: body,
          recipient: recipient,
          note: note,
          conversation: conversation,
          delivered_at: Timex.now()
        })
        |> Repo.insert()
        |> fmap(&(App.Notifications.send(%{to: recipient.e164, body: body}) && &1))
      end)
    end)

    note
  end

  defp update_timelines(note) do
    Timeline.async_add(note.conversation, true)
    note
  end
end
