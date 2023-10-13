defmodule App.Repo.Migrations.CreateFilterEvents do
  use Ecto.Migration

  def change do
    create table(:filter_events, primary_key: false) do
      timestamps()
      add :id, :string, primary_key: true
      add(:kind, :string)
      add(:creator_id, references(:customers))
      add(:profile_id, references(:customers))
      add(:occurred_at, :utc_datetime_usec)
      add(:active, :boolean, default: false)
    end

    create(index(:filter_events, [:kind]))
    create(index(:filter_events, [:occurred_at]))
  end
end
