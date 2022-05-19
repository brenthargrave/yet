defmodule App.Analytics.Event do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.ULID, autogenerate: false}
  @foreign_key_type Ecto.ULID
  schema "events" do
    field :anon_id, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:name, :anon_id])
    |> validate_required([:name, :anon_id])
  end
end
