defmodule App.Repo.Migrations.CreateNotes do
  alias ExTwilio.Participant
  use Ecto.Migration

  def change do
    # Participations
    create table(:participations, primary_key: false) do
      add(:id, :string, primary_key: true)
      add(:participant_id, references(:customers, on_delete: :delete_all))
      add(:conversation_id, references(:conversations, on_delete: :delete_all))
      add(:occurred_at, :utc_datetime_usec)
      timestamps()
    end

    create(unique_index(:participations, [:conversation_id, :participant_id]))
    create(index(:participations, [:participant_id]))
    create(index(:participations, [:conversation_id]))

    # Notes
    create table(:notes) do
      add(:conversation_id, references(:conversations, on_delete: :delete_all))
      add(:creator_id, references(:customers, on_delete: :delete_all))
      add(:text, :text)
      add(:status, :string)
      add(:created_at, :utc_datetime_usec)
      add(:deleted_at, :utc_datetime_usec)
      add(:posted_at, :utc_datetime_usec)
      timestamps()
    end

    create(index(:notes, [:conversation_id]))
    create(index(:notes, [:creator_id]))
    create(index(:notes, [:status]))
    create(index(:notes, [:created_at]))
    create(index(:notes, [:deleted_at]))
    create(index(:notes, [:posted_at]))

    execute("TRUNCATE TABLE notifications")
    # Notifications
    alter table(:notifications) do
      add(:unique_key, :string, null: false)
      add(:participant_id, references(:customers, on_delete: :delete_all))
      add(:note_id, references(:notes, on_delete: :delete_all))
    end

    create(unique_index(:notifications, :unique_key))
    drop(unique_index(:notifications, [:kind, :conversation_id, :recipient_id]))
    create(index(:notifications, [:participant_id]))
    create(index(:notifications, [:note_id]))
  end
end
