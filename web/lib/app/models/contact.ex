defmodule App.Contact do
  use App.Schema
  use Croma
  alias App.{Signature, Conversation}

  typed_schema "customers" do
    field(:name, :string, null: false)
    field(:org, :string)
    field(:role, :string)
    timestamps(type: :utc_datetime_usec)

    has_many :signatures, Signature,
      foreign_key: :signer_id,
      on_delete: :delete_all

    has_many :conversations, Conversation,
      foreign_key: :creator_id,
      on_delete: :delete_all
  end

  defun get_ids(contacts :: list(Contact.t())) :: list(String.t()) do
    contacts
    |> Enum.map(&Map.get(&1, :id))
  end
end
