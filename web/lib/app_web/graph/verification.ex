defmodule AppWeb.Graph.Verification do
  use Absinthe.Schema.Notation

  interface :error do
    field(:message, non_null(:string))
  end

  object :user_error do
    is_type_of(:error)
    field(:message, non_null(:string))
  end

  enum :verification_status do
    value(:pending)
    value(:approved)
    value(:canceled)
  end

  object :verification do
    field(:status, non_null(:verification_status))
  end

  input_object :create_verification_input do
    field(:e164, non_null(:string))
  end

  union :verification_result do
    types([:verification, :user_error, :error])

    resolve_type(fn
      # TODO
      # %Verification{}, _ -> :verification
      # %UserError{}, _ -> :user_error
      # %Error{}, _ -> :verification_error
      %{status: _}, _ ->
        :verification

      %{message: _}, _ ->
        :verification_error
    end)
  end

  object :mutations_verification do
    field :create_verification, type: :verification_result do
      arg(:input, non_null(:create_verification_input))
      resolve(&create_verification/3)
    end
  end

  # @spec create (any) :: Verification | UserError | DevError
  defp create_verification(_parent, %{input: %{e164: e164}} = _args, _resolution) do
    IO.puts("e164: #{e164}")

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

    res =
      ExTwilio.Verify.Verifications.create(%{to: e164, channel: "sms"},
        service: System.get_env("TWILIO_VERIFY_SERVICE_ID")
      )

    """
       {:error,
    %{
      "code" => 20008,
      "message" => "Resource not accessible with Test Account Credentials",
      "more_info" => "https://www.twilio.com/docs/errors/20008",
      "status" => 403
    }, 403}
    """

    IO.puts("res: #{res}")

    {:ok, %{status: :pending}}
    # {:ok, %{message: "Oops!"}}
  end
end
