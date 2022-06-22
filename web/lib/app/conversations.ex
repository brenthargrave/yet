defmodule App.Conversations do
  use Croma
  use TypedStruct
  use Brex.Result
  # alias App.{UserError, Repo, Customer}

  # @type ulid :: Ecto.ULID.t()
  # @type prop :: String.t()
  # @type value :: String.t()
  # @type result() :: Brex.Result.t(Customer.t() | UserError.t())

  # defun update_profile(id :: ulid(), prop :: prop(), value :: value()) :: result() do
  #   key = String.to_atom(prop)
  #   attrs = %{:id => id, key => value}

  #   Repo.get(Customer, id)
  #   |> lift(nil, "MIA: Customer #{id}")
  #   |> fmap(&Customer.onboarding_changeset(&1, attrs))
  #   |> bind(&Repo.update/1)
  # end

  # TODO: authenticated user
end
