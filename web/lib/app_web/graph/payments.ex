defmodule AppWeb.Graph.Payments do
  use Absinthe.Schema.Notation

  alias AppWeb.Resolvers.{
    Payments
  }

  object :mention do
    field(:id, non_null(:id))
    field(:inserted_at, non_null(:datetime))
    field(:conversation, non_null(:conversation))
  end

  input_object :mentions_input do
    field(:opp_id, non_null(:id))
  end

  object :mentions_payload do
    field(:mentions, non_null(list_of(non_null(:mention))))
  end

  # GetPayment
  enum :payment_status do
    value(:draft, as: :draft)
  end

  object :payment do
    field(:status, non_null(:payment_status))
    field(:opp, non_null(:opp))
    field(:payer, :profile)
    field(:payee, :profile)
    field(:amount, :money)
  end

  object :get_payment_payload do
    field(:payment, non_null(:payment))
  end

  input_object :get_payment_input do
    field(:id, non_null(:id))
  end

  object :payments_queries do
    field :get_payment, :get_payment_payload do
      arg(:input, non_null(:get_payment_input))
      resolve(&Payments.get/3)
    end

    field :mentions, :mentions_payload do
      arg(:input, non_null(:mentions_input))
      resolve(&Payments.mentions/3)
    end
  end

  ## UpsertPayment

  input_object :upsert_payment_input do
    field(:id, non_null(:id))
    field(:opp_id, non_null(:id))
    field(:payee_id, :id)
    field(:amount, :money_input)
  end

  object :upsert_payment_payload do
    field(:payment, :payment)
    field(:user_error, :user_error)
  end

  object :payments_mutations do
    field :upsert_payment, :upsert_payment_payload do
      arg(:input, non_null(:upsert_payment_input))
      resolve(&Payments.upsert/3)
    end
  end
end
