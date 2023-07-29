defmodule App.UserError do
  use TypedStruct

  typedstruct do
    field(:message, String.t(), enforce: true)
    field(:code, atom(), enforce: true)
  end

  def not_found do
    %__MODULE__{message: "Not found", code: :not_found}
  end

  def unauthorized do
    %__MODULE__{message: "Unauthorized", code: :unauthorized}
  end

  def bad_request(message \\ "Bad Request") do
    %__MODULE__{message: message, code: :bad_request}
  end
end
