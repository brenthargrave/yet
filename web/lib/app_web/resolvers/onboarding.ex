defmodule AppWeb.Resolvers.Onboarding do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  import ShorterMaps
  alias App.{Onboarding}
  alias App.{UserError, Profile}

  typedstruct module: UpdateProfilePayload do
    field :profile, Profile.t()
    field :user_error, UserError.t()
  end

  defun patch_profile(
          _parent,
          %{input: ~M{ id, prop, value }} = _args,
          _resolution
        ) :: resolver_result() do
    Onboarding.patch_profile(id, prop, value)
    # TODO: validation error -> {:ok, UserError}
    |> fmap(&%UpdateProfilePayload{profile: &1})
  end
end
