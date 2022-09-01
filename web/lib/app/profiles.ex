defmodule App.Profiles do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  import Ecto.Query
  import App.Helpers, only: [format_ecto_errors: 1]

  alias App.{
    Repo,
    Customer,
    Profile,
    Timeline
  }

  @type input :: %{id: String.t(), filters: Timeline.filters()}

  defun get(
          viewer :: Customer.t(),
          input :: input()
        ) :: Brex.Result.s(Profile.t()) do
    id = Map.get(input, :id)
    filters = Map.get(input, :filters, %{})

    events =
      Timeline.get_events(viewer, filters)
      |> case do
        {:ok, results} ->
          results

        {:error, _} ->
          []
      end

    Repo.get(Profile, id)
    |> lift(nil, :not_found)
    |> fmap(&Map.put(&1, :events, events))
  end

  defun update(
          customer,
          input
        ) :: Brex.Result.s(Profile.t()) do
    Repo.get(Customer, customer.id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> fmap(&Profile.changeset(&1, input))
    |> bind(&Repo.update/1)
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end
end
