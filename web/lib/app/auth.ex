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

  @type result() ::
          {:ok,
           %Verification{status: String.t()}
           | %Error{message: String.t()}
           | %UserError{message: String.t()}}

  defun create_verification(e164 :: e164()) :: result() do
    result = Twilio.create_verification(e164)
    IO.puts(inspect(result))

    case result do
      {:ok, %{status: status} = _payload} ->
        {:ok, %Verification{status: String.to_existing_atom(status)}}

      # TODO: where UserError?
      {:error, %{"message" => message} = _data, _http_status_code} ->
        # TODO: log, sentry unexpected errors
        {:ok, %Error{message: message}}
    end
  end
end
