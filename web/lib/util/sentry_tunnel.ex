defmodule Sentry.PlugTunnel do
  # TODO: publish oss
  use Plug.Builder
  import Plug.Conn
  import Plug.Conn.Status

  def init(opts), do: opts

  def call(conn, opts) do
    if conn.request_path == Keyword.get(opts, :at) do
      # NOTE: see https://github.com/getsentry/examples/blob/master/tunneling/nextjs/pages/api/tunnel.js
      {:ok, envelope, _conn} = Plug.Conn.read_body(conn)

      uri =
        envelope
        |> String.split()
        |> List.first()
        |> Jason.decode!()
        |> Map.get("dsn")
        |> URI.parse()

      project_id = List.last(String.split(uri.path))

      url = "https://#{uri.host}/api/#{project_id}/envelope/"

      {:ok, response} = HTTPoison.post(url, envelope)
      # TODO: error-handling
      # {:error, %HTTPoison.Error{reason: :timeout, id: nil}}

      conn
      |> resp(code(:ok), response.body)
      |> send_resp()
      |> halt()
    else
      conn
    end
  end
end
