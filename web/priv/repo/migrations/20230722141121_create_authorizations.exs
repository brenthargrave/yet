defmodule App.Repo.Migrations.CreateAuthorizations do
  use Ecto.Migration

  def change do
    create table(:authorizations) do
      timestamps()
      add(:customer_id, references(:customers), null: false)
      add(:provider, :string, null: false)
      add(:occurred_at, :utc_datetime_usec, null: false)
      add(:data, :map, default: %{})
      add(:token, :text)
      add(:secret, :text)
      add(:expires_at, :utc_datetime_usec)
    end

    alter table(:customers) do
      # common
      add(:website, :text)
      add(:location, :string)
      add(:description, :text)
      # twitter
      add(:twitter_handle, :string)
      add(:twitter_image, :text)
      # facebook
      add(:facebook_id, :string)
      add(:facebook_handle, :string)
      # url & name to build profile link
      add(:facebook_url, :text)
      add(:facebook_name, :string)
      add(:facebook_image, :text)
    end

    create(index(:customers, [:twitter_handle]))
    create(index(:customers, [:facebook_id]))
  end
end
