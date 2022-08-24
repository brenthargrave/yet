defmodule App.Opp do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Mention, Conversation}

  typed_schema "opps" do
    belongs_to :creator, Customer
    field :role, :string
    field :org, :string
    field :desc, :string
    field :url, :string
    field :fee, Money.Ecto.Composite.Type

    has_many :mentions, Mention, on_delete: :delete_all
    many_to_many :conversations, Conversation, join_through: "mentions"

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :role, :org, :desc, :fee, :url])
    |> validate_required([:id, :role, :org, :fee])
    |> put_assoc(:creator, attrs[:creator])
  end
end
