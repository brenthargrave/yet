defmodule AppWeb.Resolvers.Profiles do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  require Logger

  alias App.{
    Contacts,
    Profiles,
    Profile,
    UserError,
    TimelineEvent
  }

  typedstruct module: GetProfilePayload do
    field(:profile, Profile.t())
  end

  defun get(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(ProfilePayload.t()) do
    Profiles.get(customer, input)
    |> fmap(&%GetProfilePayload{profile: &1})
  end

  def get(_parent, _args, _resolution) do
    error(:unauthorized)
  end

  typedstruct module: UpdateProfilePayload do
    field(:profile, Profile.t())
    field(:user_error, UserError.t())
  end

  defun update(
          _parent,
          %{input: input} = _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(UpdateProfilePayload.t()) do
    Profiles.update(customer, input)
    |> fmap(&%UpdateProfilePayload{profile: &1})
  end

  defun get_contacts(
          _parent,
          _args,
          %{context: %{customer: customer}} = _resolution
        ) :: resolver_result(term()) do
    Contacts.get_contacts(customer)
    |> ok()
  end

  def get_contacts(_parent, _args, _resolution) do
    ok([])
  end
end
