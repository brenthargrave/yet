defmodule App.SideEffectsTest do
  use ExUnit.Case, async: false

  setup do
    original = System.get_env("APP_SIDE_EFFECTS_ENABLED")

    on_exit(fn ->
      if original do
        System.put_env("APP_SIDE_EFFECTS_ENABLED", original)
      else
        System.delete_env("APP_SIDE_EFFECTS_ENABLED")
      end
    end)
  end

  test "disables all side effects by default" do
    System.delete_env("APP_SIDE_EFFECTS_ENABLED")

    refute App.SideEffects.enabled?(:sms)
  end

  test "enables all side effects with true or all" do
    System.put_env("APP_SIDE_EFFECTS_ENABLED", "true")
    assert App.SideEffects.enabled?(:sms)

    System.put_env("APP_SIDE_EFFECTS_ENABLED", "all")
    assert App.SideEffects.enabled?(:segment)
  end

  test "enables a comma-separated category allowlist" do
    System.put_env("APP_SIDE_EFFECTS_ENABLED", "segment, sms")

    assert App.SideEffects.enabled?(:segment)
    assert App.SideEffects.enabled?(:sms)
    refute App.SideEffects.enabled?(:email_digest)
  end
end
