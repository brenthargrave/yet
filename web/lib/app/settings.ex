defmodule App.Settings do
  import Ecto.Query, warn: false
  use Brex.Result
  use Croma
  alias Ecto.{Multi}
  alias App.{Repo, SettingsEvent, Customer}

  defun unsubscribe(input) :: Brex.Result.s(SettingsEvent.t()) do
    customer = Repo.get(Customer, input.customer_id)

    event_changeset = SettingsEvent.changeset(%SettingsEvent{}, input)
    customer_changeset = Customer.settings_changeset(customer, %{digest: false})

    Multi.new()
    |> Multi.insert(:settings_event, event_changeset)
    |> Multi.update(:customer, customer_changeset)
    |> Repo.transaction()
    |> fmap(& &1.settings_event)
  end
end
