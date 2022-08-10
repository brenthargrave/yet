defmodule App.Opps do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  alias App.{Repo, Customer, Opp}
  import Ecto.Query

  @preloads [
    :creator
  ]

  defun opps(viewer :: Customer.t()) :: Brex.Result.s(list(Opp.t())) do
    created =
      from(o in Opp,
        preload: ^@preloads,
        where: o.creator_id == ^viewer.id
      )

    Repo.all(created)
    |> ok()
  end
end
