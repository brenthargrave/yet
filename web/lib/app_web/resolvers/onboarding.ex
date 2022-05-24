defmodule AppWeb.Resolvers.Onboarding do
  use Croma
  use App.Types
  import ShorterMaps
  alias App.{Onboarding}

  defun update_profile(
          _parent,
          %{input: ~M{ id, prop, value }} = _args,
          _resolution
        ) :: resolver_result() do
    Onboarding.update_profile(id, prop, value)
  end
end
