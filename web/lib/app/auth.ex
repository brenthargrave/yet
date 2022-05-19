defmodule App.Auth do
  use Croma
  use TypedStruct
  use App.Types
  alias App.Auth.{Twilio, Token}

  typedstruct module: Verification, enforce: true do
    field :status, String.t()
  end

  typedstruct module: UserError, enforce: true do
    field :message, String.t()
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

  typedstruct module: SubmitCodeResult do
    field :verification, Verification.t(), enfoce: true
    # TODO: token model
    field :token, String.t()
  end

  @type submit_code_result() ::
          {:ok, SubmitCodeResult.t() | UserError.t()}
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
        # TODO: find/create Customer
        # TODO: find/create Token for customer
        # ! anywhere in the above, we can get low-level errors, how know if
        # they quality as UserError? we don't yet, assume there will be none,
        # but if one arises, { :error, "message"} back to absinthe
        # ? so, how to most efficiently pipe through
        case find_or_create_token_with_e164(e164) do
          {:ok, token} ->
            {:ok,
             %SubmitCodeResult{
               verification: %Verification{status: String.to_existing_atom(status)},
               token: token
             }}

          {:error, _} ->
            # ! what happens if person/create fails, or anything fails?
            # TODO: handle token failure
            nil
        end

      {:error, %{"message" => message} = _data, _http_status_code} ->
        {:error, message}
    end
  end

  defunp find_or_create_token_with_e164(e164: e164()) :: no_return() do
  end
end
