defmodule App.Auth do
  use Croma
  use TypedStruct
  use App.Types
  alias App.Auth.{Twilio}

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
    case Twilio.create_verification(e164) do
      {:ok, %{status: status} = _payload} ->
        {:ok, %Verification{status: String.to_existing_atom(status)}}

      # NOTE: by default return all unexpected errors as absinthe/graphql errors
      {:error, %{"message" => message} = _data, _http_status_code} ->
        # TODO: push to sentry?
        {:error, message}
    end
  end

  typedstruct module: SubmitCodeResult do
    field :verification, Verification.t(), enfoce: true
    # TODO: token
  end

  @type submit_code_result() ::
          {:ok, SubmitCodeResult.t() | UserError.t()}
          | {:error, String.t()}

  defun submit_code(e164 :: e164(), code :: number()) :: submit_code_result() do
    res = Twilio.check_verification(e164, code)
    IO.puts(inspect(res))

    case res do
      # NOTE: when incorrect code is submitted to check, Twilio responds "pending"
      {:ok, %{status: "pending"} = _payload} ->
        # TODO: user errors need a code, copy should be determined client-side
        {:ok, %UserError{message: "Incorrect code."}}

      # NOTE: otherwise, pass "approved" or "cancelled" along as-is
      {:ok, %{status: status} = _payload} ->
        {:ok, %Verification{status: String.to_existing_atom(status)}}

      {:error, %{"message" => message} = _data, _http_status_code} ->
        # TODO: push to sentry?
        {:error, message}
    end
  end
end
