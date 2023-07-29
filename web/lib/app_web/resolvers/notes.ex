defmodule AppWeb.Resolvers.Notes do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  require Logger

  alias App.{
    Notes,
    Note,
    UserError
  }

  @type notes_result() :: Note.t() | UserError.t() | absinthe_error()

  defun upsert(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: notes_result() do
    Notes.upsert(customer, input)
  end

  defun delete(
          _parent,
          %{input: %{id: id}} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(Note.t()) do
    Notes.delete(id, customer)
  end

  defun post(
          _parent,
          %{input: %{id: id}} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(Note.t()) do
    Notes.post(id, customer)
  end
end
