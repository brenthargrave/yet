defmodule App.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events) do
      add :anon_id, :string, null: false
      add :name, :string, null: false
      # TODO
      # properties
      # user_id

      timestamps()
    end

  end
end
