defmodule App.Conversation do
  use App.Schema
  import Ecto.Changeset
  import App.Types

  typed_schema "conversations" do
    embeds_many :invitees, Invitee do
      field :name, :string, enforce: true
    end

    field :note, :string
    belongs_to :creator, App.Customer
    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :note])
    |> put_assoc(:creator, attrs[:creator])
    |> cast_embed(:invitees, with: &invitee_changeset/2)
  end

  def invitee_changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :name])
    |> validate_required(:name, trim: true)
    |> validate_length(:name, min: 1)
  end
end
