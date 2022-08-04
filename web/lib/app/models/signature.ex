defmodule App.Signature do
  use App.Schema
  use Croma
  use Brex.Result
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Conversation}
  alias Ecto.Changeset

  typed_schema "signatures" do
    belongs_to(:conversation, Conversation)
    belongs_to(:signer, Customer)
    field(:signed_at, :utc_datetime_usec)
    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :signed_at])
    |> put_assoc(:signer, attrs[:signer])
    |> put_assoc(:conversation, attrs[:conversation])
    |> validate_required([:conversation, :signer, :signed_at])
    |> validate_signer()
    |> validate_conversation_is_signable()
    |> unique_constraint([:conversation_id, :signer_id])
  end

  defun validate_conversation_is_signable(changeset :: Changeset.t()) :: Changeset.t() do
    validate_change(changeset, :conversation, fn :conversation, _value ->
      conversation = get_field(changeset, :conversation)
      inviteeCount = Enum.count(conversation.invitees)
      sigCount = Enum.count(conversation.signatures)
      IO.puts("sigs #{sigCount} >= invitees #{inviteeCount}")

      if sigCount >= inviteeCount do
        [conversation: "has already been signed by all participants."]
      else
        []
      end
    end)
  end

  defun validate_signer(changeset :: Changeset.t()) :: Changeset.t() do
    validate_change(changeset, :conversation, fn :conversation, _value ->
      signer = get_field(changeset, :signer)
      conversation = get_field(changeset, :conversation)
      signer_id = signer.id
      creator_id = conversation.creator_id

      if signer_id == creator_id do
        [conversation: "creator cannot also sign it."]
      else
        []
      end
    end)
  end

  defun signed_sms_message(
          signature :: __MODULE__.t(),
          conversation_url :: String.t()
        ) :: String.t() do
    brand = System.get_env("PRODUCT_NAME")
    datetime = signature.conversation.occurred_at
    dateFormatted = Timex.format!(datetime, "%B %d", :strftime)

    "(#{brand}) #{signature.signer.name} cosigned your notes #{conversation_url}"
  end
end
