defmodule AppWeb.PageController do
  use AppWeb, :controller

  def index(conn, _params) do
    send_file(conn, 200, "priv/static/index.html")
    # TODO: https://vitejs.dev/guide/backend-integration.html
    # js_path =
    #   if Mix.env() != :prod,
    #     do: "https://localhost:#{System.get_env("PORT_UI")}/src/index.js",
    #     else: Routes.static_path(conn, "/src/index.js")
    # props = %{location: conn.request_path}
    # conn
    # |> put_layout(false)
    # |> html("""
    # <!DOCTYPE html>
    # <html lang="en">
    #   <head>
    #     <meta charset="utf-8" />
    #     <link rel="icon" href="/favicon.ico" />
    #     <meta name="viewport" content="width=device-width, initial-scale=1" />
    #   </head>
    #   <body>
    #     <div id="main" data-props='#{Jason.encode!(props)}' />
    #     <script type="module" src="#{js_path}"></script>
    #   </body>
    # </html>
    # """)
  end
end
