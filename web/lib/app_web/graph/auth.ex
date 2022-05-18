defmodule AppWeb.Graph.Auth do
  use Absinthe.Schema.Notation
  alias AppWeb.Resolvers
  alias App.Auth.{Verification, Error, UserError}

  interface :base_error do
    field(:message, non_null(:string))
  end

  object :user_error do
    is_type_of(:base_error)
    field(:message, non_null(:string))
  end

  object :error do
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
    # TODO: Token?
  end

  input_object :create_verification_input do
    field(:e164, non_null(:string))
  end

  input_object :check_verification_input do
    field(:e164, non_null(:string))
    field(:code, non_null(:string))
  end

  object :token do
    field(:value, non_null(:string))
  end

  object :check_verification_payload do
    field(:verification, non_null(:verification))
    field(:token, non_null(:token))
  end

  union :verification_result do
    types([:verification, :user_error, :error])

    resolve_type(fn
      %Verification{}, _ ->
        :verification

      %UserError{}, _ ->
        :user_error

      %Error{}, _ ->
        :error
    end)
  end

  object :auth_mutations do
    field :create_verification, type: :verification_result do
      arg(:input, non_null(:create_verification_input))
      resolve(&Resolvers.Auth.create/3)
    end

    field :check_verification, type: :verification_result do
      arg(:input, non_null(:check_verification_input))
      resolve(&Resolvers.Auth.check/3)
    end
  end
end
