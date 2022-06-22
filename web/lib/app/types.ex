defmodule App.Types do
  defmacro __using__(_opts) do
    quote do
      # Absinthe
      @type absinthe_error() ::
              {:error, String.t()}
              | {:error, list(String.t())}
              | {:error, messsage: String.t()}
              | {:error, %{message: String.t()}}

      @type resolver_result() :: {:ok, any()} | absinthe_error()

      # lib
      @type e164() :: String.t()
      @type ulid() :: Ecto.ULID.t()
    end
  end
end
