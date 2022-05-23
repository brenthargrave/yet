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

  defun changeset(customer :: t(), %{id: id, name: name} = attrs :: %{}) :: changeset() do
    customer
    |> cast(attrs, [:name])
    |> validate_required([:name], trim: true)
    |> validate_length([:name], min: 3)
  end

  defun changeset(customer :: t(), %{id: id, org: org} = attrs :: %{}) :: changeset() do
    customer
    |> cast(attrs, [:org])
    |> validate_required([:org], trim: true)
    |> validate_length([:org], min: 3)
  end

  defun changeset(customer :: t(), %{id: id, role: role} = attrs :: %{}) :: changeset() do
    customer
    |> cast(attrs, [:role])
    |> validate_required([:role], trim: true)
    |> validate_length([:role], min: 3)
  end

  # defun changeset(customer :: t(), attrs :: %{}) :: changeset() do
  #   customer
  #   |> cast(attrs, [:name, :org, :role])
  #   |> validate_required([:name, :org, :role], trim: true)
  #   |> validate_length([:name, :org, :role], min: 3)
  # end
end
