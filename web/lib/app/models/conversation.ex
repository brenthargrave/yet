defmodule App.Conversation do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  import Ecto.Query

  alias App.{
    Customer,
    Signature,
    Mention,
    Participation,
    Note,
    # migration only
    Repo,
    Conversation,
    Conversations
  }

  typed_schema "conversations" do
    embeds_many :invitees, Invitee, on_replace: :delete do
      field(:name, :string, enforce: true)
      field(:is_contact, :boolean, enforce: true)
    end

    field(:note, :string)
    belongs_to(:creator, Customer)

    field(:status, Ecto.Enum,
      values: [
        :draft,
        :proposed,
        :joined,
        :signed,
        :deleted
      ],
      default: :draft
    )

    field(:deleted_at, :utc_datetime_usec)
    field(:occurred_at, :utc_datetime_usec)
    field(:proposed_at, :utc_datetime_usec)

    has_many(:notes, Note)
    has_many(:signatures, Signature, on_delete: :delete_all)

    has_many(:mentions, Mention,
      on_delete: :delete_all,
      on_replace: :delete_if_exists
    )

    has_many(:participations, Participation, on_delete: :delete_all)

    has_many(:participants,
      through: [:participations, :participant],
      preload_order: [asc: :inserted_at]
    )

    has_many(:opps,
      through: [:mentions, :opp],
      preload_order: [desc: :inserted_at]
    )

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:id, :note, :occurred_at])
    |> put_assoc(:creator, attrs[:creator])
    # |> put_assoc(:mentions, attrs[:mentions])
    |> cast_embed(:invitees, with: &invitee_changeset/2)
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

  def joined_changeset(record) do
    record
    |> change(status: :joined)
  end

  def update_subscriptions(conversation) do
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

  defun join_url(conversation :: __MODULE__.t()) :: String.t() do
    base_url = show_url(conversation)
    ~s(#{base_url}/join)
  end

  def get_all_participants(conversation) do
    participants = conversation.participations |> Enum.map(&Map.get(&1, :participant))

    creator = conversation.creator
    [creator | participants]
  end

  def by_id(query, id), do: where(query, id: ^id)

  def migrate_all() do
    Repo.all(__MODULE__)
    # need sigs for participations
    |> Repo.preload(Conversations.preloads())
    |> Enum.map(fn conversation ->
      # participations
      Enum.map(conversation.signatures, fn sig ->
        Participation.changeset(%{
          participant: sig.signer,
          conversation: conversation,
          occurred_at: sig.inserted_at
        })
        |> Repo.insert_or_update()
      end)

      # notes
      note_status =
        case conversation.status do
          :draft ->
            :draft

          :proposed ->
            :draft

          :joined ->
            :draft

          :signed ->
            :posted

          :deleted ->
            :deleted
        end

      Note.changeset(%Note{}, %{
        id: Ecto.ULID.generate(),
        text: conversation.note,
        conversation_id: conversation.id,
        creator: conversation.creator,
        created_at: conversation.inserted_at,
        status: note_status,
        deleted_at: conversation.deleted_at,
        posted_at: conversation.proposed_at
      })
      |> Repo.insert_or_update()

      # conversation
      if conversation.status == :signed do
        conversation
        |> Conversation.joined_changeset()
        |> Repo.update()
      end
    end)
  end
end
