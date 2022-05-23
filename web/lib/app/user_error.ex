defmodule App.UserError do
  use TypedStruct

  typedstruct enforce: true do
    field :message, String.t()
  end
end
