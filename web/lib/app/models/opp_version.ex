defmodule App.OppVersion do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Opp, Signature}

  typed_schema "opp_versions" do
    timestamps(type: :utc_datetime_usec)
    belongs_to :owner, Customer
    field :role, :string
    field :org, :string
    field :desc, :string
    field :url, :string
    field :fee, Money.Ecto.Composite.Type

    belongs_to :opp, Opp
    belongs_to :signature, Signature
  end

  def changeset(attrs) do
    %__MODULE__{}
    |> cast(attrs, [:role, :org, :fee, :desc, :url])
    |> put_assoc(:owner, attrs[:owner])
    |> put_assoc(:opp, attrs[:opp])
    |> put_assoc(:signature, attrs[:signature])
    |> validate_required([:role, :org, :fee, :opp, :signature])
    |> unique_constraint([:signature_id, :opp_id])
  end
end
