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

    create table(:reviews) do
      add :reviewer_id, references(:customers, on_delete: :delete_all)
      add :conversation_id, references(:conversations, on_delete: :delete_all)
      timestamps()
    end

    create(unique_index(:reviews, [:conversation_id, :reviewer_id]))
    create(index(:reviews, [:reviewer_id]))
    create(index(:reviews, [:conversation_id]))

    create table(:notifications) do
      add :kind, :string, null: false
      add :body, :string, null: false
      add :conversation_id, references(:conversations, on_delete: :delete_all)
      add :recipient_id, references(:customers, on_delete: :delete_all)
      add :delivered_at, :utc_datetime_usec, null: false
      timestamps()
    end

    create(index(:notifications, [:kind]))
    create(index(:notifications, [:delivered_at]))
    create(index(:notifications, [:conversation_id]))
    create(index(:notifications, [:recipient_id]))
    create(unique_index(:notifications, [:kind, :conversation_id, :recipient_id]))

    # NOTE: custom type for money
    # https://github.com/elixirmoney/money/tree/2bfeacf1b50dad17bc47bb9b0da7c262fe238e3b#serialization-to-postgresql-with-multiple-currency
    execute """
    CREATE TYPE public.money_with_currency AS (amount integer, currency varchar(3))
    """

    create table(:opps) do
      add :creator_id, references(:customers, on_delete: :delete_all)
      add :org, :string, null: false
      add :role, :string, null: false
      add :desc, :text
      add :url, :text
      add :fee, :money_with_currency, null: false
      timestamps()
    end

    create(index(:opps, [:creator_id]))
    create(index(:opps, [:org]))
    create(index(:opps, [:role]))
    create(index(:opps, [:url]))

    create table(:mentions, primary_key: false) do
      add :id, :string, primary_key: true
      add :conversation_id, references(:conversations, on_delete: :delete_all)
      add :opp_id, references(:opps, on_delete: :delete_all)
      timestamps()
    end

    create(index(:mentions, [:conversation_id]))
    create(index(:mentions, [:opp_id]))

    create table(:timeline_events, primary_key: false) do
      timestamps()
      add :id, :string, primary_key: true
      add :type, :string, null: false
      add :viewer_id, references(:customers, on_delete: :delete_all)
      add :occurred_at, :utc_datetime_usec, null: false
      # NOTE: type: conversation_published
      add :conversation_id, references(:conversations, on_delete: :delete_all)
    end

    create(unique_index(:timeline_events, [:id]))
    create(index(:timeline_events, [:type]))
    create(index(:timeline_events, [:viewer_id]))
    create(index(:timeline_events, [:occurred_at]))
    create(index(:timeline_events, [:conversation_id]))
  end
end
