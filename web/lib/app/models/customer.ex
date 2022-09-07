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
    field(:email, :string)
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
