defmodule AppWeb.Graph.Analytics do
  use Absinthe.Schema.Notation

  enum :event_name do
    value(:tap_signup)
  end

  object :event do
    field(:name, non_null(:event_name))
  end

  input_object :event_properties do
    field(:install_id, non_null(:string))
  end

  input_object :track_event_input do
    field(:name, non_null(:event_name))
    field(:properties, non_null(:event_properties))
  end

  object :track_event_result do
    field :event, type: :event
  end

  object :track_event_mutation do
    @desc "Track event"
    field :track_event, :track_event_result do
      arg(:input, non_null(:track_event_input))

      resolve(fn _parent, args, _context ->
        IO.puts(inspect(args))
        # %{input: %{name: :tap_signup, properties: %{install: %{id: "foo "}}}}
        {:error, "TODO"}
        # TODO: insert event
        # TODO: segment
      end)
    end
  end

  object :analytics_queries do
    field :events, non_null(list_of(non_null(:event))) do
      resolve(fn _parent, _args, _context ->
        {:ok, App.Analytics.list_events()}
      end)
    end
  end

  object :analytics_mutations do
    import_fields(:track_event_mutation)
  end
end
