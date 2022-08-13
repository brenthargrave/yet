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
    :creator
  ]

  defun opps(viewer :: Customer.t()) :: Brex.Result.s(list(Opp.t())) do
    created =
      from(o in Opp,
        preload: ^@preloads,
        where: o.creator_id == ^viewer.id,
        order_by: [desc: o.inserted_at]
      )

    Repo.all(created)
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
