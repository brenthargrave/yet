defmodule App.Notification do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  use Brex.Result

  alias App.{
    Customer,
    Conversation,
    Note
  }

  @type changeset :: Ecto.Changeset.t()

  typed_schema "notifications" do
    field(:kind, Ecto.Enum,
      values: [
        :proposed,
        :note_posted,
        :conversation_joined
      ]
    )

    field(:body, :string)
    belongs_to(:recipient, Customer)
    field(:delivered_at, :utc_datetime_usec)
    timestamps(type: :utc_datetime_usec)

    field(:unique_key, :string)
    belongs_to(:conversation, Conversation)
    belongs_to(:participant, Customer)
    belongs_to(:note, Note)
  end

  defp unique_key_from(attrs) do
    kind = attrs[:kind]
    rid = attrs[:recipient].id
    base = ~s(kind:#{kind}/rid:#{rid})

    cid = attrs[:conversation].id
    base_conv = ~s(#{base}/cid:#{cid})

    case kind do
      :proposed ->
        base_conv

      :conversation_joined ->
        pid = attrs[:participant].id
        ~s(#{base_conv}/pid:#{pid})

      :note_posted ->
        nid = attrs[:note].id
        ~s(#{base_conv}/nid:#{nid})
    end
  end

  @required_attrs [
    :kind,
    :body,
    :delivered_at,
    :unique_key
  ]

  def changeset(record, attrs) do
    attrs =
      attrs
      |> Map.put(:unique_key, unique_key_from(attrs))

    record
    |> cast(attrs, @required_attrs)
    |> validate_required(@required_attrs)
    |> put_assoc(:recipient, attrs[:recipient])
    |> put_assoc(:conversation, attrs[:conversation])
    |> put_assoc(:participant, attrs[:participant])
    |> put_assoc(:note, attrs[:note])
    |> unique_constraint(:unique_key)
  end

  def sms_message(message) do
    # brand = System.get_env("PRODUCT_NAME")
    # "(#{brand}) #{message}"
    "#{message}"
  end
end
