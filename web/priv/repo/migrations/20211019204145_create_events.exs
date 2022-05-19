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
      timestamps()
    end

    create(unique_index(:customers, [:e164]))

    create table(:tokens) do
      add(:value, :string, null: false)
      add(:customer_id, references(:customers, on_delete: :delete_all))
      timestamps()
    end

    create(unique_index(:tokens, [:value]))
    create(index(:tokens, [:customer_id]))
  end
end
