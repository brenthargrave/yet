defmodule App.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:customers) do
      add :e164, :string, null: false
      add :token, :string, null: false
      # profile
      add :name, :string
      add :org, :string
      add :role, :string
      timestamps()
    end

    create(unique_index(:customers, [:e164]))
    create(index(:customers, [:token]))
    create(index(:customers, [:name]))
    create(index(:customers, [:org]))
    create(index(:customers, [:role]))

    create table(:events) do
      add :anon_id, :string, null: false
      add :name, :string, null: false
      add :properties, :map
      add :customer_id, references(:customers)
      timestamps()
    end

    create(index(:events, [:anon_id]))
    create(index(:events, [:customer_id]))

    create table(:conversations) do
      add :creator_id, references(:customers, on_delete: :delete_all)
      add :invitees, :map
      add :note, :text
      add :status, :string
      add :deleted_at, :utc_datetime_usec
      add :occurred_at, :utc_datetime_usec
      add :proposed_at, :utc_datetime_usec
      timestamps()
    end

    create(index(:conversations, [:creator_id]))
    create(index(:conversations, [:status]))
    create(index(:conversations, [:deleted_at]))
    create(index(:conversations, [:occurred_at]))
    create(index(:conversations, [:proposed_at]))

    create table(:signatures) do
      add :signer_id, references(:customers, on_delete: :delete_all)
      add :conversation_id, references(:conversations, on_delete: :delete_all)
      add :signed_at, :utc_datetime_usec
      timestamps()
    end

    create(unique_index(:signatures, [:conversation_id, :signer_id]))
    create(index(:signatures, [:signer_id]))
    create(index(:signatures, [:conversation_id]))
    create(index(:signatures, [:signed_at]))
  end
end
