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
    |> put_change(:owner_id, attrs[:owner].id)
    |> put_change(:opp_id, attrs[:opp].id)
    |> put_change(:signature_id, attrs[:signature].id)
    |> foreign_key_constraint(:signature_id)
    |> unique_constraint([:signature_id, :opp_id])
    |> validate_required([:role, :org, :fee, :opp_id, :signature_id, :owner_id])
  end
end
