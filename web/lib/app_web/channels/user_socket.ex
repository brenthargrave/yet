defmodule AppWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket, schema: AppWeb.Graph.Schema
  use Brex.Result

  ## Channels
  # channel "room:*", AppWeb.RoomChannel

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  @impl true
  def connect(params, socket, _connect_info) do
    socket =
      case App.Auth.with_token(Map.get(params, "token")) do
        nil ->
          socket

        %App.Customer{} = customer ->
          Absinthe.Phoenix.Socket.put_options(socket,
            context: %{
              customer: customer
            }
          )

        _ ->
          socket
      end

    {:ok, socket}
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     AppWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  def id(_socket), do: nil
end
