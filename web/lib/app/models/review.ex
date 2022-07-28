defmodule App.Review do
  use App.Schema
  use Croma
  use Brex.Result
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Conversation}
  alias Ecto.Changeset

  typed_schema "reviews" do
    belongs_to(:conversation, Conversation)
    belongs_to(:reviewer, Customer)
    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:id])
    |> put_assoc(:reviewer, attrs[:reviewer])
    |> put_assoc(:conversation, attrs[:conversation])
    |> validate_required([:conversation, :reviewer])
    |> unique_constraint([:conversation_id, :reviewer_id])
  end
end
