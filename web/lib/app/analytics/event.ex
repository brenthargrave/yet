defmodule App.Analytics.Event do
  use App.Schema
  import Ecto.Changeset

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
