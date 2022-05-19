defmodule App.Auth.Token do
  use App.Schema
  alias App.Auth.{Customer}

  typed_schema "tokens" do
    field(:value, :string)
    belongs_to :customer, Customer
    timestamps()
  end
end
