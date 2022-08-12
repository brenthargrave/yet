defmodule AppWeb.Resolvers.Opps do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  alias App.Opps
  alias App.Opp
  alias App.UserError
  require Logger

  typedstruct module: OppsPayload do
    field(:opps, list(Opp.t()))
  end

  defun get_opps(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(OppsPayload.t()) do
    Opps.opps(customer)
    |> fmap(&%OppsPayload{opps: &1})
  end
  def get_opps(_parent, _args, _resolution) do
    ok([])
  end

  typedstruct module: OppPayload do
    field(:opp, Opp.t())
    field(:user_error, UserError.t())
  end

  defun upsert_opp(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(OppPayload.t()) do
    Opps.upsert_opp(customer, input)
    |> fmap(&%OppPayload{opp: &1})
  end

  defun get_opp(
          _parent,
          %{id: id} = _args,
          _resolution
        ) :: resolver_result(OppPayload.t()) do
    Opps.get_opp(id)
    |> fmap(&%OppPayload{opp: &1})
    |> convert_error(:not_found, %OppPayload{user_error: UserError.not_found()})
  end
end
