defmodule App.Conversations do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  import ShorterMaps
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
  def upsert_conversation(customer, %{id: id} = input) do
    case Repo.get(Conversation, id) do
      nil -> %Conversation{id: id}
      conversation -> conversation
    end
    |> lift(&(customer.id != &1.creator_id), :unauthorized)
    |> fmap(&Conversation.changeset(&1, input.input))
    |> fmap(&Repo.insert_or_update(&1))
  end
end
