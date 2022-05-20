defmodule AppWeb.Resolvers.Auth do
  use Croma
  use App.Types
  alias App.{Auth}
  import ShorterMaps

  defun submit_phone(
          _parent,
          %{input: %{e164: e164}} = _args,
          _resolution
        ) :: resolver_result() do
    Auth.submit_phone(e164)
  end

  defun submit_code(
          _parent,
          %{input: %{e164: e164, code: code}} = _args,
          _resolution
        ) :: resolver_result() do
    Auth.submit_code(e164, code)
  end

  defun me(
          _parent,
          _args,
          %{context: ~M{current_customer}} = _resolution
        ) :: resolver_result() do
    # TODO: CURRENT: retrieve token from header
    # Auth.me(token)
  end
end
