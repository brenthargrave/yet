defmodule App.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events) do
      add :name, :string
      # user_id: user_id,
      # anon_id: anon_id,
      # properties: properties,
      # timestamp: timestamp.utc.iso8601

      timestamps()
    end

  end
end
