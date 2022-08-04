defmodule App.Notifications do
  use Croma
  use App.Types
  use Brex.Result

  @type payload() :: %{to: String.t(), body: String.t()}
  defun send(%{to: to, body: body} :: payload()) :: nil do
    System.get_env("DEBUG_DISABLE_SMS") ||
      ExTwilio.Message.create(
        messaging_service_sid: System.get_env("TWILIO_MESSAGING_SID"),
        to: to,
        body: body
      )
  end
end
