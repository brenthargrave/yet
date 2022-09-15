use Croma

defmodule App.Task do
  @type callback() :: (() -> any())

  defun async_nolink(callback :: callback()) :: any() do
    Task.Supervisor.async_nolink(App.TaskSupervisor, fn ->
      callback.()
    end)
  end
end
