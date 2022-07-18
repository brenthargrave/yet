defmodule App.Conversations do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  alias App.Conversation
  alias App.Repo
  import Ecto.Query

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
    |> Repo.preload(:creator)
    |> lift(nil, :not_found)
    |> convert_error(:not_found, %Conversation{})
    |> bind(&if &1.creator_id != customer.id, do: error(:unauthorized), else: ok(&1))
    |> fmap(&Conversation.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
  end

  defun get_conversation(
          id :: id(),
          viewer :: Customer.t()
        ) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> Repo.preload(:creator)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator_id == viewer.id, do: ok(&1), else: error(:unauthorized))
  end

  defun delete_conversation(
          id :: id(),
          viewer :: Customer.t()
        ) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator == viewer, do: ok(&1), else: error(:unauthorized))
    |> fmap(&Conversation.tombstone_changeset(&1))
    |> bind(&Repo.insert_or_update(&1))
  end

  defun get_conversations(viewer :: Customer.t()) :: Brex.Result.s(list(Converstion.t())) do
    Repo.all(
      from(c in Conversation,
        preload: :creator,
        where: c.creator_id == ^viewer.id,
        where: c.status != :deleted
      )
    )
    |> lift(nil, :not_found)
  end
end
