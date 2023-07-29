defmodule App.Participation do
  use App.Schema
  use Croma
  use Brex.Result
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Conversation, Notification}

  @primary_key {:id, :string, []}
  typed_schema "participations" do
    timestamps(type: :utc_datetime_usec)
    belongs_to(:conversation, Conversation)
    belongs_to(:participant, Customer)
    field(:occurred_at, :utc_datetime_usec)
  end

  def changeset(
        %{
          #
          participant: participant,
          conversation: conversation,
          occurred_at: occurred_at
        } = input
      ) do
    pid = participant.id
    cid = conversation.id
    id = "pid:#{pid}/cid:#{cid}"

    attrs = %{
      id: id,
      occurred_at: occurred_at
    }

    %__MODULE__{}
    |> cast(attrs, [:id, :occurred_at])
    |> put_assoc(:participant, participant)
    |> put_assoc(:conversation, conversation)
    |> validate_required([:id, :conversation, :participant, :occurred_at])
    |> validate_conversation_is_joinable()
    |> validate_not_creator()
    |> unique_constraint([:conversation_id, :participant_id])
  end

  def validate_conversation_is_joinable(changeset) do
    validate_change(changeset, :conversation, fn :conversation, _value ->
      conversation = get_field(changeset, :conversation)
      inviteeCount = Enum.count(conversation.invitees)
      existingCount = Enum.count(conversation.participations)

      if existingCount >= inviteeCount do
        [conversation: "has already been joined by all participants."]
      else
        []
      end
    end)
  end

  def validate_not_creator(changeset) do
    validate_change(changeset, :conversation, fn :conversation, _value ->
      participant = get_field(changeset, :participant)
      conversation = get_field(changeset, :conversation)
      participant_id = participant.id
      creator_id = conversation.creator_id

      if participant_id == creator_id do
        [conversation: "creator cannot also join."]
      else
        []
      end
    end)
  end

  def clear_all() do
    App.Repo.delete_all(__MODULE__)
  end
end
