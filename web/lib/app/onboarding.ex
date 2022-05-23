defmodule App.Onboarding do
  use Croma
  use TypedStruct
  use Brex.Result
  import Ecto.Query

  alias App.{UserError, Repo}
  alias App.Onboarding.{Customer}

  @type id :: Ecto.ULID.t()
  @type name :: String.t()
  @type org :: String.t()
  @type role :: String.t()

  @type result() :: {:ok, Customer.t() | UserError.t()} | {:error, any()}
  # TODO: how to persist these values?
  # defun update_profile(id :: id(), prop :: String.t(), value :: String.t()) :: name(), org :: org(), role :: role()) :: term() do
  defun update_profile(id :: id(), prop :: String.t(), value :: String.t()) :: term() do
    # def update_profileid, name, org, role) do
    IO.puts(inspect("#{prop} #{value}"))
    key = String.to_atom(prop)
    IO.puts(inspect("#{key}"))

    # id = to_string(id)
    # IO.puts(inspect(id))
    # IO.puts(is_binary(id))
    id_str = to_string(id)
    attrs = %{:id => id, key => value}
    IO.puts(inspect(attrs))

    # Repo.get(Customer, id)

    from(c in Customer, where: c.id == ^id_str)
    |> Repo.one()
    |> lift(nil, :not_found)
    # |> fmap(fn customer -> Customer.changeset(customer, ~M{ id, name, org, role }) end)
    |> fmap(&Customer.changeset(&1, attrs))
    |> fmap(&Repo.update(&1))
  end
end
