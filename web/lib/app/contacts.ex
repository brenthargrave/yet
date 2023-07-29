defmodule App.Contacts do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  import Ecto.Query

  alias App.{
    Repo,
    Contact
  }

  def get_for(viewer_ids) when is_list(viewer_ids) do
    participants =
      from(contact in Contact,
        join: participation in assoc(contact, :participations),
        join: conversation in assoc(participation, :conversation),
        where: conversation.creator_id in ^viewer_ids,
        where: conversation.status != :deleted,
        distinct: contact.id
      )

    creators =
      from(contact in Contact,
        join: conversation in assoc(contact, :conversations),
        join: participation in assoc(conversation, :participations),
        where: participation.participant_id in ^viewer_ids,
        where: conversation.status != :deleted,
        distinct: contact.id
      )

    Repo.all(from(c in participants, union: ^creators))
  end

  def get_for(viewer_id) when not is_list(viewer_id) do
    get_for([viewer_id])
  end
end
