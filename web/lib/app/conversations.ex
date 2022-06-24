defmodule App.Conversations do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  alias App.Conversation
  alias App.Repo

  @type input :: {
          id :: ulid()
        }

  # defun upsert_conversation(
  #         customer :: Customer.t(),
  #         %{id: id} = input :: input()
  #       ) :: Brex.Result.s(Conversation.t()) do
  #   case Repo.get(Conversaton, id) do
  #     nil -> %Conversation{id: id}
  #     conversation -> conversation
  #   end
  #   |> lift(&(customer.id != &1.creator_id), :unauthorized)
  #   |> fmap(&Conversation.changeset(&1, input))
  #   |> fmap(&Repo.insert_or_update(&1))
  # end
  def upsert_conversation(
        customer,
        %{id: id, invitees: invitees} = input
      ) do
    IO.inspect(input)

    attrs = %{
      id: id,
      invitees: invitees,
      creator: customer
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
    |> fmap(&Conversation.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
  end

  defun find_conversation(
          id :: id(),
          viewer :: Customer.t()
        ) :: Brex.Result.s(Conversation.t()) do
    Repo.get(Conversation, id)
    |> lift(nil, :not_found)
    |> bind(&if &1.creator != viewer, do: ok(&1), else: error(:unauthorized))
  end
end
