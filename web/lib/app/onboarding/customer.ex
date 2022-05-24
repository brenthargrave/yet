defmodule App.Onboarding.Customer do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types

  @type changeset :: Ecto.Changeset.t()

  typed_schema "customers" do
    field(:name, :string, null: false)
    field(:org, :string)
    field(:role, :string)
  end

  def changeset(customer, %{name: _name} = attrs) do
    IO.puts("CUSTOMER: #{inspect(customer)}")

    customer
    |> cast(attrs, [:name])
    |> validate_required(:name, trim: true)
    |> validate_length(:name, min: 3)
  end

  def changeset(customer, %{org: _org} = attrs) do
    customer
    |> cast(attrs, [:org])
    |> validate_required(:org, trim: true)
    |> validate_length(:org, min: 3)
  end

  def changeset(customer, %{role: _role} = attrs) do
    customer
    |> cast(attrs, [:role])
    |> validate_required(:role, trim: true)
    |> validate_length(:role, min: 3)
  end
end
