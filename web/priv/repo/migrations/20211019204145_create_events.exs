defmodule App.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events) do
      add :anon_id, :string, null: false
      add :name, :string, null: false
      timestamps()
    end

    create table(:customers) do
      add(:e164, :string, null: false)
      add(:token, :string, null: false)
      timestamps()
    end

    create(unique_index(:customers, [:e164]))
    create(unique_index(:customers, [:token]))
  end
end
