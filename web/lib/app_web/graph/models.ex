defmodule AppWeb.Graph.Models do
  use Absinthe.Schema.Notation

  interface :base_error do
    field(:message, non_null(:string))
  end

  object :user_error do
    is_type_of(:base_error)
    field(:message, non_null(:string))
  end

  object :customer do
    # auth
    field(:e164, non_null(:string))
    field(:token, non_null(:string))
    # profile
    field(:id, non_null(:string))
    field(:name, :string)
    field(:org, :string)
    field(:role, :string)
  end
end
