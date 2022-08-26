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

  defun get_contacts(viewer :: Customer.t()) :: Brex.Result.s(list(Contact.t())) do
    signers =
      from(contact in Contact,
        join: signature in assoc(contact, :signatures),
        join: conversation in assoc(signature, :conversation),
        where: conversation.creator_id == ^viewer.id,
        where: conversation.status != :deleted,
        distinct: contact.id
      )

    creators =
      from(contact in Contact,
        join: conversation in assoc(contact, :conversations),
        join: signature in assoc(conversation, :signatures),
        where: signature.signer_id == ^viewer.id,
        where: conversation.status != :deleted,
        distinct: contact.id
      )

    Repo.all(from c in signers, union: ^creators)
  end
end
