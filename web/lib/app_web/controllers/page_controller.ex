defmodule AppWeb.PageController do
  use AppWeb, :controller
  alias App.{Repo, Conversation}

  # %{"path" => ["c", "01G9DG5VJS7N568PCSM0R157MY"]}
  def index(conn, %{"path" => ["c", id]} = params) do
    IO.inspect(conn)
    IO.inspect(params)
    root_url = "https://#{AppWeb.Endpoint.host()}"

    conversation =
      Repo.get(Conversation, id)
      |> Repo.preload([:creator, signatures: [:signer]])

    others =
      if conversation.status == "signed",
        do: Enum.map(conversation.signatures, & &1.signer),
        else: conversation.invitees

    others_names = Enum.map(others, & &1.name)
    others_copy = RList.to_sentence(others_names)

    on = Timex.format!(conversation.occurred_at, "%B %d", :strftime)

    title = ~s(#{conversation.creator.name} with #{others_copy} on #{on})

    og = %{
      type: "website",
      url: ~s(#{root_url}/c/#{id}),
      title: title,
      image: ~s(#{root_url}#{AppWeb.Endpoint.static_path("/og/chat-quote.svg")})
    }

    render(conn, "index.html", %{og: og})
  end

  # https://vitejs.dev/guide/backend-integration.html
  def index(conn, _params) do
    render(conn, "index.html")
  end
end
