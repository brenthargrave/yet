defmodule App.Payment do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Opp}

  typed_schema "payments" do
    timestamps(type: :utc_datetime_usec)

    field :status, Ecto.Enum, values: [:draft], default: :draft

    belongs_to :payer, Customer
    belongs_to :payee, Customer, on_replace: :nilify
    belongs_to :opp, Opp

    field :amount, Money.Ecto.Composite.Type
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :status, :amount])
    |> put_assoc(:payer, attrs[:payer])
    |> put_assoc(:payee, attrs[:payee])
    |> put_assoc(:opp, attrs[:opp])
    |> validate_required([:id, :status, :payer, :opp])

    # TODO: require payee/amount if status != :draft
  end
end
