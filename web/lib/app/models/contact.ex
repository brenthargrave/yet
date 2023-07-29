defmodule App.Contact do
  use App.Schema
  use Croma
  alias App.{Participation, Conversation}

  typed_schema "customers" do
    timestamps(type: :utc_datetime_usec)
    field(:e164, :string, null: false)
    field(:name, :string, null: false)
    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:org, :string)
    field(:role, :string)

    has_many(:participations, Participation,
      foreign_key: :participant_id,
      on_delete: :delete_all
    )

    has_many(:conversations, Conversation,
      foreign_key: :creator_id,
      on_delete: :delete_all
    )
  end

  defun get_ids(contacts :: list(Contact.t())) :: list(String.t()) do
    contacts
    |> Enum.map(&Map.get(&1, :id))
  end
end
