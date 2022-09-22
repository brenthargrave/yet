defmodule AppWeb.Resolvers.Payments do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  require Logger

  alias App.{
    Payments,
    Mention,
    Payment,
    UserError
  }

  typedstruct module: MentionsPayload do
    field(:mentions, list(Mention.t()))
    # field(:user_error, UserError.t())
  end

  defun mentions(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: _customer}} = _resolution
        ) :: resolver_result(MentionsPayload.t()) do
    Payments.mentions(input)
    |> fmap(&%MentionsPayload{mentions: &1})
  end

  def mentions(_parent, _args, _resolution) do
    error(:unauthorized)
  end

  ## GetPayment

  typedstruct module: GetPaymentPayload do
    field(:payment, Payment.t())
  end

  def get(
        _parent,
        %{input: input} = _args,
        %{context: %{customer: _customer}} = _resolution
      ) do
    Payments.get(input)
    |> fmap(&%GetPaymentPayload{payment: &1})
  end

  def get(_parent, _args, _resolution) do
    error(:unauthorized)
  end

  ## UpsertPayment
  typedstruct module: UpsertPaymentPayload do
    field(:payment, Payment.t())
    field(:user_error, UserError.t())
  end

  defun upsert(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(UpsertPaymentPayload.t()) do
    Payments.upsert(customer, input)
    |> fmap(&%GetPaymentPayload{payment: &1})
  end

  def upsert(_parent, _args, _resolution) do
    error(:unauthorized)
  end
end
