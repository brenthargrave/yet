defmodule AppWeb.PageController do
  use AppWeb, :controller

  def index(conn, _params) do
    # https://vitejs.dev/guide/backend-integration.html
    render(conn, "index.html")
  end

end
