defmodule App.Helpers do
  use Brex.Result

  def format_ecto_errors(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {message, _opts} -> message end)
    |> Enum.map(fn {k, v} -> "#{k} #{v}" end)
    |> error()
  end
end
