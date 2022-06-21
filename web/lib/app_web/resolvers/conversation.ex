defmodule AppWeb.Resolvers.Conversation do
  def upsert(_parent, %{input: input}, _resolution) do
    # TODO: authenticated user
    IO.puts(inspect(input))
    {:ok, %{}}
  end
end
