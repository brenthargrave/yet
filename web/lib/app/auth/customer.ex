defmodule App.Auth.Customer do
  use App.Schema
  alias App.Auth.{Token}

  typed_schema "customers" do
    field(:phone, :string)
    has_many :tokens, Token
    timestamps()
  end
end
