defmodule App.Authorization do
  use App.Schema
  import Ecto.Changeset

  typed_schema "authorizations" do
    timestamps(type: :utc_datetime_usec)
    field(:occurred_at, :utc_datetime_usec, null: false)
    belongs_to(:customer, App.Customer, null: false)
    field(:provider, Ecto.Enum, values: [:twitter, :facebook], null: false)
    field(:data, :map)
    field(:token, :string)
    field(:secret, :string)
    field(:expires_at, :utc_datetime_usec)
  end

  @required_attrs [
    :customer_id,
    :occurred_at,
    :provider,
    :data,
    :token
  ]
  def changeset(record, attrs) do
    all_attrs = @required_attrs ++ [:secret, :expires_at]

    record
    |> cast(attrs, all_attrs)
    |> validate_required(@required_attrs)
  end
end
