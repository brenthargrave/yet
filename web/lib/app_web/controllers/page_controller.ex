defmodule AppWeb.PageController do
  use AppWeb, :controller

  alias App.{
    #
    Repo,
    Conversation,
    Auth,
    Conversations
  }

  defp handle_static_page(conn) do
    conn
    |> put_resp_header("content-type", "text/html; charset=utf-8")
    |> put_resp_header("cache-control", "no-store, private")
    |> put_resp_header("pragma", "no-cache")
    |> put_layout(false)
  end

  def privacy(conn, _params) do
    conn
    |> handle_static_page()
    |> render("privacy.html")
  end

  def terms(conn, _params) do
    conn
    |> handle_static_page()
    |> render("terms.html")
  end

  def deletion(conn, _params) do
    token = get_session(conn, :token)
    name = if token, do: Auth.customer_for_token(token).name, else: "Stranger"

    conn
    |> handle_static_page()
    |> render("deletion.html", %{name: name})
  end

  def index(conn, %{"path" => ["c", "new" | _]} = _params) do
    render(conn, "index.html")
  end

  # %{"path" => ["c", "01G9DG5VJS7N568PCSM0R157MY"]}
  def index(conn, %{"path" => ["c", id | _]} = _params) do
    conversation =
      Conversations.get_conversation(id)
      |> Repo.preload([:creator, participations: [:participant]])

    assigns =
      case conversation do
        %Conversation{
          status: status,
          participations: participations,
          invitees: invitees,
          creator: creator,
          occurred_at: occurred_at
          # note: note
        } = _conversation ->
          root_url = "https://#{AppWeb.Endpoint.host()}"

          others =
            if status == :joined,
              do: Enum.map(participations, & &1.participant),
              else: invitees

          others_names =
            others
            |> Enum.map(& &1.name)
            |> RList.to_sentence()

          title = ~s<#{creator.name} with #{others_names}>

          on = Calendar.strftime(occurred_at, "%B %-d, %Y")

          # truncated =
          #   note
          #   |> Earmark.as_html!(compact_output: true, gfm: true)
          #   |> HtmlSanitizeEx.strip_tags()
          #   |> Util.StringFormatter.truncate(max_length: 100)

          # description = ~s<#{on} - #{truncated}>
          description = ~s|#{on}|

          %{
            og: %{
              type: "website",
              url: ~s(#{root_url}/c/#{id}),
              title: title,
              image: ~s(#{root_url}#{AppWeb.Endpoint.static_path("/og/chat-quote.png")}),
              description: description
            }
          }

        _ ->
          %{}
      end

    render(conn, "index.html", assigns)
  end

  # https://vitejs.dev/guide/backend-integration.html
  def index(conn, _params) do
    render(conn, "index.html")
  end
end
