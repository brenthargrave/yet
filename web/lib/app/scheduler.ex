defmodule App.Scheduler do
  use Quantum, otp_app: :app

  def daily_update do
    isProd = System.get_env("MIX_ENV") == "prod"
    now = Timex.now("America/Chicago")
    delivery_hour = System.get_env("EMAIL_DIGEST_HOUR") |> String.to_integer() || 5
    isDeliveryHour = now.hour == delivery_hour

    if isProd && isDeliveryHour do
      App.Email.Digest.send_all()
    end
  end
end
