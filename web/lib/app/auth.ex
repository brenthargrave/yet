defmodule App.Auth do
  use Croma
  use TypedStruct
  use Brex.Result
  import Ecto.Query
  use App.Types
  alias App.Auth.{Twilio, Twitter}
  alias App.{Repo, Customer, UserError, Authorization}
  import App.Helpers, only: [format_ecto_errors: 1]
  alias Ecto.Multi

  typedstruct module: Verification, enforce: true do
    field(:status, String.t())
  end

  @type submit_phone_result() ::
          {:ok, Verification.t() | UserError.t()}
          | {:error, String.t()}

  defun submit_phone(e164 :: e164()) :: submit_phone_result() do
    response = Twilio.create_verification(e164)

    case response do
      {:ok, %{status: status} = _payload} ->
        {:ok, %Verification{status: String.to_existing_atom(status)}}

      # NOTE: by default return all unexpected errors as absinthe/graphql errors
      {:error, %{"message" => message} = _data, _http_status_code} ->
        {:error, message}
    end
  end

  typedstruct module: SubmitCodePayload do
    field(:verification, Verification.t(), enforce: true)
    field(:me, Customer.t(), enforce: true)
  end

  @type submit_code_result() ::
          {:ok, SubmitCodePayload.t() | UserError.t()}
          | {:error, String.t()}

  defun submit_code(e164 :: e164(), code :: number()) :: submit_code_result() do
    res = Twilio.check_verification(e164, code)

    case res do
      # NOTE: Twilio responds "pending" when incorrect code submitted
      {:ok, %{status: "pending"} = _payload} ->
        {:ok, UserError.bad_request("Incorrect code.")}

      # NOTE: otherwise, pass "approved" or "cancelled" along as-is
      {:ok, %{status: status} = _payload} ->
        case find_or_create_with_e164(e164) do
          {:ok, customer} ->
            App.Analytics.identify(customer)

            {:ok,
             %SubmitCodePayload{
               verification: %Verification{
                 status: String.to_existing_atom(status)
               },
               me: customer
             }}

          {:error, _any} = error ->
            error
        end

      {:error, %{"message" => message} = _data, _http_status_code} ->
        {:error, message}
    end
  end

  defunp find_or_create_with_e164(e164 :: e164()) :: Brex.Result.s(Customer.t()) do
    existing =
      from(c in Customer, where: c.e164 == ^e164)
      |> Repo.one()

    if existing do
      {:ok, existing}
    else
      %Customer{}
      # TODO: token security
      |> Customer.auth_changeset(%{e164: e164, token: Ecto.ULID.generate()})
      |> Repo.insert()
    end
  end

  def with_token(token) when is_nil(token), do: nil

  def with_token(token) do
    Customer
    |> where(token: ^token)
    |> Repo.one()
  end

  def customer_for_token(token) do
    Repo.one(from(c in Customer, where: c.token == ^token, limit: 1))
  end

  def insert_authorization(customer, %Ueberauth.Auth{} = auth) do
    json =
      auth
      |> as_json()

    provider = Map.get(json, :provider)
    expires_at_unix = Map.get(json, :expires_at)

    expires_at =
      if is_integer(expires_at_unix), do: DateTime.from_unix(expires_at_unix), else: nil

    authorization_attrs =
      Map.get(auth, :credentials)
      |> Map.take([:token, :secret])
      |> Map.put(:data, json)
      |> Map.put(:customer_id, customer.id)
      |> Map.put(:occurred_at, Timex.now())
      # restore provider for pattern-matching
      |> Map.put(:provider, provider)
      |> Map.put(:expires_at, expires_at)

    authorization_changeset =
      %Authorization{}
      |> Authorization.changeset(authorization_attrs)

    customer_attrs = customer_attrs_from_auth(customer, auth)

    customer_changeset =
      customer
      |> Customer.authorization_changeset(customer_attrs)

    Multi.new()
    |> Multi.insert(:auth, authorization_changeset)
    |> Multi.update(:customer, customer_changeset)
    |> Repo.transaction()
    |> fmap(&App.Analytics.identify(&1.customer))
  end

  defp as_json(%Ueberauth.Auth{} = auth) do
    from_struct = fn v -> {v, Map.from_struct(v)} end
    auth = Map.from_struct(auth)
    {_, auth} = Map.get_and_update(auth, :strategy, fn _ -> :pop end)
    {_, auth} = Map.get_and_update(auth, :info, from_struct)
    {_, auth} = Map.get_and_update(auth, :credentials, from_struct)
    {_, auth} = Map.get_and_update(auth, :extra, from_struct)

    cond do
      auth.provider == :facebook ->
        token_path = [:extra, :raw_info, :token]
        token = get_in(auth, token_path) |> Map.from_struct()
        put_in(auth, token_path, token)

      true ->
        auth
    end
  end

  defp customer_attrs_from_auth(record, %Ueberauth.Auth{provider: :twitter} = auth) do
    data = as_json(auth)
    info = Map.get(data, :info)

    {first, last} = first_last_from_full(info.name)

    # NOTE: Twitter returns a short url, try to expand it.
    website_shortlink = get_in(info, [:urls, :Website])

    {:ok, website} =
      Auth.Twitter.get_url(website_shortlink)
      |> map_error(fn _ -> website_shortlink end)

    shared_attrs(info, record, first, last, website)
    |> Map.put(:twitter_handle, info.nickname)
    |> Map.put(:twitter_image, info.image)
  end

  defp customer_attrs_from_auth(record, %Ueberauth.Auth{provider: :facebook} = auth) do
    data = as_json(auth)
    info = Map.get(data, :info)

    {first, last} = first_last_from_full(info.name)

    website = get_in(info, [:urls, :website])
    facebook_url = get_in(info, [:urls, :facebook])
    facebook_id = get_in(data, [:extra, :raw_info, :user, "id"])

    shared_attrs(info, record, first, last, website)
    # name & image to build profile link
    |> Map.put(:facebook_handle, info.nickname)
    |> Map.put(:facebook_name, info.name)
    |> Map.put(:facebook_url, facebook_url)
    |> Map.put(:facebook_image, info.image)
    |> Map.put(:facebook_id, facebook_id)
  end

  defp first_last_from_full(name) do
    [first | rest] = String.split(name)
    last = Enum.join(rest, " ")
    {first, last}
  end

  defp shared_attrs(info, record, first, last, website) do
    attrs =
      Map.take(info, [
        :name,
        :first_name,
        :last_name,
        :email,
        :nickname,
        :location,
        :description
      ])

    # NOTE: don't clobber pre-existing attrs (ie, don't overwrite email)
    Map.take(info, [:email])
    |> Map.put(:email, record.email || attrs.email)
    |> Map.put(:name, record.name || attrs.name)
    |> Map.put(:first_name, record.first_name || attrs.first_name || first)
    |> Map.put(:last_name, record.last_name || attrs.last_name || last)
    |> Map.put(:website, record.website || website)
    |> Map.put(:location, record.location || attrs.location)
    |> Map.put(:description, record.description || attrs.description)
  end
end
