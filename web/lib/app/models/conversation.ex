defmodule App.Conversation do
  use App.Schema
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Signature}

  typed_schema "conversations" do
    embeds_many :invitees, Invitee, on_replace: :delete do
      field :name, :string, enforce: true
    end

    field :note, :string
    belongs_to :creator, Customer

    field :status, Ecto.Enum, values: [:draft, :deleted], default: :draft
    field :deleted_at, :utc_datetime_usec
    field :occurred_at, :utc_datetime_usec

    has_many :signatures, Signature, on_delete: :delete_all

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :note, :occurred_at])
    |> put_assoc(:creator, attrs[:creator])
    |> cast_embed(:invitees, with: &invitee_changeset/2)
  end

  def invitee_changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :name])
    |> validate_required(:name, trim: true)
    |> validate_length(:name, min: 1)
  end

  def tombstone_changeset(record) do
    record
    |> change(
      status: :deleted,
      deleted_at: DateTime.utc_now()
    )
  end
end
