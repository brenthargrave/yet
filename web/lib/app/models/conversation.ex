defmodule App.Conversation do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types

  alias App.{
    Customer,
    Signature,
    Review,
    Mention
  }

  typed_schema "conversations" do
    embeds_many :invitees, Invitee, on_replace: :delete do
      field :name, :string, enforce: true
      field :is_contact, :boolean, enforce: true
    end

    field :note, :string
    belongs_to :creator, Customer

    field :status, Ecto.Enum, values: [:draft, :proposed, :signed, :deleted], default: :draft
    field :deleted_at, :utc_datetime_usec
    field :occurred_at, :utc_datetime_usec
    field :proposed_at, :utc_datetime_usec
    field :participant_ids, {:array, :string}

    has_many :signatures, Signature, on_delete: :delete_all
    has_many :reviews, Review, on_delete: :delete_all
    has_many :mentions, Mention, on_delete: :delete_all, on_replace: :delete_if_exists

    has_many :opps,
      through: [:mentions, :opp],
      preload_order: [desc: :inserted_at]

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    creator = attrs[:creator]

    record
    |> cast(attrs, [:id, :note, :occurred_at])
    |> put_assoc(:creator, creator)
    |> put_assoc(:mentions, attrs[:mentions])
    |> cast_embed(:invitees, with: &invitee_changeset/2)
    |> IO.inspect(label: "THIS")
    |> change(participant_ids: append_ids(record.participant_ids || [], [creator.id]))
  end

  def invitee_changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :name, :is_contact])
    |> validate_required(:name, trim: true)
    |> validate_length(:name, min: 1)
    |> validate_required(:is_contact)
  end

  def tombstone_changeset(record) do
    record
    |> change(
      status: :deleted,
      deleted_at: DateTime.utc_now()
    )
  end

  def proposed_changeset(record) do
    record
    |> change(
      status: :proposed,
      proposed_at: Timex.now()
    )
  end

  def signed_changeset(signature) do
    record = signature.conversation

    participant_ids = append_ids(record.participant_ids, [signature.signer_id])

    record
    |> change(status: :signed)
    |> change(participant_ids: participant_ids)
  end

  defun update_subscriptions(conversation :: __MODULE__.t()) :: __MODULE__.t() do
    Absinthe.Subscription.publish(
      AppWeb.Endpoint,
      conversation,
      conversation_changed: conversation.id
    )

    conversation
  end

  defun show_url(conversation :: __MODULE__.t()) :: String.t() do
    ~s<https://#{System.get_env("HOST")}/c/#{conversation.id}>
  end

  defun get_participants(conversation :: __MODULE__.t()) :: list(Contact.t()) do
    signers = conversation.signatures |> Enum.map(&Map.get(&1, :signer))
    creator = conversation.creator
    [creator | signers]
  end

  defunp append_ids(old :: list(String.t()), new :: list(String.t())) :: list(String.t()) do
    old
    |> Enum.concat(new)
    |> List.flatten()
    |> Enum.uniq()
    |> IO.inspect()
  end
end
