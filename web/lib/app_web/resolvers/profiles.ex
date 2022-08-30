defmodule AppWeb.Resolvers.Profiles do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  require Logger

  alias App.{
    Profiles,
    Profile
  }

  typedstruct module: ProfilePayload do
    field(:profile, list(Profile.t()))
  end

  defun get(
          _parent,
          %{input: %{id: id}} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ProfilePayload.t()) do
    Profiles.get(id, customer)
    |> fmap(&%ProfilePayload{profile: &1})
  end

  def get(_parent, _args, _resolution) do
    {:ok, []}
    |> fmap(&%ProfilePayload{profile: &1})
  end
end
