defmodule App.Onboarding do
  use Croma
  use TypedStruct
  use Brex.Result
  alias App.{UserError, Repo}
  alias App.Onboarding.{Customer}

  @type ulid :: Ecto.ULID.t()
  @type prop :: String.t()
  @type value :: String.t()
  @type result() :: {:ok, Customer.t() | UserError.t()} | {:error, any()}

  defun update_profile(id :: ulid(), prop :: prop(), value :: value()) :: result() do
    key = String.to_atom(prop)
    attrs = %{:id => id, key => value}

    Repo.get(Customer, id)
    |> lift(nil, :not_found)
    |> fmap(&Customer.changeset(&1, attrs))
    |> fmap(&Repo.update(&1))
    |> case do
      {:ok, customer} -> customer
      {:error, message: message} -> {:error, message}
    end
  end
end
