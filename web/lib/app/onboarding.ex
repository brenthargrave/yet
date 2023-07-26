defmodule App.Onboarding do
  use App.Types
  use Brex.Result
  use Croma
  use TypedStruct
  import App.Helpers, only: [format_ecto_errors: 1]

  alias App.{
    UserError,
    Repo,
    Profile
  }

  @type prop :: String.t()
  @type value :: String.t()
  @type result() :: Brex.Result.s(Profile.t() | UserError.t())

  defun patch_profile(id :: ulid(), prop :: prop(), value :: value()) :: result() do
    key = String.to_atom(prop)
    attrs = %{:id => id, key => value}

    Repo.get(Profile, id)
    |> lift(nil, UserError.not_found())
    |> fmap(&Profile.onboarding_changeset(&1, attrs))
    |> bind(&Repo.update/1)
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end
end
