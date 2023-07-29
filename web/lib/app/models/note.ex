defmodule App.Note do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types

  alias App.{
    Customer,
    Conversation
  }

  typed_schema "notes" do
    belongs_to(:conversation, Conversation)
    belongs_to(:creator, Customer)
    field(:text, :string)

    field(:status, Ecto.Enum,
      values: [:draft, :deleted, :posted],
      default: :draft
    )

    field(:created_at, :utc_datetime_usec)
    field(:deleted_at, :utc_datetime_usec)
    field(:posted_at, :utc_datetime_usec)

    timestamps(type: :utc_datetime_usec)
  end

  @required_attrs [
    :id,
    :conversation_id,
    :status,
    :created_at
  ]

  @all_attrs @required_attrs ++ [:text, :deleted_at, :posted_at]

  def changeset(record, attrs) do
    record
    |> cast(attrs, @all_attrs)
    |> put_assoc(:creator, attrs[:creator])
    |> validate_required(@required_attrs)
  end

  def tombstone_changeset(record) do
    record
    |> change(
      status: :deleted,
      deleted_at: DateTime.utc_now()
    )
    |> validate_required(@required_attrs)
  end

  def post_changeset(record) do
    record
    |> change(
      status: :posted,
      posted_at: DateTime.utc_now()
    )
    |> validate_required(@required_attrs)
    |> validate_length(:text, min: 1)
  end
end
