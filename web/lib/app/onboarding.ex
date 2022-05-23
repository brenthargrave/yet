defmodule App.Onboarding do
  use Croma
  use TypedStruct
  use Brex.Result
  import ShorterMaps
  alias App.{UserError, Repo}
  alias App.Onboarding.{Customer}

  @type id :: Ecto.ULID.t()
  @type name :: String.t()
  @type org :: String.t()
  @type role :: String.t()

  @type result() :: {:ok, Customer.t() | UserError.t()} | {:error, any()}
  # TODO: how to persist these values?
  # defun update_profile(id :: id(), name :: name(), org :: org(), role :: role()) :: term() do
  def update_profile(id, name, org, role) do
    IO.puts(inspect("#{name} #{org} #{role}"))

    Repo.get(Customer, id)
    |> lift(nil, :not_found)

    # |> fmap(fn customer -> Customer.changeset(customer, ~M{ id, name, org, role }) end)
    # |> Repo.update()
  end
end
