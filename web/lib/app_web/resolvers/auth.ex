defmodule AppWeb.Resolvers.Auth do
  use Croma
  use App.Types
  alias App.{Auth}

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
end
