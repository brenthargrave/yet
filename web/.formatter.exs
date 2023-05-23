[
  import_deps: [:ecto, :ecto_sql, :phoenix],
  inputs: ["*.{heex,ex,exs}", "{config,lib,test}/**/*.{heex,ex,exs}", "priv/*/seeds.exs"],
  subdirectories: ["priv/*/migrations"],
  plugins: [Phoenix.LiveView.HTMLFormatter],
  # NOTE: ignore Croma macros
  locals_without_parens: [defun: 1]
]
