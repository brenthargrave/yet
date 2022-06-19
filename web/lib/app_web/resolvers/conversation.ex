defmodule AppWeb.Resolvers.Conversation do
  def upsert_conversation(_parent, %{input: input}, _resolution) do
    IO.puts(inspect(input))
  end
end
