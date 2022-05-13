defmodule App.Auth do
  use Croma
  use TypedStruct

  @moduledoc """
   - Authentication service?
   - when in dev
     - any number returns 200, payload PENDING
     - 0000000 returns exception (use Twilo's unreachable number code)
   in the future, lift into a dev-only feature flag for verifying UX patterns
   exception
   error | user
  """

  @typep e164() :: String.t()

  typedstruct module: Verification, enforce: true do
    field :status, String.t()
  end

  typedstruct module: Error, enforce: true do
    field :message, String.t()
  end

  typedstruct module: UserError, enforce: true do
    field :message, String.t()
  end

  @typep result() :: Verification | Error | UserError

  defun create_verification(e164 :: e164()) :: term() do
    response =
      ExTwilio.Verify.Verifications.create(%{to: e164, channel: "sms"},
        service: System.get_env("TWILIO_VERIFY_SERVICE_ID")
      )

    IO.puts(inspect(response))

    case response do
      {:ok, payload} ->
        # Map.take(payload, [:status])
        payload

      {:error, %{message: message} = _error, _twilio_error_code} ->
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

  # @spec create_verifications(e164 :: e164()) :: result()
  # def create_verification(e164) do
  #   ExTwilio.Verify.Verifications.create(%{to: e164, channel: "sms"},
  #     service: System.get_env("TWILIO_VERIFY_SERVICE_ID")
  #   )
  # end
end
