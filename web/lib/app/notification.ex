defmodule App.Notification do
  use Croma
  use App.Types

  def send_sms(%{to: to, body: body}) do
    System.get_env("DEBUG_DISABLE_SMS") ||
      ExTwilio.Message.create(
        messaging_service_sid: System.get_env("TWILIO_MESSAGING_SID"),
        to: to,
        body: body
      )
  end
end
