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
    # Repo.all(
    #   from(contact in Contact,
    #     join: conversation in assoc(contact, :conversations),
    #     where: ^viewer.id in conversation.participant_ids,
    #     where: conversation.status != :deleted,
    #     distinct: contact.id
    #   )
    # )
    get_contacts_for_viewers([viewer])
  end

  defp get_contacts_for_viewers(viewers) do
    viewer_ids = Enum.map(viewers, &Map.get(&1, :id))

    signers =
      from(contact in Contact,
        join: signature in assoc(contact, :signatures),
        join: conversation in assoc(signature, :conversation),
        where: conversation.status != :deleted,
        where: conversation.creator_id in ^viewer_ids
      )

    creators =
      from(contact in Contact,
        join: conversation in assoc(contact, :conversations),
        join: signature in assoc(conversation, :signatures),
        where: conversation.status != :deleted,
        where: signature.signer_id in ^viewer_ids
      )

    Repo.all(
      from(contact in signers,
        union: ^creators,
        distinct: contact.id
      )
    )
  end
end
