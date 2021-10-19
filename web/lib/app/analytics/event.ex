defmodule App.Analytics.Event do
  use Ecto.Schema
  import Ecto.Changeset

  schema "events" do
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
