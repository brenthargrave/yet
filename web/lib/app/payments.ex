defmodule App.Payments do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  import Ecto.Query
  import App.Helpers, only: [format_ecto_errors: 1]

  alias App.{
    Repo,
    Mention,
    Payment,
    Customer,
    Opp
  }

  @mentions_preloads [
    conversation: [
      :creator,
      signatures: [:signer]
    ]
  ]
  def mentions(input) do
    opp_id = Map.get(input, :opp_id)

    query =
      from(m in Mention,
        preload: ^@mentions_preloads,
        join: c in assoc(m, :conversation),
        where: m.opp_id == ^opp_id,
        where: c.status != :deleted
      )

    Repo.all(query)
    |> ok()
  end

  ## GetPayment
  @payment_preloads [
    :payer,
    :payee,
    opp: [:creator, :owner]
  ]

  def get(%{id: id} = _input) do
    Repo.get(Payment, id)
    |> Repo.preload(@payment_preloads)
    |> lift(nil, :not_found)
  end

  def get(_input) do
    error(:not_found)
  end

  ## Upsert
  defun upsert(
          customer,
          %{id: id, opp_id: opp_id} = input
        ) :: Brex.Result.s(Payment.t()) do
    input

    opp = Repo.get(Opp, opp_id)
    payee_id = Map.get(input, :payee_id, nil)
    payee = if is_nil(payee_id), do: nil, else: Repo.get(Customer, payee_id)
    amount = Map.get(input, :amount, nil)

    attrs = %{
      id: id,
      payer: customer,
      opp: opp,
      payee: payee,
      amount: amount
    }

    Repo.get(Payment, id)
    |> Repo.preload(@payment_preloads)
    |> lift(nil, :not_found)
    |> convert_error(:not_found, %Payment{})
    # only payer can edit
    |> bind(
      &if !is_nil(&1.payer_id) && &1.payer_id != customer.id,
        do: error(:unauthorized),
        else: ok(&1)
    )
    # TODO: disable edititing when?
    # |> bind(
    #   &if Enum.member?([:draft, :proposed], &1.status),
    #     do: ok(&1),
    #     else: error(:unauthorized)
    # )
    |> fmap(&Payment.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
    |> fmap(&Repo.preload(&1, @payment_preloads))
  end
end
