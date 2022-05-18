defmodule AppWeb.Graph.Auth do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers
  alias App.Auth.{Verification, UserError, SubmitCodeResult}

  interface :base_error do
    field(:message, non_null(:string))
  end

  object :user_error do
    is_type_of(:base_error)
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

  input_object :submit_phone_input do
    field(:e164, non_null(:string))
  end

  input_object :submit_code_input do
    field(:e164, non_null(:string))
    field(:code, non_null(:string))
  end

  union :submit_phone_result do
    types([:verification, :user_error])

    resolve_type(fn
      %Verification{}, _ ->
        :verification

      %UserError{}, _ ->
        :user_error
    end)
  end

  object :token do
    field(:value, non_null(:string))
  end

  object :submit_code_payload do
    field(:verification, non_null(:verification))
    field(:token, non_null(:token))
  end

  union :submit_code_result do
    types([:submit_code_payload, :user_error])

    resolve_type(fn
      %SubmitCodeResult{}, _ ->
        :submit_code_payload

      %UserError{}, _ ->
        :user_error
    end)
  end

  object :auth_mutations do
    field :submit_phone, type: :submit_phone_result do
      arg(:input, non_null(:submit_phone_input))
      resolve(&Resolvers.Auth.submit_phone/3)
    end

    field :submit_code, type: :submit_code_result do
      arg(:input, non_null(:submit_code_input))
      resolve(&Resolvers.Auth.submit_code/3)
    end
  end
end
