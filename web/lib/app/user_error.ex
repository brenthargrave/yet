defmodule App.UserError do
  use TypedStruct

  typedstruct do
    field :message, String.t(), enforce: true
    field :code, atom()
  end
end
