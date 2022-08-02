defmodule App.MixProject do
  use Mix.Project

  def project do
    [
      app: :app,
      version: "0.1.0",
      elixir: "~> 1.7",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix] ++ Mix.compilers(),
      # NOTE: https://git.io/JuC3H
      build_embedded: Mix.env() == :prod,
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      # NOTE: silences ExTwilio warning:
      xref: [exclude: [ExTwilio.Verify.Verifications]]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {App.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.6"},
      {:phoenix_ecto, "~> 4.4"},
      {:ecto_sql, "~> 3.4"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_live_dashboard, "~> 0.4"},
      {:telemetry_metrics, "~> 0.4"},
      {:telemetry_poller, "~> 1.0"},
      {:jason, "~> 1.0"},
      {:plug_cowboy, "~> 2.0"},
      {:phoenix_slime, github: "slime-lang/phoenix_slime", ref: "dc451d8"},
      {:vite_phx, "~> 0.2"},
      {:absinthe_phoenix, "~> 2.0.0"},
      {:absinthe_error_payload, "~> 1.0"},
      {:recase, "~> 0.5"},
      {:ex_twilio, github: "lesserhatch/ex_twilio", ref: "5fc56fc"},
      {:croma, "~> 0.11.2"},
      {:typed_struct, "~> 0.3.0"},
      {:sentry, "~> 8.0"},
      {:ecto_ulid, "~> 0.3.0"},
      {:typed_ecto_schema, "~> 0.4.1"},
      {:brex_result, github: "brexhq/result"},
      {:shorter_maps, "~> 2.2"},
      {:scribe, "~> 0.10"},
      {:tabula, "~> 2.1.1"},
      {:timex, "~> 3.0"},
      {:r_enum, "~> 0.6"}
      # {:ex_cldr_strftime, "~> 0.2.0"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "cmd npm install --prefix assets"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
