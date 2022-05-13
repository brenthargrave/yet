defmodule AppWeb.Resolvers.Verification do
  alias App.{Auth}

  def create(_parent, %{input: %{e164: e164}} = _args, _resolution) do
    Auth.create_verification(e164)
    {:ok, "PENDING"}
  end
end
