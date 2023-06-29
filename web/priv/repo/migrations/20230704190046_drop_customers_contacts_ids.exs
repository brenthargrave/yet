defmodule App.Repo.Migrations.DropCustomersContactsIds do
  use Ecto.Migration

  def up do
    alter table(:customers) do
      remove(:contacts_ids)
    end
  end

  def down do
    alter table(:customers) do
      add :contacts_ids, {:array, :string}, default: []
    end
  end
end
