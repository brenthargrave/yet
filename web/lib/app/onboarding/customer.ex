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

  defun changeset(customer :: t(), attrs :: %{}) :: changeset() do
    customer
    |> cast(attrs, [:name, :org, :role])
    |> validate_required([:name, :org, :role], trim: true)
    |> validate_length([:name, :org, :role], min: 3)
  end
end
