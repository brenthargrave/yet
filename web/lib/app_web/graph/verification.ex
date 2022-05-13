defmodule AppWeb.Graph.Verification do
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
  end

  input_object :create_verification_input do
    field(:e164, non_null(:string))
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

  object :mutations_verification do
    field :create_verification, type: :verification_result do
      arg(:input, non_null(:create_verification_input))
      resolve(&Resolvers.Verification.create/3)
    end
  end
end
