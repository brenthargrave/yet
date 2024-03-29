defmodule App.TimelineEvent do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types

  alias App.{
    Conversation,
    Contact
  }

  @primary_key {:id, :string, []}
  typed_schema "timeline_events" do
    timestamps(type: :utc_datetime_usec)

    field(:kind, Ecto.Enum,
      values: [:conversation_published],
      default: :conversation_published
    )

    belongs_to(:viewer, Contact)

    field(:occurred_at, :utc_datetime_usec)

    # conversations_published
    belongs_to(:conversation, Conversation)

    field(:conversation_published_persona, Ecto.Enum,
      values: [
        :participant,
        :contact,
        :opportunist,
        :public
      ],
      default: :public
    )
  end

  def conversation_published_changeset(attrs) do
    kind = :conversation_published
    conversation = attrs[:conversation]
    vid = attrs[:viewer].id
    cid = conversation.id
    id = "t:#{kind}/cid:#{cid}/vid:#{vid}"
    attrs = Map.put(attrs, :id, id)

    first =
      conversation.participations
      |> Enum.sort_by(& &1.occurred_at, {:asc, DateTime})
      |> Enum.at(0)

    attrs = Map.put(attrs, :occurred_at, first.occurred_at)

    %__MODULE__{}
    |> change(kind: :conversation_published)
    |> cast(attrs, [:id, :occurred_at, :conversation_published_persona])
    |> put_assoc(:viewer, attrs[:viewer])
    |> put_assoc(:conversation, attrs[:conversation])
    |> validate_required([:conversation, :viewer])
    |> unique_constraint([:kind, :viewer, :conversation_id])
  end
end
