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

  def get_contacts_for_viewers(viewers) do
    viewer_ids =
      viewers
      |> Enum.map(&Map.get(&1, :id))
      |> IO.inspect(label: "THIS get_contacts > viewer_ids")

    signers =
      from(contact in Contact,
        join: signature in assoc(contact, :signatures),
        join: conversation in assoc(signature, :conversation),
        where: conversation.creator_id in ^viewer_ids,
        where: conversation.status != :deleted,
        distinct: contact.id
      )

    creators =
      from(contact in Contact,
        join: conversation in assoc(contact, :conversations),
        join: signature in assoc(conversation, :signatures),
        where: signature.signer_id in ^viewer_ids,
        where: conversation.status != :deleted,
        distinct: contact.id
      )

    Repo.all(from c in signers, union: ^creators)
  end
end
