defmodule App.Customer do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  use Brex.Result

  @type changeset :: Ecto.Changeset.t()

  typed_schema "customers" do
    timestamps(type: :utc_datetime_usec)
    field(:e164, :string, null: false)
    field(:token, :string)
    field(:name, :string, null: false)
    field(:org, :string)
    field(:role, :string)
    field(:contacts_ids, {:array, :string})
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
    |> update_change(:name, &String.trim/1)
    |> validate_required(:name)
    |> validate_length(:name, min: 2)
  end

  def onboarding_changeset(customer, %{org: _org} = attrs) do
    customer
    |> cast(attrs, [:org])
    |> update_change(:org, &String.trim/1)
    |> validate_required(:org)
    |> validate_length(:org, min: 2)
  end

  def onboarding_changeset(customer, %{role: _role} = attrs) do
    customer
    |> cast(attrs, [:role])
    |> update_change(:role, &String.trim/1)
    |> validate_required(:role)
    |> validate_length(:role, min: 2)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:e164])
  end

  def merged_contacts_changeset(record, ids) do
    merged_ids =
      MapSet.union(
        MapSet.new(record.contacts_ids),
        MapSet.new(ids)
      )
      |> MapSet.to_list()

    record
    |> change(contacts_ids: merged_ids)
  end
end
