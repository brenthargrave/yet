defmodule App.Customer do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  use Brex.Result

  @type changeset :: Ecto.Changeset.t()

  defmodule Stats do
    use Ecto.Schema
    @primary_key false

    embedded_schema do
      field(:signature_count, :integer, default: 0)
    end

    def changeset(struct, params \\ %{}) do
      struct
      |> cast(params, [:signatures_count])
    end
  end

  typed_schema "customers" do
    timestamps(type: :utc_datetime_usec)
    field(:e164, :string, null: false)
    field(:token, :string)
    field(:name, :string, null: false)
    field(:email, :string)
    field(:org, :string)
    field(:role, :string)
    embeds_one(:stats, Stats, on_replace: :update)
  end

  def auth_changeset(customer, attrs) do
    customer
    |> cast(attrs, [:e164, :token])
    |> validate_required([:e164, :token])
    |> unique_constraint(:e164)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:e164])
  end

  def stats_changeset(customer, stats) do
    customer
    |> change(stats: stats)
  end
end
