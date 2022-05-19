# https://hexdocs.pm/ecto/Ecto.Schema.html#module-schema-attributes
# https://github.com/TheRealReal/ecto-ulid#schema
defmodule App.Model do
  defmacro __using__(_) do
    quote do
      use Ecto.Schema
      @primary_key {:id, Ecto.ULID, autogenerate: true}
      @foreign_key_type Ecto.ULID
    end
  end
end
