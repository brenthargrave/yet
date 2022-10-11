defmodule App.Repo.Migrations.RenameTimelineEventsTypeToKind do
  use Ecto.Migration

  def change do
    rename table(:timeline_events), :type, to: :kind

    create table(:settings_events) do
      timestamps()
      add :occurred_at, :utc_datetime_usec
      add :customer_id, references(:customers)
      add :kind, :string, null: false
    end

    alter table(:customers) do
      add(:digest, :boolean, default: true, null: false)
    end

    create(index(:customers, [:digest]))
  end
end
