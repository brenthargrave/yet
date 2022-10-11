defmodule AppWeb.Plug.Authenticate do
  import Plug.Conn
  require Logger

  def init(opts) do
    opts
  end

  def call(conn, _opts) do
    # NOTE: re-use absinthe authentication logic
    context = AppWeb.Graph.Context.build_context(conn)

    conn
    |> assign(:context, context)
  end
end
