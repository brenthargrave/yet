defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema

  @desc "An event"
  object :event do
    field(:name, :string)
  end

  query do
    field :events, list_of(non_null(:event)) do
      resolve(fn _parent, _args, _context ->
        {:ok, []}
      end)
    end
  end

end
