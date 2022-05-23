defmodule AppWeb.Resolvers.Onboarding do
  use Croma
  use App.Types
  import ShorterMaps
  alias App.{Onboarding}

  defun update_profile(
          _parent,
          %{input: ~M{ id, name, org, role }} = _args,
          _resolution
        ) :: resolver_result() do
    Onboarding.update_profile(id, name, org, role)
  end

  # defun me(
  #         _parent,
  #         _args,
  #         %{context: %{customer: customer}} = _resolution
  #       ) :: resolver_result() do
  #   {:ok, customer}
  # end
end
