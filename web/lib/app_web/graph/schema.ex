defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema

  import_sdl(path: Path.absname("./sdl.gql", __DIR__))

  query do
    field :events, list_of(non_null(:event)) do
      resolve(fn _parent, _args, _context ->
        {:ok, []}
      end)
    end
  end
end
