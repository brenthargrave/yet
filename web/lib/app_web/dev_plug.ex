defmodule AppWeb.DevPlug do
  use Plug.Builder

  def init(_opts) do
    var = System.get_env("DEBUG_LATENCY")
    isDev = var == "dev"

    cond do
      isDev -> %{duration: String.to_integer(var)}
      true -> %{}
    end
  end

  def call(conn, opts) do
    case opts do
      %{duration: duration} ->
        :timer.sleep(duration)
        conn

      _ ->
        conn
    end
  end
end
