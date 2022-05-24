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
  defun update_profile(id :: id(), prop :: String.t(), value :: String.t()) :: term() do
    key = String.to_atom(prop)
    attrs = %{:id => id, key => value}

    Repo.get(Customer, id)
    |> lift(nil, :not_found)
    |> fmap(&Customer.changeset(&1, attrs))
    |> fmap(&Repo.update(&1))
  end
end
