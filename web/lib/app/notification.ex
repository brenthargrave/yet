defmodule App.Notification do
  use Croma
  use App.Types

  def send_sms(%{to: to, body: body}) do
    ExTwilio.Message.create(
      messaging_service_sid: System.get_env("TWILIO_MESSAGING_SID"),
      to: to,
      body: body
    )
    |> IO.inspect()
  end
end
