defmodule App.SettingsEvent do
  use App.Schema
  import Ecto.Changeset
  alias App.{Customer}

  typed_schema "settings_events" do
    timestamps(type: :utc_datetime_usec)
    field(:occurred_at, :utc_datetime_usec)
    belongs_to(:customer, Customer)

    field(:kind, Ecto.Enum,
      values: [:unsubscribe_digest],
      default: :unsubscribe_digest
    )
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:occurred_at, :customer_id, :kind])
    |> validate_required([:occurred_at, :customer_id, :kind])
  end
end
