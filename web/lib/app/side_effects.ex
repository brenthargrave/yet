defmodule App.SideEffects do
  @moduledoc """
  Runtime gate for integrations that can contact people or third parties.

  The redeployed demo should stay inspectable without accidentally sending SMS,
  email, analytics, or scheduled digests. Set `APP_SIDE_EFFECTS_ENABLED=true`
  only after each outbound integration has been re-audited for the current
  deployment, or set a comma-separated allowlist such as `segment,sms`.
  """

  def enabled?(kind) when is_atom(kind) do
    case normalized_setting() do
      "true" ->
        true

      "all" ->
        true

      setting ->
        setting
        |> String.split(",", trim: true)
        |> Enum.map(&String.trim/1)
        |> Enum.member?(Atom.to_string(kind))
    end
  end

  defp normalized_setting do
    "APP_SIDE_EFFECTS_ENABLED"
    |> System.get_env("false")
    |> String.downcase()
  end
end
