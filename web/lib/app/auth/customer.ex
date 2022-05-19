defmodule App.Auth.Customer do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  use Brex.Result

  typed_schema "customers" do
    field(:e164, :string, null: false)
    field(:token, :string)
    timestamps()
  end

  def changeset(customer, attrs) do
    customer
    |> cast(attrs, [:e164, :token])
    |> validate_required([:e164, :token])
    |> unique_constraint(:e164)
  end
end
