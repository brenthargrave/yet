defmodule App.TimelineEvent do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  alias App.{Conversation, Contact}

  typed_schema "timeline_events" do
    timestamps(type: :utc_datetime_usec)

    field :type, Ecto.Enum,
      values: [:conversation_published],
      default: :conversation_published

    field :occurred_at, :utc_datetime_usec

    # conversations_published
    belongs_to :conversation, Conversation
  end

  def conversation_published_changeset(attrs) do
    %__MODULE__{}
    |> change(type: :conversation_published)
    |> change(occurred_at: attrs[:occurred_at])
    |> put_assoc(:conversation, attrs[:conversation])
    |> validate_required([:conversation])
    |> unique_constraint([:type, :conversation_id])
  end
end
