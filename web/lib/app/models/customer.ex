defmodule App.Customer do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  use Brex.Result

  @type changeset :: Ecto.Changeset.t()

  typed_schema "customers" do
    field(:e164, :string, null: false)
    field(:token, :string)
    field(:name, :string, null: false)
    field(:org, :string)
    field(:role, :string)
    timestamps(type: :utc_datetime_usec)
  end

  def auth_changeset(customer, attrs) do
    customer
    |> cast(attrs, [:e164, :token])
    |> validate_required([:e164, :token])
    |> unique_constraint(:e164)
  end

  def onboarding_changeset(customer, %{name: _name} = attrs) do
    customer
    |> cast(attrs, [:name])
    |> validate_required(:name, trim: true)
    |> validate_length(:name, min: 2)
  end

  def onboarding_changeset(customer, %{org: _org} = attrs) do
    customer
    |> cast(attrs, [:org])
    |> validate_required(:org, trim: true)
    |> validate_length(:org, min: 2)
  end

  def onboarding_changeset(customer, %{role: _role} = attrs) do
    customer
    |> cast(attrs, [:role])
    |> validate_required(:role, trim: true)
    |> validate_length(:role, min: 2)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:e164])
  end
end
