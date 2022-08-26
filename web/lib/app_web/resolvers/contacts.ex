defmodule AppWeb.Resolvers.Contacts do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  require Logger
  alias App.Contacts

  defun get_contacts(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(term()) do
    ok(Contacts.get_contacts(customer))
  end

  def get_contacts(_parent, _args, _resolution) do
    ok([])
  end
end
