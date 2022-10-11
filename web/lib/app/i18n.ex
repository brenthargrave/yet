defmodule I18n do
  def values do
    %{
      product_name: System.get_env("PRODUCT_NAME"),
      digest: %{
        header: "Daily Digest"
      }
    }
  end

  def t(keys) when is_list(keys) do
    get_in(values(), keys)
  end

  def t(key) when is_atom(key) do
    Map.get(values(), key)
  end
end
