defmodule AppWeb.Resolvers.Verification do
  use Croma
  use App.Types
  alias App.{Auth}
  # alias App.Auth.{Verification}

  defun create(
          _parent,
          %{input: %{e164: e164}} = _args,
          _resolution
        ) :: resolver_result() do
    Auth.create_verification(e164)
  end
end
