defmodule App.Auth.Twilio do
  use Croma
  use App.Types

  @moduledoc """
   - Authentication service?
   - when in dev
     - any number returns 200, payload PENDING
     - 0000000 returns exception (use Twilo's unreachable number code)
   in the future, lift into a dev-only feature flag for verifying UX patterns
   exception
   error | user
  """

  @typep status_code() :: number()
  @typep result() :: {:ok, map()} | {:error, map(), status_code()}

  defun create_verification(e164 :: e164()) :: result() do
    if Mix.env() === :prod do
      ExTwilio.Verify.Verifications.create(%{to: e164, channel: "sms"},
        service: System.get_env("TWILIO_VERIFY_SERVICE_ID")
      )
    else
      # NOTE: repurpose Twilio's magic numbers to stub responses.
      # https://www.twilio.com/docs/iam/test-credentials#magic-input
      case e164 do
        "+15005550000" ->
          {:error,
           %{
             "code" => 20008,
             "message" => "Resource not accessible with Test Account Credentials",
             "more_info" => "https://www.twilio.com/docs/errors/20008",
             "status" => 403
           }, 403}

        _ ->
          # TODO: sample success
          {}
      end
    end

    ExTwilio.Verify.Verifications.create(%{to: e164, channel: "sms"},
      service: System.get_env("TWILIO_VERIFY_SERVICE_ID")
    )
  end
end
