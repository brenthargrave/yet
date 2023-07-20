defmodule App.Customer do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import App.Types
  use Brex.Result
  # bulk update
  import Ecto.Query
  alias Ecto.Multi
  alias App.{Repo, Customer}

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
    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:org, :string)
    field(:role, :string)
    embeds_one(:stats, Stats, on_replace: :update)
    field(:digest, :boolean, null: false, default: true)
    ## oauth addditions
    field(:website, :string)
    field(:location, :string)
    field(:description, :string)
    # twitter
    field(:twitter_handle, :string)
    field(:twitter_image, :string)
    # facebook
    field(:facebook_id, :string)
    field(:facebook_handle, :string)
    field(:facebook_url, :string)
    field(:facebook_name, :string)
    field(:facebook_image, :string)
  end

  def auth_changeset(customer, attrs) do
    customer
    |> cast(attrs, [:e164, :token])
    |> validate_required([:e164, :token])
    |> unique_constraint(:e164)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:e164, :name, :first_name, :last_name])
  end

  def stats_changeset(customer, stats) do
    customer
    |> change(stats: stats)
  end

  def settings_changeset(customer, settings) do
    customer
    |> cast(settings, [:digest])
  end

  def authorization_changeset(record, attrs) do
    required = [:name, :first_name, :last_name, :email]

    optional = [
      :website,
      :location,
      :description,
      :twitter_handle,
      :twitter_image,
      :facebook_id,
      :facebook_handle,
      :facebook_url,
      :facebook_name,
      :facebook_image
    ]

    all = required ++ optional

    record
    |> cast(attrs, all)
    |> validate_required(required)
  end

  def update_all(customers_attrs) do
    Enum.reduce(customers_attrs, Multi.new(), fn attrs, multi ->
      email = attrs.email
      customer = Repo.one(from(c in Customer, where: c.email == ^email, limit: 1))
      [first | tail] = String.split(attrs.name)
      last = Enum.join(tail, " ")

      attrs = Map.merge(attrs, %{first_name: first, last_name: last})

      Multi.update(
        multi,
        {:customer, email},
        Customer.changeset(customer, attrs)
      )
    end)
    |> Repo.transaction()
  end
end
