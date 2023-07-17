defmodule App.Repo.Migrations.AddCustomerFullName do
  use Ecto.Migration

  def change do
    alter table(:customers) do
      add(:first_name, :string)
      add(:last_name, :string)
    end

    create(index(:customers, [:first_name]))
    create(index(:customers, [:last_name]))
  end
end
