defmodule App.Auth.Twilio do
  use Croma
  use App.Types

  defp service() do
    System.get_env("TWILIO_VERIFY_SERVICE_ID")
  end

  defun create_verification(e164 :: e164()) :: term() do
    if Mix.env() === :prod do
      ExTwilio.Verify.Verifications.create(%{to: e164, channel: "sms"},
        service: service()
      )
    else
      # NOTE: repurpose Twilio's magic numbers to stub responses.
      # https://www.twilio.com/docs/iam/test-credentials#magic-input
      case e164 do
        "+15005550000" ->
          stub_create_error()

        _ ->
          stub_create()
      end
    end
  end

  defun check_verification(e164 :: e164(), code :: number()) :: term() do
    if Mix.env() === :prod do
      res =
        ExTwilio.Verify.VerificationCheck.create(
          %{
            to: e164,
            code: code
          },
          service: service()
        )

      IO.puts(inspect(res))
      res
    else
      case e164 do
        "+15005550000" ->
          stub_check_error()

        _ ->
          stub_check()
      end
    end
  end

  defp stub_create_error() do
    {:error,
     %{
       "code" => 20008,
       "message" => "Resource not accessible with Test Account Credentials",
       "more_info" => "https://www.twilio.com/docs/errors/20008",
       "status" => 403
     }, 403}
  end

  @spec stub_create() :: {:ok, map()}
  defp stub_create() do
    {
      :ok,
      %ExTwilio.Verify.Verifications{
        account_sid: "AC6965c1da82c9b5bb93d99ec45caeb781",
        amount: nil,
        channel: "sms",
        date_created: "2022-05-13T20:24:50Z",
        date_updated: "2022-05-13T20:25:36Z",
        lookup: %{
          carrier: %{
            error_code: nil,
            mobile_country_code: "310",
            mobile_network_code: "800",
            name: "T-Mobile USA, Inc.",
            type: "mobile"
          }
        },
        payee: nil,
        send_code_attempts: [
          %{
            attempt_sid: "VL3ecb5a2f13be6639cc79eac2d6af87d2",
            channel: "sms",
            time: "2022-05-13T20:24:50.000Z"
          },
          %{
            attempt_sid: "VLebcda58186753204136aee6421c68238",
            channel: "sms",
            time: "2022-05-13T20:25:36.654Z"
          }
        ],
        service_sid: "VAfc95ba97399b05f59d304d30b4d5961f",
        sid: "VE0fa64bb52d598df5afe780542b5107d9",
        status: "pending",
        to: "+19099103449",
        url:
          "https://verify.twilio.com/v2/Services/VAfc95ba97399b05f59d304d30b4d5961f/Verifications/VE0fa64bb52d598df5afe780542b5107d9",
        valid: false
      }
    }
  end

  defp stub_check() do
    {:ok,
     %ExTwilio.Verify.VerificationCheck{
       account_sid: "AC6965c1da82c9b5bb93d99ec45caeb781",
       amount: nil,
       channel: "sms",
       date_created: "2022-05-14T21:34:40Z",
       date_updated: "2022-05-14T21:38:46Z",
       payee: nil,
       service_sid: "VAfc95ba97399b05f59d304d30b4d5961f",
       sid: "VE1f70f03d34768da0c6f8a5dd5f930422",
       status: "approved",
       to: "+19099103449",
       valid: true
     }}
  end

  defp stub_check_error() do
    {:error,
     %{
       "code" => 60203,
       "message" => "Max send attempts reached",
       "more_info" => "https://www.twilio.com/docs/errors/60203",
       "status" => 429
     }, 429}
  end
end
