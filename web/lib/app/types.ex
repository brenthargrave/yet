defmodule App.Types do
  defmacro __using__(_opts) do
    quote do
      # Absinthe
      @type absinthe_error() :: String.t()
      @type(resolver_result() :: {:ok, any()}, {:error, absinthe_error()})

      # lib
      @type e164() :: String.t()
    end
  end
end
