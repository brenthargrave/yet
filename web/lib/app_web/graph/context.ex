defmodule AppWeb.Graph.Context do
  @behaviour Plug

  import Plug.Conn
  import Ecto.Query, only: [where: 2]

  alias App.{Repo, Customer}

  def init(opts), do: opts

  def call(conn, _) do
    IO.puts("\nBEGIN\n")
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  @doc """
  Return the current user context based on the authorization header
  """
  def build_context(conn) do
    IO.puts("build_context #{inspect(conn)}")

    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, customer} <- authorize(token) do
      IO.puts(inspect(customer))
      IO.puts("\nCUSTOMER\n")
      %{customer: customer}
    else
      _ -> %{}
    end
  end

  defp authorize(token) do
    Customer
    |> where(token: ^token)
    |> Repo.one()
    |> case do
      nil -> {:error, "Invalid auth token"}
      customer -> {:ok, customer}
    end
  end
end
