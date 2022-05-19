# https://hexdocs.pm/ecto/Ecto.Schema.html#module-schema-attributes
# https://github.com/TheRealReal/ecto-ulid#schema
defmodule App.Schema do
  defmacro __using__(_) do
    quote do
      use TypedEctoSchema

      @primary_key {:id, Ecto.ULID, autogenerate: false}
      @foreign_key_type Ecto.ULID
      @timestamps_opts [type: :utc_datetime_usec]
    end
  end
end
