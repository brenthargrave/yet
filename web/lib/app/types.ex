defmodule App.Types do
  defmacro __using__(_opts) do
    quote do
      @type e164() :: String.t()
    end
  end
end
