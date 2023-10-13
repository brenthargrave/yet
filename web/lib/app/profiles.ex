defmodule App.Profiles do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  import App.Helpers, only: [format_ecto_errors: 1]

  alias App.{
    Repo,
    Profile,
    Timeline,
    Contacts,
    Conversations
  }

  @type input :: %{id: String.t(), filters: Timeline.filters()}

  def get(viewer, input) do
    id = Map.get(input, :id)
    filters = Map.get(input, :timeline_filters, %{})

    {:ok, events} = Timeline.get_events(viewer, filters)

    viewer_id = viewer.id

    viewer_contacts = Contacts.get_for(viewer.id)

    viewer_contacts_ids =
      viewer_contacts
      |> Enum.map(& &1.id)

    distance =
      cond do
        viewer_id == id ->
          0

        Enum.member?(viewer_contacts_ids, id) ->
          1

        true ->
          2
      end

    subject_contacts = Contacts.get_for(id)

    # TODO: hide contact info based on distance to contact, not profile subject
    # NOTE: omit sensitive contact details from 1+ degree connections
    subject_contacts =
      if distance == 0,
        do: subject_contacts,
        else: Enum.map(subject_contacts, &Map.drop(&1, ~w(e164 email)a))

    # annotate contacts w/ context
    subject_conversations =
      Conversations.get_conversations(id)
      |> Repo.preload(Conversations.preloads())

    subject_contacts =
      subject_contacts
      |> Enum.map(fn contact ->
        count =
          subject_conversations
          |> Enum.count(fn conv ->
            participants_ids = Enum.map(conv.participations, fn p -> p.participant_id end)

            conv.creator_id == contact.id or Enum.member?(participants_ids, contact.id)
          end)

        Map.put(contact, :conversation_count_with_subject, count)
      end)
      |> Enum.sort_by(& &1.conversation_count_with_subject, :desc)

    filter_event = Repo.one(App.FilterEvent.latest(id, viewer_id))
    muted = if is_nil(filter_event), do: false, else: Map.get(filter_event, :active, false)

    Repo.get(Profile, id)
    |> lift(nil, :not_found)
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
    |> fmap(&Map.put(&1, :social_distance, distance))
    |> fmap(&Map.put(&1, :events, events))
    |> fmap(&Map.put(&1, :contacts, subject_contacts))
    |> fmap(&Map.put(&1, :is_muted, muted))
  end

  def update(
        customer,
        input
      ) do
    Repo.get(Profile, customer.id)
    |> lift(nil, :not_found)
    |> fmap(&Profile.changeset(&1, input))
    |> bind(&Repo.update/1)
    # own profile
    |> fmap(&Map.put(&1, :social_distance, 0))
    |> fmap(&App.Analytics.identify(&1))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  def mute(
        customer,
        input
      ) do
    Repo.get(Profile, Map.get(input, :profile_id))
    |> lift(nil, :not_found)
    |> fmap(fn profile ->
      Map.merge(input, %{
        creator: customer,
        profile: profile,
        occurred_at: Timex.now()
      })
      |> App.FilterEvent.mute_changeset()
    end)
    |> bind(&Repo.insert_or_update(&1, on_conflict: {:replace, [:active]}, conflict_target: :id))
    |> bind(fn filter_event ->
      id = filter_event.profile_id

      App.Profiles.get(customer, %{id: id, filters: %{only_with: id}})
    end)
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end
end
