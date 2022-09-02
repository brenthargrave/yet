defmodule App.Profile do
  use App.Schema
  use Croma
  import Ecto.Changeset

  typed_schema "customers" do
    timestamps(type: :utc_datetime_usec)
    field(:e164, :string, null: false)
    field(:name, :string, null: false)
    field(:email, :string)
    field(:org, :string)
    field(:role, :string)
    field(:contacts_ids, {:array, :string})
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:name])
    |> update_change(:name, &String.trim/1)
    |> validate_required(:name)
    |> validate_length(:role, min: 2)
  end
end
