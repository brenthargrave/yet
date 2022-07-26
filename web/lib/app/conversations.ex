defmodule App.Conversations do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  alias App.{Repo, Conversation, Signature, Contact}
  import Ecto.Query

  @conversation_preloads [:creator, signatures: [:signer, :conversation]]

  defun upsert_conversation(
          customer,
          %{id: id, invitees: invitees, note: note, occurred_at: occurred_at} = _input
        ) :: Brex.Result.s(Conversation.t()) do
    attrs = %{
      creator: customer,
      id: id,
      invitees: invitees,
      note: note,
      occurred_at: occurred_at || Timex.now()
    }

    Repo.get(Conversation, id)
    |> Repo.preload(@conversation_preloads)
    |> lift(nil, :not_found)
    |> convert_error(:not_found, %Conversation{})
    |> bind(
      &if !is_nil(&1.creator_id) && &1.creator_id != customer.id,
        do: error(:unauthorized),
        else: ok(&1)
    )
    |> fmap(&Conversation.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Repo.preload(&1, @conversation_preloads))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  defun get_conversation(id :: id()) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> Repo.preload(@conversation_preloads)
    |> lift(nil, :not_found)
  end

  defun delete_conversation(
          id :: id(),
          viewer :: Customer.t()
        ) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> Repo.preload(@conversation_preloads)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator == viewer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Conversation.tombstone_changeset(&1))
    |> bind(&Repo.insert_or_update(&1))
  end

  defun get_conversations(viewer :: Customer.t()) :: Brex.Result.s(list(Conversation.t())) do
    Repo.all(
      from(c in Conversation,
        preload: ^@conversation_preloads,
        where: c.creator_id == ^viewer.id,
        where: c.status != :deleted
      )
    )
    |> lift(nil, :not_found)
  end

  defun sign_conversation(
          customer,
          %{id: id} = input
        ) :: Brex.Result.s(Conversation.t()) do
    attrs = %{
      signer: customer,
      signed_at: Map.get(input, :signed_at) || Timex.now()
    }

    Repo.get(Conversation, id)
    |> Repo.preload(@conversation_preloads)
    |> lift(nil, :not_found)
    |> fmap(&Map.put(attrs, :conversation, &1))
    |> fmap(&Signature.changeset(%Signature{}, &1))
    |> bind(&Repo.insert(&1))
    |> fmap(& &1.conversation)
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  defp format_ecto_errors(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {message, _opts} -> message end)
    |> Enum.map(fn {k, v} -> "#{k} #{v}" end)
    |> error()
  end

  defun get_contacts(viewer :: Customer.t()) :: Brex.Result.s(list(term())) do
    Repo.all(
      from(contact in Contact,
        join: sig in assoc(contact, :signatures),
        join: convo in assoc(sig, :conversation),
        where: convo.creator_id == ^viewer.id,
        where: convo.status != :deleted
      )
    )
  end

  ## Helpers

  def clear_signatures(conversation_id) do
    Repo.delete_all(from(s in Signature, where: s.conversation_id == ^conversation_id))
  end
end
