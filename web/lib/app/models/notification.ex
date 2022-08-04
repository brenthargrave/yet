defmodule App.Notification do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  use Brex.Result
  alias App.{Customer, Conversation}

  @type changeset :: Ecto.Changeset.t()

  typed_schema "notifications" do
    field :kind, Ecto.Enum, values: [:proposed, :signed]
    field :body, :string
    belongs_to :recipient, Customer
    belongs_to :conversation, Conversation
    field :delivered_at, :utc_datetime_usec
    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:kind, :body, :delivered_at])
    |> validate_required([:kind, :body, :delivered_at])
    |> put_assoc(:recipient, attrs[:recipient])
    |> put_assoc(:conversation, attrs[:conversation])
    |> unique_constraint([:kind, :conversation_id, :recipient_id])
  end
end
