defmodule App.Review do
  use App.Schema
  use Croma
  use Brex.Result
  import Ecto.Changeset
  import App.Types
  alias App.{Repo, Customer, Conversation}

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

  def replicate_all_participations do
    Repo.all(__MODULE__)
    |> Repo.preload([:reviewer, :conversation])
    |> Enum.each(fn review ->
      Map.take(review, [:conversation])
      |> Map.put(:participant, review.reviewer)
      |> Map.put(:occurred_at, review.inserted_at)
      |> App.Participation.changeset()
      |> Repo.insert_or_update(on_conflict: :nothing)
    end)
  end
end
