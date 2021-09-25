defmodule AppWeb.Graph.Schema do
  use Absinthe.Schema

  # TODO: define in SDL
  # import_sdl(path: Path.absname("./sdl.graphql", __DIR__))

  object :event do
    field :name, non_null(:string)
  end

  query do
    field :events, non_null(list_of(non_null(:event))) do
      resolve(fn _parent, _args, _context ->
        {:ok, []}
      end)
    end
  end

  #  Twilio Verification
  enum :verification_status do
    value(:pending)
    value(:approved)
    value(:canceled)
  end

  # TODO: wrap w/ Result type
  object :verification do
    field :status, non_null(:verification_status)
  end

  input_object :create_verification_input do
    # TODO: custom scalar for e164
    field :e164, non_null(:string)
  end

  mutation do
    field :create_verification, type: :verification do
      arg(:input, non_null(:create_verification_input))
    end
  end
end
