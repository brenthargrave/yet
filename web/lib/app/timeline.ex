defmodule App.Timeline do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  alias App.{Repo, Conversation, Signature, Contact, Review, Customer, Notification}
  # import Ecto.Query
  # import App.Helpers, only: [format_ecto_errors: 1]

  # @preloads [
  #   :creator,
  #   signatures: [:signer, :conversation],
  #   reviews: [:reviewer, :conversation],
  #   mentions: [:opp]
  # ]

  defun get_events(viewer :: Customer.t()) :: Brex.Result.s(list(Conversation.t())) do
    # signed =
    #   from(c in Conversation,
    #     preload: ^@preloads,
    #     join: signature in assoc(c, :signatures),
    #     where: signature.signer_id == ^viewer.id,
    #     where: c.status != :deleted
    #   )

    # reviewed =
    #   from(c in Conversation,
    #     preload: ^@preloads,
    #     join: review in assoc(c, :reviews),
    #     where: review.reviewer_id == ^viewer.id,
    #     where: c.status != :deleted
    #   )

    # created =
    #   from(c in Conversation,
    #     preload: ^@preloads,
    #     where: c.creator_id == ^viewer.id,
    #     where: c.status != :deleted
    #   )

    # Repo.all(from(c in created, union: ^signed, union: ^reviewed))
    []
    |> ok()
  end
end
