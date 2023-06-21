defmodule App.Repo.Migrations.AddEventsOccurredAt do
  use Ecto.Migration
  import Ecto.Query

  def up do
    # Event.properties

    from(e in "events",
      update: [set: [properties: "{}"]],
      where: is_nil(e.properties)
    )
    |> App.Repo.update_all([])

    alter table(:events) do
      add(:occurred_at, :utc_datetime_usec)
      modify(:properties, :map, default: "{}", null: false)
    end

    flush()

    from(event in "events",
      update: [set: [occurred_at: event.inserted_at]]
    )
    |> App.Repo.update_all([])

    ## Customer.stats

    alter table(:customers) do
      add(:stats, :map, default: "{}")
    end
  end

  def down do
    alter table(:events) do
      remove(:occurred_at)
      modify(:properties, :map)
    end

    ## Customer.stats

    alter table(:customers) do
      remove(:stats)
    end
  end
end
