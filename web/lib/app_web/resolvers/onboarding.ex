defmodule AppWeb.Resolvers.Onboarding do
  use Croma
  use App.Types
  use TypedStruct
  import ShorterMaps
  alias App.{Onboarding}
  alias App.{UserError, Customer}

  typedstruct module: UpdateProfilePayload do
    field :me, Customer.t()
    field :user_error, UserError.t()
  end

  defun patch_profile(
          _parent,
          %{input: ~M{ id, prop, value }} = _args,
          _resolution
        ) :: resolver_result() do
    case Onboarding.patch_profile(id, prop, value) do
      {:ok, customer} ->
        {:ok,
         %UpdateProfilePayload{
           me: customer
           # userError
         }}

      # TODO: changeset errors (ie, validations?) => {:ok, UserError}
      {:error, _} = error ->
        error
    end
  end
end
