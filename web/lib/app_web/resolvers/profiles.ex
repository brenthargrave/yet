defmodule AppWeb.Resolvers.Profiles do
  use Croma
  use App.Types
  use TypedStruct
  use Brex.Result
  require Logger

  alias App.{
    Contacts,
    Profiles
  }

  def get(
        _parent,
        %{input: input} = _args,
        %{context: %{customer: customer}} = _resolution
      ) do
    Profiles.get(customer, input)
  end

  def get(_parent, _args, _resolution) do
    error(:unauthorized)
  end

  def update(
        _parent,
        %{input: input} = _args,
        %{context: %{customer: customer}} = _resolution
      ) do
    Profiles.update(customer, input)
  end

  typedstruct module: ContactsPayload do
    field(:contacts, list(Contact.t()))
  end

  def get_contacts(_parent, _args, %{context: %{customer: customer}} = _resolution) do
    Contacts.get_for(customer.id)
    |> ok()
    |> fmap(&%ContactsPayload{contacts: &1})
  end

  def get_contacts(_parent, _args, _resolution) do
    ok(%ContactsPayload{contacts: []})
  end
end
