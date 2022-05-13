defmodule AppWeb.Resolvers.Verification do
  def create(_parent, _args, _resolution) do
    # VerificationService.create(e164)
    {:ok, %{status: :pending}}
  end

  """
   - Authentication service?
   - when in dev
     - any number returns 200, payload PENDING
     - 0000000 returns exception (use Twilo's unreachable number code)
   in the future, lift into a dev-only feature flag for verifying UX patterns
   exception
   error | user

   should verification even be exposed to client?
   VerifyService.create(phone)
   VerifyService.check(phone, code) # UserError (wrong code, unreachable phone)
   Customer.find_or_create_by_phone(phone): token
  """

  """
     {:error,
  %{
    "code" => 20008,
    "message" => "Resource not accessible with Test Account Credentials",
    "more_info" => "https://www.twilio.com/docs/errors/20008",
    "status" => 403
  }, 403}
  """

  def noop(_parent, %{input: %{e164: e164}} = _args, _resolution) do
    # ExTwilio.Verify.Verifications.create(%{to: e164, channel: "sms"},
    #   service: System.get_env("TWILIO_VERIFY_SERVICE_ID")
    # )
    {:ok, %{status: :pending}}
  end
end
