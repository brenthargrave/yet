defmodule App.Auth do
  use Croma
  use TypedStruct
  use App.Types
  alias App.Auth.{Twilio}

  typedstruct module: Verification, enforce: true do
    field(:status, String.t())
  end

  typedstruct module: Error, enforce: true do
    field(:message, String.t())
  end

  typedstruct module: UserError, enforce: true do
    field(:message, String.t())
  end

  @typep result() :: Verification | Error | UserError

  defun create_verification(e164 :: e164()) :: result() do
    result = Twilio.create_verification(e164)
    IO.puts(inspect(result))

    case result do
      {:ok, payload} ->
        payload

      {:error, %{"message" => message} = _map, _status_code} ->
        # TODO: log, sentry unexpected errors
        # {:error,
        # %{
        #   "code" => 20008,
        #   "message" => "Resource not accessible with Test Account Credentials",
        #   "more_info" => "https://www.twilio.com/docs/errors/20008",
        #   "status" => 403
        # }, 403}
        %Error{message: message}
    end

    {:ok, %Verification{status: :pending}}
  end
end
