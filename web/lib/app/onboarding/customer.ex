defmodule App.Onboarding.Customer do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types

  typed_schema "customers" do
    field(:name, :string, null: false)
    field(:org, :string)
    field(:role, :string)
  end

  def changeset(customer, attrs) do
    customer
    |> cast(attrs, [:name, :org, :role])
    |> validate_required([:name])
  end
end
