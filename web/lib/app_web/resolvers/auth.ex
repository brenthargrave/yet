defmodule AppWeb.Resolvers.Auth do
  use Croma
  use App.Types
  use Brex.Result
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

  defun me(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result() do
    customer
    |> IO.inspect(label: "ME")
    |> ok()
  end

  def token(
        _parent,
        _args,
        %{context: %{customer: customer}} = _resolution
      ) do
    {:ok, %{token: %{value: customer.token}}}
  end

  def token(
        _parent,
        _args,
        _resolution
      ) do
    {:ok, %{token: nil}}
  end
end
