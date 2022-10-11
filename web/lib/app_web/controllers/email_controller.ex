defmodule AppWeb.EmailController do
  use AppWeb, :controller
  import Ecto.Query

  alias App.{Repo, Customer}

  def digest(conn, params) do
    # NOTE: email for dev
    email = Map.get(params, "email")
    # NOTE: auth'd customer used by UX tests
    context = Map.get(conn.assigns, :context)

    customer = Map.get(context, :customer)

    query =
      from(c in Customer,
        order_by: [asc: c.inserted_at],
        limit: 1
      )

    query =
      if is_nil(customer),
        do: query,
        else: from(c in query, where: c.id == ^customer.id)

    query =
      if is_nil(email),
        do: query,
        else: from(e in query, where: e.email == ^email)

    # NOTE: if auth'd, defer to defaults: 24 hrs ago
    forever =
      DateTime.utc_now()
      |> Timex.shift(years: -10)

    since = if(customer, do: nil, else: forever)

    omit_own = if(customer, do: true, else: false)

    query
    |> Repo.one()
    |> App.Email.Digest.build_email(%{since: since, omit_own: omit_own})
    |> case do
      {:ok, email} ->
        html(conn, email.html_body)

      {:error, message} ->
        text(conn, message)
    end
  end
end
