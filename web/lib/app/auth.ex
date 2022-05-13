defmodule App.Auth do
  use Croma
  # import Ecto.Query, warn: false
  # alias App.Repo
  # alias App.Analytics.kvent

  @typep e164() :: String.t

  defun create_verification(e164 :: e164()) :: String.t do
  end

  def create_verification(attrs \\ %{}) do
    # # TODO: track_event (call segment)
    # %Event{}
    # |> Event.changeset(attrs)
    # |> Repo.insert()
  end
end
