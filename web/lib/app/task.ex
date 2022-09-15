use Croma

alias App.{
  Repo
}

defmodule App.Task do
  @type callback() :: (() -> any())

  defun async_nolink(callback :: callback()) :: any() do
    if System.get_env("MIX_ENV") == "test" do
      parent = self()

      Task.Supervisor.async_nolink(App.TaskSupervisor, fn ->
        Ecto.Adapters.SQL.Sandbox.allow(Repo, parent, self())
        callback.()
      end)
    else
      Task.Supervisor.async_nolink(App.TaskSupervisor, fn ->
        callback.()
      end)
    end
  end
end
