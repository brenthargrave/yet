defmodule AppWeb.Resolvers.Opps do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  require Logger

  alias App.{
    Opp,
    Opps,
    UserError
  }

  alias Opps.OppProfile

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
    field(:user_error, UserError.t())
    field(:opp, Opp.t())
  end

  defun upsert_opp(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(OppPayload.t()) do
    Opps.upsert_opp(customer, input)
    |> fmap(&%OppPayload{opp: &1})
    |> convert_error(:not_found, %OppPayload{user_error: UserError.not_found()})
  end

  typedstruct module: OppProfilePayload do
    field(:user_error, UserError.t())
    field(:opp_profile, OppProfile.t())
  end

  defun get_opp_profile(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(OppProfilePayload.t()) do
    Opps.get_opp_profile(customer, input)
    |> fmap(&%OppProfilePayload{opp_profile: &1})
    |> convert_error(:not_found, %OppProfilePayload{user_error: UserError.not_found()})
  end
end
