defmodule App.Profiles do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  import App.Helpers, only: [format_ecto_errors: 1]

  alias App.{
    Repo,
    Customer,
    Profile,
    Timeline,
    Contacts
  }

  @type input :: %{id: String.t(), filters: Timeline.filters()}

  defun get(
          viewer :: Customer.t(),
          input :: input()
        ) :: Brex.Result.s(Profile.t()) do
    id = Map.get(input, :id)
    filters = Map.get(input, :timeline_filters, %{})

    events =
      Timeline.get_events(viewer, filters)
      |> case do
        {:ok, results} ->
          results

        {:error, _} ->
          []
      end

    viewer_id = viewer.id
    contacts_ids = Contacts.get_contacts_for_viewers([viewer])

    distance =
      cond do
        viewer_id == id ->
          0

        Enum.member?(contacts_ids, viewer_id) ->
          1

        true ->
          2
      end

    Repo.get(Profile, id)
    |> lift(nil, :not_found)
    # TODO: drop phone below, just display e164
    |> fmap(&Map.put(&1, :phone, &1.e164))
    # |> fmap(fn profile ->
    #   phone =
    #     profile.e164
    #     |> EctoPhoneNumber.cast()
    #     |> fmap(&EctoPhoneNumber.format(&1))
    #     |> case do
    #       {:ok, phone} -> phone
    #       _ -> profile.e164
    #     end

    #   Map.put(profile, :phone, phone)
    # end)
    |> fmap(&Map.put(&1, :events, events))
    |> fmap(&Map.put(&1, :social_distance, distance))
  end

  defun update(
          customer,
          input
        ) :: Brex.Result.s(Profile.t()) do
    Repo.get(Profile, customer.id)
    |> lift(nil, :not_found)
    |> fmap(&Profile.changeset(&1, input))
    |> bind(&Repo.update/1)
    |> fmap(&App.Analytics.identify(&1))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end
end
