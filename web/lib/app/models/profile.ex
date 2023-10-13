defmodule App.Profile do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import EctoCommons.EmailValidator

  typed_schema "customers" do
    timestamps(type: :utc_datetime_usec)
    field(:e164, :string, null: false)
    field(:name, :string, null: false)
    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:org, :string)
    field(:role, :string)
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

  def onboarding_changeset(record, %{first_name: _first_name} = attrs) do
    record
    |> handle_single_attr(attrs, :first_name)
  end

  def onboarding_changeset(record, %{last_name: _last_name} = attrs) do
    record
    |> handle_single_attr(attrs, :last_name)
  end

  def onboarding_changeset(record, %{email: _email} = attrs) do
    record
    |> handle_single_attr(attrs, :email)
    |> validate_email(:email, checks: [:html_input])
  end

  def onboarding_changeset(record, %{org: _} = attrs) do
    record
    |> handle_single_attr(attrs, :org)
  end

  def onboarding_changeset(record, %{role: _} = attrs) do
    record
    |> handle_single_attr(attrs, :role)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:first_name, :last_name, :email, :org, :role])
    |> validate_single_attr(:first_name)
    |> validate_single_attr(:last_name)
    |> validate_single_attr(:email)
    |> update_name(record)
  end

  defp handle_single_attr(record, attrs, attr) do
    record
    |> cast(attrs, [attr])
    |> validate_single_attr(attr)
    |> update_name(record)
  end

  defp validate_single_attr(changeset, attr) do
    changeset
    |> update_change(attr, &String.trim/1)
    |> validate_required(attr)
    |> validate_length(attr, min: 2)
  end

  defp update_name(changeset, record) do
    first_name = get_field(changeset, :first_name, record.first_name)
    last_name = get_field(changeset, :last_name, record.last_name)

    name =
      [first_name, last_name]
      |> Enum.reject(fn x -> is_nil(x) end)
      |> Enum.join(" ")

    changeset
    |> put_change(:name, name)
  end
end
