defmodule App.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    # Event
    create table(:events) do
      add :anon_id, :string, null: false
      add :name, :string, null: false
      # TODO
      # properties
      # user_id

      timestamps()
    end

    # Customer
    create table(:customers, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:phone, :string)
      add(:name, :string)
      timestamps()
    end

    create(unique_index(:customers, [:phone]))

    # Token
    create table(:tokens, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:value, :string)
      add(:customer_id, references(:customers, on_delete: :delete_all, type: :binary_id))
      timestamps()
    end

    create(unique_index(:tokens, [:value]))
    create(index(:tokens, [:customer_id]))
  end
end
