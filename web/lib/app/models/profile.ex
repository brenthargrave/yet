defmodule App.Profile do
  use App.Schema
  use Croma
  import Ecto.Changeset
  import EctoCommons.EmailValidator

  typed_schema "customers" do
    timestamps(type: :utc_datetime_usec)
    field(:e164, :string, null: false)
    field(:name, :string, null: false)
    field(:email, :string)
    field(:org, :string)
    field(:role, :string)
  end

  def changeset(record, attrs) do
    record
    |> cast(attrs, [:name])
    |> update_change(:name, &String.trim/1)
    |> validate_required(:name)
    |> validate_length(:name, min: 2)
  end

  def onboarding_changeset(record, %{name: _name} = attrs) do
    record
    |> handle_single_attr(attrs, :name)
  end

  def onboarding_changeset(record, %{email: _email} = attrs) do
    record
    |> handle_single_attr(attrs, :email)
    |> validate_email(:email, checks: [:html_input])
  end

  defp handle_single_attr(profile, attrs, attr) do
    profile
    |> cast(attrs, [attr])
    |> update_change(attr, &String.trim/1)
    |> validate_required(attr)
    |> validate_length(attr, min: 2)
  end
end
