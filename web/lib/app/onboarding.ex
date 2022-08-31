defmodule App.Onboarding do
  use App.Types
  use Brex.Result
  use Croma
  use TypedStruct
  alias App.{UserError, Repo, Customer}

  @type prop :: String.t()
  @type value :: String.t()
  @type result() :: Brex.Result.s(Customer.t() | UserError.t())

  defun patch_profile(id :: ulid(), prop :: prop(), value :: value()) :: result() do
    key = String.to_atom(prop)
    attrs = %{:id => id, key => value}

    Repo.get(Customer, id)
    |> lift(nil, "MIA: Customer #{id}")
    |> fmap(&Customer.onboarding_changeset(&1, attrs))
    |> bind(&Repo.update/1)
  end
end
