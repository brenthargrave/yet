defmodule App.Onboarding do
  use Croma
  use TypedStruct
  alias App.{UserError}

  @type id :: Ecto.ULID.t()
  @type name :: String.t()
  @type org :: String.t()
  @type role :: String.t()

  @type result() :: {:ok, Customer.t() | UserError.t()} | {:error, String.t()}
  defun update_profile(id :: id(), name :: name(), org :: org(), role :: role()) :: result() do
    IO.puts(inspect("#{name} #{org} #{role}"))
    # TODO: how to persist these values?
    # TODO: how convert ecto errors to abinsthe-useful error tuple
  end

  # defunp find_or_create_with_e164(e164 :: e164()) :: Brex.Result.s(Customer.t()) do
  #   existing =
  #     from(c in Customer, where: c.e164 == ^e164)
  #     |> Repo.one()

  #   if existing do
  #     {:ok, existing}
  #   else
  #     %Customer{}
  #     # TODO: token security
  #     |> Customer.changeset(%{e164: e164, token: Ecto.ULID.generate()})
  #     |> Repo.insert()
  #   end
  # end
end
