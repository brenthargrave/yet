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
    contacts_for_viewers([viewer])
  end

  defunp contacts_for_viewers(viewers :: list(Contact.t())) :: list(Contact.t()) do
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
