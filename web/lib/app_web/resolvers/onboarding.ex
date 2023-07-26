defmodule AppWeb.Resolvers.Onboarding do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  alias App.Onboarding

  defun patch_profile(
          _parent,
          %{input: %{id: id, prop: prop, value: value}} = _args,
          _resolution
        ) :: resolver_result() do
    Onboarding.patch_profile(id, prop, value)
  end
end
