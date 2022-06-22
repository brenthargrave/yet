defmodule AppWeb.Resolvers.Conversations do
  use Croma
  use App.Types
  use TypedStruct
  # import ShorterMaps
  # alias App.{Onboarding}
  # alias App.{UserError, Customer}

  typedstruct module: ConversationPayload do
    # field :conservation, Customer.t()
    # field :user_error, UserError.t()
  end

  defun upsert_conversation(
          _parent,
          %{input: input} = _args,
          %{context: context = %{customer: customer}} = _resolution
        ) :: resolver_result() do
    IO.puts(inspect(input))
    IO.puts(inspect(context))
    # error handling?
    App.Conversation.upsert_conversation(input, customer)
    {:ok, %{}}
  end
end
