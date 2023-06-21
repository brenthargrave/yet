defmodule App.Analytics.Event do
  use App.Schema
  import Ecto.Changeset

  typed_schema "events" do
    field(:anon_id, :string)
    field(:name, :string)
    belongs_to(:customer, App.Customer)
    field(:properties, :map)
    timestamps(type: :utc_datetime_usec)
    field(:occurred_at, :utc_datetime_usec)
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:name, :anon_id, :customer_id, :properties, :occurred_at])
    |> validate_required([:name, :anon_id, :occurred_at])
  end
end
