defmodule AppWeb.AuthController do
  use AppWeb, :controller
  plug(Ueberauth)
  use Brex.Result

  alias App.{Auth}

  def session_start(conn, _params) do
    token =
      conn.body_params
      |> Map.get("token")

    conn
    |> accepts(["json"])
    |> put_session(:token, token)
    |> json(%{token: get_session(conn, :token)})
  end

  def session_end(conn, _params) do
    conn
    |> clear_session()
    |> json(%{status: :ok})
  end

  def callback(%{assigns: %{ueberauth_failure: _fails}} = conn, _params) do
    # TODO: fails -> sentry
    conn
    |> redirect(to: oauth_path(%{status: "error"}))
  end

  def callback(%{assigns: %{ueberauth_auth: auth}} = conn, _params) do
    success = %{status: :success, description: "Welcome aboard!"}
    failure = %{status: :error, description: "Authorization failed"}

    token = get_session(conn, :token)
    customer = Auth.customer_for_token(token)

    {:ok, notice_props} =
      Auth.insert_authorization(customer, auth)
      |> fmap(fn _x -> success end)
      # TODO: errors -> sentry
      |> convert_error(failure)

    conn
    |> redirect(to: oauth_path(notice_props))
  end

  defp oauth_path(query) do
    "/oauth?#{URI.encode_query(query, :rfc3986)}"
  end
end
