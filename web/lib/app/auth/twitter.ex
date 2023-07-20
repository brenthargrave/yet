defmodule Auth.Twitter do
  use Tesla
  use Brex.Result

  plug(Tesla.Middleware.FollowRedirects)

  def get_url(url) do
    get(url)
    |> fmap(& &1.url)
  end
end
