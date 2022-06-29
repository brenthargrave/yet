defmodule App.Conversations do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  alias App.Conversation
  alias App.Repo
  import Ecto.Query

  defun upsert_conversation(
          customer,
          %{id: id, invitees: invitees, note: note} = _input
        ) :: Brex.Result.s(Conversation.t()) do
    attrs = %{
      creator: customer,
      id: id,
      invitees: invitees,
      note: note
    }

    Conversation
    |> Repo.get(id)
    |> Repo.preload(:creator)
    |> case do
      nil ->
        ok(%Conversation{})

      conversation ->
        if conversation.creator != customer,
          do: error(:unauthorized),
          else: ok(conversation)
    end
    # |> lift(nil, :not_found)
    # |> convert_error(:not_found, %Conversation{})
    # |> bind(&if &1.creator != customer, do: error(:unauthorized), else: ok(&1))
    |> fmap(&Conversation.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
  end

  defun get_conversation(
          id :: id(),
          viewer :: Customer.t()
        ) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator != viewer, do: ok(&1), else: error(:unauthorized))
  end

  @type conversations :: list(Converstion.t())
  defun get_conversations(viewer :: Customer.t()) :: Brex.Result.s(conversations) do
    Repo.all(from(c in Conversation, where: c.creator_id == ^viewer.id))
    |> lift(nil, :not_found)
  end
end
