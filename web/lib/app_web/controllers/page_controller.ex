defmodule AppWeb.PageController do
  use AppWeb, :controller

  def index(conn, _params) do
    js_path =
      if Mix.env() != :prod,
        do: "https://localhost:#{System.get_env("PORT_SNOWPACK")}/src/main.js",
        else: Routes.static_path(conn, "/main.js")

    props = %{location: conn.request_path}

    conn
    |> put_layout(false)
    |> html("""
    <html>
    <head>
    </head>
    <body>
    <div id="main" data-props='#{Jason.encode!(props)}' />
    <script type="module" src="#{js_path}"></script>
    </body>
    </html>
    """)
  end
end
