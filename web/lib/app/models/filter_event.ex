defmodule App.FilterEvent do
  use App.Schema
  import Ecto.Changeset
  import App.Types
  import Ecto.Query

  @primary_key {:id, :string, []}
  typed_schema "filter_events" do
    timestamps(type: :utc_datetime_usec)

    field(:kind, Ecto.Enum,
      values: [:mute, :block],
      default: :mute
    )

    belongs_to(:creator, App.Customer)
    belongs_to(:profile, App.Profile)
    field(:occurred_at, :utc_datetime_usec)
    field(:active, :boolean, default: false)
  end

  def mute_changeset(attrs) do
    kind = :mute
    creator = attrs[:creator]
    cid = creator.id
    profile = attrs[:profile]
    pid = profile.id
    id = "k:#{kind}/cid:#{cid}/pid:#{pid}"
    attrs = Map.put(attrs, :id, id)

    %__MODULE__{}
    |> change(kind: kind)
    |> cast(attrs, [
      :id,
      :active,
      :occurred_at
    ])
    |> put_assoc(:creator, creator)
    |> put_assoc(:profile, profile)
    |> validate_required([
      :id,
      :active,
      :occurred_at,
      :creator,
      :profile
    ])
  end

  def latest(profile_id, creator_id) do
    from(e in __MODULE__,
      where: e.kind == :mute,
      where: e.profile_id == ^profile_id,
      where: e.creator_id == ^creator_id,
      order_by: [desc: :occurred_at],
      limit: 1
    )
  end

  def all_muted(profile_ids) do
    from(e in __MODULE__,
      where: e.active == true,
      where: e.profile_id in ^profile_ids
    )
  end
end
