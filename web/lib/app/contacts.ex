defmodule App.Contacts do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  import Ecto.Query

  alias App.{
    Repo,
    Contact,
    Customer
  }

  defun get_contacts(viewer :: Customer.t()) :: list(Contact.t()) do
    get_contacts_for_viewers([viewer])
  end

  defp get_contacts_for_viewers(viewers) do
    viewer_ids = Enum.map(viewers, &Map.get(&1, :id))

    Repo.all(
      from(contact in Contact,
        join: conversation in assoc(contact, :conversations),
        # NOTE: https://elixirforum.com/t/ecto-left-in-right/20004/4
        where: fragment("? @> ?", conversation.participant_ids, ^viewer_ids),
        where: conversation.status != :deleted,
        distinct: contact.id
      )
    )
  end
end
