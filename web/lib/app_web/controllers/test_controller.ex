defmodule AppWeb.TestController do
  use AppWeb, :controller
  plug(Ueberauth)
  use Brex.Result
  import Ecto.Query

  alias App.{
    Repo,
    Notification
  }

  def notifications(conn, _params) do
    query = from(n in Notification, order_by: [desc: :delivered_at])

    result =
      query
      |> Repo.all()
      |> Repo.preload([:recipient, conversation: [:creator]])
      |> Enum.map(fn n ->
        Map.take(n, [:id, :kind, :body, :delivered_at])
        |> Map.put(:recipient, Map.take(n.recipient, [:id]))
        |> Map.put(
          :conversation,
          Map.take(n.conversation, [:id])
          |> Map.put(:creator, Map.take(n.conversation.creator, [:id]))
        )
      end)

    conn
    |> accepts(["json"])
    |> json(result)
  end
end
