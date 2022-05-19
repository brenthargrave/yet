defmodule App.Analytics.Event do
  use App.Schema
  import Ecto.Changeset

  typed_schema "events" do
    field :anon_id, :string
    field :name, :string
    timestamps(type: :utc_datetime_usec)
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:name, :anon_id])
    |> validate_required([:name, :anon_id])
  end
end
