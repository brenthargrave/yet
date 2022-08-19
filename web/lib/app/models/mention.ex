defmodule App.Mention do
  use App.Schema
  use Croma
  alias App.{Conversation, Opp}

  @primary_key {:id, :string, []}
  typed_schema "mentions" do
    belongs_to :conversation, Conversation
    belongs_to :opp, Opp
    timestamps(type: :utc_datetime_usec)
  end
end
