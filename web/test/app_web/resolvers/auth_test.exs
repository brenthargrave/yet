defmodule AppWeb.Resolvers.AuthTest do
  use ExUnit.Case, async: true

  alias App.Customer
  alias AppWeb.Resolvers.Auth

  test "me returns nil without an authenticated customer" do
    assert {:ok, nil} = Auth.me(nil, %{}, %{context: %{}})
  end

  test "me returns the authenticated customer" do
    customer = %Customer{
      id: Ecto.ULID.generate(),
      e164: "+15005550125",
      token: Ecto.ULID.generate()
    }

    assert {:ok, ^customer} = Auth.me(nil, %{}, %{context: %{customer: customer}})
  end
end
