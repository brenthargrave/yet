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
    :owner
  ]

  defun opps(viewer :: Customer.t()) :: Brex.Result.s(list(Opp.t())) do
    created_opps =
      from(o in Opp,
        where: o.owner_id == ^viewer.id
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
    attrs = Map.put(attrs, :owner, customer)

    Repo.get(Opp, attrs.id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> convert_error(:not_found, %Opp{})
    # only creator can edit
    |> bind(
      &if !is_nil(&1.owner_id) && &1.owner_id != customer.id,
        do: error(:unauthorized),
        else: ok(&1)
    )
    |> fmap(&Opp.changeset(&1, attrs))
    |> bind(&Repo.insert_or_update(&1))
    |> fmap(&Repo.preload(&1, @preloads))
    |> convert_error(&(&1 = %Ecto.Changeset{}), &format_ecto_errors(&1))
  end

  defun get_opp(
          viewer,
          input
        ) :: Brex.Result.s(Opp.t()) do
    id = Map.get(input, :id)
    filters = %{filters: %{opp_ids: [id]}}
    events = App.Timeline.get_events(viewer, filters)

    Repo.get(Opp, id)
    |> Repo.preload(@preloads)
    |> lift(nil, :not_found)
    |> fmap(&Map.put(&1, :events, events))
  end
end
