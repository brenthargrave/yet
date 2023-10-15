defmodule App.Repo.Migrations.AddProfileSocials do
  use Ecto.Migration

  def change do
    alter table(:customers) do
      add(:socials, {:array, :string}, default: [])
    end
  end
end
