defmodule App.Auth.Customer do
  use App.Schema
  alias App.Auth.{Token}
  use Croma
  import Ecto.Query
  import App.Types

  typed_schema "customers" do
    field(:e164, :string)
    has_many :tokens, Token
    timestamps()
  end

  # defun with_e164(e164 :: e164t()) :: Ecto.Query.t() do
  #   from(c in __MODULE__, where: c.e164 == ^e164)
  #   |> first
  # end

  # def changeset(customer, attrs) do
  #   customer
  #   |> cast(attrs, [:phone, :name])
  #   |> validate_required([:phone, :name])
  #   # crib Twitter's display name max length - http://bit.ly/2ISYttt
  #   |> validate_length(:name, min: 1, max: 50)
  #   # TODO: phone number validation
  #   # |> validate_phone_number(:phone)
  #   |> unique_constraint(:phone)
  # end
end
