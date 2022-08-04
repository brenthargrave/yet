defmodule AppWeb.PageController do
  use AppWeb, :controller
  alias App.{Repo, Conversation}

  # %{"path" => ["c", "01G9DG5VJS7N568PCSM0R157MY"]}
  def index(conn, %{"path" => ["c", id | _]} = _params) do
    conversation =
      Repo.get(Conversation, id)
      |> Repo.preload([:creator, signatures: [:signer]])

    assigns =
      case conversation do
        %Conversation{
          status: status,
          signatures: signatures,
          invitees: invitees,
          creator: creator,
          occurred_at: occurred_at,
          note: note
        } = _conversation ->
          root_url = "https://#{AppWeb.Endpoint.host()}"

          others =
            if status == "signed",
              do: Enum.map(signatures, & &1.signer),
              else: invitees

          others_names =
            others
            |> Enum.map(& &1.name)
            |> RList.to_sentence()

          title = ~s<#{creator.name} with #{others_names}>

          on = Calendar.strftime(occurred_at, "%B %-d, %Y")

          # html = Md.generate(note)
          text = HtmlSanitizeEx.markdown_html(note)
          truncated = Util.StringFormatter.truncate(text, max_length: 100)

          description = ~s<#{on} - #{truncated}>

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
