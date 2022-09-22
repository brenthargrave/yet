defmodule App.Repo.Migrations.CreatePayments do
  use Ecto.Migration

  def change do
    create table(:payments) do
      timestamps()
      add :status, :string, null: false
      add :payer_id, references(:customers, on_delete: :delete_all), null: false
      add :payee_id, references(:customers, on_delete: :delete_all)
      add :opp_id, references(:opps, on_delete: :delete_all), null: false
      add :amount, :money_with_currency
    end

    create(index(:payments, [:payer_id]))
    create(index(:payments, [:payee_id]))
    create(index(:payments, [:opp_id]))
    create(index(:payments, [:status]))
    create(index(:payments, [:amount]))
  end
end
