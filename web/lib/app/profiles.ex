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
    Contact,
    TimelineEvent
  }

  typedstruct module: Profile, enforce: true do
    field :contact, Contact.t()
    field :events, list(TimelineEvent.t())
  end

  @preloads [
    #   :creator,
    #   opps: [:creator, :owner],
    #   signatures: [:signer, :conversation],
    #   reviews: [:reviewer, :conversation]
  ]

  def preloads() do
    @preloads
  end

  defun get(id :: id(), viewer :: Customer.t()) :: Brex.Result.s(Profile.t()) do
    # TODO: events: this is the hard part - scoping exposed information
    # TODO: expose email, phone (payment?) to contacts only
    Repo.get(Contact, id)
    # |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> fmap(&%Profile{contact: &1, events: []})
  end

  defun update(
          customer,
          input
        ) :: Brex.Result.s(Profile.t()) do
    Repo.get(Customer, customer.id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> fmap(&Customer.profile_changeset(&1, input))
    |> bind(&Repo.insert_or_update(&1))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end
end
