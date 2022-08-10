defmodule App.Opp do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  alias App.{Customer}

  typed_schema "opps" do
    belongs_to :creator, Customer
    field :role, :string
    field :org, :string
    field :desc, :string

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:role, :org, :desc])
    |> put_assoc(:creator, attrs[:creator])
  end
end
