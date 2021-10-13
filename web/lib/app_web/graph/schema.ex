defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema

  enum :event_name do
    value(:tap_signup)
  end

  input_object :install do
    field(:id, non_null(:string))
  end

  input_object :event_properties do
    field(:install, non_null(:install))
  end

  input_object :track_event_input do
    field(:name, non_null(:event_name))
    field(:properties, non_null(:event_properties))
  end

  object :track_event_result do
    field :event, type: :event
  end

  object :track_event_mutation do
    @desc "Track event"
    field :track_event, :track_event_result do
      arg(:input, non_null(:track_event_input))

      resolve(fn _parent, args, _context ->
        inspect(args)
        {:error, "TODO"}
        # TODO: insert event, return event
      end)
    end
  end

  @doc """
  """

  object :event do
    field(:name, non_null(:event_name))
  end

  query do
    field :events, non_null(list_of(non_null(:event))) do
      resolve(fn _parent, _args, _context ->
        {:ok, []}
      end)
    end
  end

  #  Twilio Verification
  enum :verification_status do
    value(:pending)
    value(:approved)
    value(:canceled)
  end

  # TODO: wrap w/ Result type
  object :verification do
    field(:status, non_null(:verification_status))
  end

  input_object :create_verification_input do
    # TODO: custom scalar for e164
    field(:e164, non_null(:string))
  end

  import AbsintheErrorPayload.Payload
  import_types(AbsintheErrorPayload.ValidationMessageTypes)
  payload_object(:verification_payload, :verification)
  # TODO: Verification (¿ success == true)
  # TODO: interface Error message (¿ success == false)
  # TODO: VerificationError implements Error
  # TODO: verification result == union verification | verification error
  interface :error do
    field(:message, non_null(:string))
  end

  object :verification_error do
    is_type_of(:error)
    field(:message, non_null(:string))
  end

  union :verification_result do
    types([:verification, :verification_error])

    resolve_type(fn
      # TODO
      # %Verification{}, _ -> :verification
      # %Error{}, _ -> :verification_error
      %{status: _}, _ -> :verification
      %{message: _}, _ -> :verification_error
    end)
  end

  mutation do
    field :create_verification, type: :verification_result do
      arg(:input, non_null(:create_verification_input))
      resolve(&create_verification/3)
      # middleware(&build_payload/2)
    end

    import_fields(:track_event_mutation)
  end

  defp create_verification(_parent, %{input: %{e164: e164}} = _args, _resolution) do
    IO.puts("e164: #{e164}")
    {:ok, %{status: :pending}}
    # {:ok, %{message: "Oops!"}}
  end
end
