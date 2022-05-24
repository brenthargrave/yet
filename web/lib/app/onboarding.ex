defmodule App.Onboarding do
  use Croma
  use TypedStruct
  use Brex.Result
  alias App.{UserError, Repo}
  alias App.Onboarding.{Customer}

  @type ulid :: Ecto.ULID.t()
  @type prop :: String.t()
  @type value :: String.t()
  @type result() :: Brex.Result.t(Customer.t() | UserError.t())

  defun update_profile(id :: ulid(), prop :: prop(), value :: value()) :: result() do
    key = String.to_atom(prop)
    attrs = %{:id => id, key => value}

    result =
      Repo.get(Customer, id)
      |> lift(nil, :not_found)
      |> bind(&Customer.changeset(&1, attrs))
      |> bind(&Repo.update(&1))

    IO.puts(inspect(result))
    result
  end
end
