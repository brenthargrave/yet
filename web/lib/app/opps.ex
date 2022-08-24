defmodule App.Opps do
  use App.Types
  use Croma
  use TypedStruct
  use Brex.Result
  use Timex
  alias App.{Repo, Customer, Opp}
  import Ecto.Query
  import App.Helpers, only: [format_ecto_errors: 1]

  @preloads [
    :creator,
    :mentions,
    conversations: [
      :creator,
      :mentions,
      reviews: [:reviewer],
      signatures: [:signer]
    ]
  ]

  defun opps(viewer :: Customer.t()) :: Brex.Result.s(list(Opp.t())) do
    created_opps =
      from(o in Opp,
        where: o.creator_id == ^viewer.id
      )

    through_conversations_created =
      from(o in Opp,
        join: c in assoc(o, :conversations),
        where: c.creator_id == ^viewer.id
      )

    through_conversations_signed =
      from(o in Opp,
        join: c in assoc(o, :conversations),
        join: s in assoc(c, :signatures),
        where: s.signer_id == ^viewer.id
      )

    union_query = union(created_opps, ^through_conversations_created)
    union_query = union(union_query, ^through_conversations_signed)

    Repo.all(
      from(o in subquery(union_query),
        preload: ^@preloads,
        order_by: [desc: o.inserted_at]
      )
    )
    |> ok()
  end

  defun upsert_opp(
          customer,
          input
        ) :: Brex.Result.s(Opp.t()) do
    attrs = Map.put(input, :creator, customer)

    Repo.get(Opp, attrs.id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> convert_error(:not_found, %Opp{})
    # only creator can edit
    |> bind(
      &if !is_nil(&1.creator_id) && &1.creator_id != customer.id,
        do: error(:unauthorized),
        else: ok(&1)
    )
    |> fmap(&Opp.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Repo.preload(&1, @preloads))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  defun get_opp(id :: id()) :: Brex.Result.s(Opp.t()) do
    Repo.get(Opp, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
  end
end
