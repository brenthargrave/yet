defmodule App.Signature do
  use App.Schema
  use Croma
  use Brex.Result
  import Ecto.Changeset
  import App.Types
  alias App.{Customer, Conversation, OppVersion, Signature}
  alias Ecto.Changeset
  import Ecto.Query
  alias App.Repo

  typed_schema "signatures" do
    timestamps(type: :utc_datetime_usec)
    belongs_to(:conversation, Conversation)
    belongs_to(:signer, Customer)
    field(:signed_at, :utc_datetime_usec)
    has_many(:opp_versions, OppVersion, on_delete: :delete_all)
  end

  def changeset(attrs) do
    %__MODULE__{}
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
    # datetime = signature.conversation.occurred_at
    # dateFormatted = Timex.format!(datetime, "%B %d", :strftime)

    "(#{brand}) #{signature.signer.name} cosigned your notes #{conversation_url}"
  end

  defun update_stats(signature :: __MODULE__.t()) :: __MODULE__.t() do
    App.Task.async_nolink(fn ->
      signer = signature.signer

      count =
        from(signature in Signature, where: signature.signer_id == ^signer.id, select: count())
        |> Repo.one()

      signer
      |> Customer.stats_changeset(%{signature_count: count})
      |> Repo.update()
    end)

    signature
  end
end
