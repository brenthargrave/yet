defmodule AppWeb.Graph.Notes do
  use Absinthe.Schema.Notation

  alias AppWeb.Resolvers.{
    Notes
  }

  alias App.{
    Note,
    UserError
  }

  enum :note_status do
    value(:draft, as: :draft)
    value(:deleted, as: :deleted)
    value(:posted, as: :posted)
  end

  object :note do
    field(:id, non_null(:id))
    field(:conversation_id, non_null(:id))
    field(:status, non_null(:note_status))
    field(:created_at, non_null(:datetime))
    field(:deleted_at, :datetime)
    field(:posted_at, :datetime)
    field(:text, :string)
    field(:creator, non_null(:profile))
  end

  input_object :upsert_note_input do
    field(:id, non_null(:id))
    field(:conversation_id, non_null(:id))
    field(:status, :note_status)
    field(:text, :string)
    field(:created_at, :datetime)
  end

  input_object :delete_note_input do
    field(:id, non_null(:id))
    field(:deleted_at, :datetime)
  end

  input_object :post_note_input do
    field(:id, non_null(:id))
    field(:posted_at, :datetime)
  end

  union :note_result do
    types([:note, :user_error])

    resolve_type(fn
      %Note{}, _ ->
        :note

      %UserError{}, _ ->
        :user_error
    end)
  end

  object :notes_mutations do
    field :upsert_note, :note_result do
      arg(:input, non_null(:upsert_note_input))
      resolve(&Notes.upsert/3)
    end

    field :delete_note, :note_result do
      arg(:input, non_null(:delete_note_input))
      resolve(&Notes.delete/3)
    end

    field :post_note, :note_result do
      arg(:input, non_null(:post_note_input))
      resolve(&Notes.post/3)
    end
  end

  input_object :noted_added_input do
    field(:conversation_id, non_null(:id))
  end

  object :notes_subscriptions do
    field :note_added, :note do
      arg(:input, non_null(:noted_added_input))

      config(fn args, _ ->
        {:ok, topic: args.input.conversation_id}
      end)

      resolve(fn note, _, _ ->
        {:ok, note}
      end)
    end
  end
end
