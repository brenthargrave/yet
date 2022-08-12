defmodule Absinthe.Type.Custom.Money do
  use Absinthe.Schema.Notation

  enum :currency do
    value(:USD, as: :USD)
  end

  object :money do
    field(:amount, non_null(:integer))
    field(:currency, non_null(:currency))
  end

  input_object :money_input do
    field(:amount, non_null(:integer))
    field(:currency, non_null(:currency))
  end
end
