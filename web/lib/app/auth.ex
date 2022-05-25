defmodule App.Auth do
  use Croma
  use TypedStruct
  use Brex.Result
  import Ecto.Query
  use App.Types
  alias App.Auth.{Twilio}
  alias App.{Repo, Customer, UserError}

  typedstruct module: Verification, enforce: true do
    field :status, String.t()
  end

  @type submit_phone_result() ::
          {:ok, Verification.t() | UserError.t()}
          | {:error, String.t()}

  defun submit_phone(e164 :: e164()) :: submit_phone_result() do
    response = Twilio.create_verification(e164)

    case response do
      {:ok, %{status: status} = _payload} ->
        {:ok, %Verification{status: String.to_existing_atom(status)}}

      # NOTE: by default return all unexpected errors as absinthe/graphql errors
      {:error, %{"message" => message} = _data, _http_status_code} ->
        {:error, message}
    end
  end

  typedstruct module: SubmitCodePayload do
    field :verification, Verification.t(), enforce: true
    field :me, Customer.t(), enforce: true
  end

  @type submit_code_result() ::
          {:ok, SubmitCodePayload.t() | UserError.t()}
          | {:error, String.t()}

  defun submit_code(e164 :: e164(), code :: number()) :: submit_code_result() do
    # TODO: event
    res = Twilio.check_verification(e164, code)
    IO.puts(inspect(res))

    case res do
      # NOTE: Twilio responds "pending" when incorrect code submitted
      {:ok, %{status: "pending"} = _payload} ->
        {:ok, %UserError{message: "Incorrect code."}}

      # NOTE: otherwise, pass "approved" or "cancelled" along as-is
      {:ok, %{status: status} = _payload} ->
        case find_or_create_with_e164(e164) do
          {:ok, customer} ->
            {:ok,
             %SubmitCodePayload{
               verification: %Verification{status: String.to_existing_atom(status)},
               me: customer
             }}

          {:error, _any} = error ->
            error
        end

      {:error, %{"message" => message} = _data, _http_status_code} ->
        {:error, message}
    end
  end

  defunp find_or_create_with_e164(e164 :: e164()) :: Brex.Result.s(Customer.t()) do
    existing =
      from(c in Customer, where: c.e164 == ^e164)
      |> Repo.one()

    if existing do
      {:ok, existing}
    else
      %Customer{}
      # TODO: token security
      |> Customer.auth_changeset(%{e164: e164, token: Ecto.ULID.generate()})
      |> Repo.insert()
    end
  end
end
