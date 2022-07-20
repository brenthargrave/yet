defmodule App.UserError do
  use TypedStruct

  typedstruct do
    field :message, String.t(), enforce: true
    field :code, atom()
  end

  def not_found do
    %__MODULE__{message: "Not found", code: :not_found}
  end

  def unauthorized do
    %__MODULE__{message: "Unauthorized", code: :unauthorized}
  end
end
