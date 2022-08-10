defmodule AppWeb.Resolvers.Opps do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  alias App.Opps
  alias App.Opp
  # alias App.UserError
  require Logger

  typedstruct module: OppsPayload do
    field(:opps, list(Opp.t()))
  end

  defun get_opps(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ConversationsPayload.t()) do
    Opps.opps(customer)
    |> fmap(&%OppsPayload{opps: &1})
  end

  def get_opps(_parent, _args, _resolution) do
    ok([])
  end
end
