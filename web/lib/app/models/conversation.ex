defmodule App.Conversation do
  use App.Schema
  import Ecto.Changeset
  import App.Types

  typed_schema "conversations" do
    belongs_to :creator, App.Customer

    embeds_many :invitees, Invitee do
      field :name, :string, enforce: true
    end

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast_embed(:invitees, with: &invitee_changeset/2)
    |> cast_assoc(attrs, [:creator])
    # NOTE: invitees aren't required, once removed state == deleted
    |> validate_required([:creator])
  end

  def invitee_changeset(record, attrs) do
    record
    |> cast(attrs, [:name])
    |> validate_required(:name, trim: true)
    |> validate_length(:name, min: 1)
  end
end
