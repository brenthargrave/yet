#!/usr/bin/env bash
# shellcheck shell=bash
# Reject committing symlinks whose target resolves OUTSIDE the repository.
# Such links are clone-local or machine-specific (e.g. into the _private volume)
# and committing them leaks broken refs and external paths. See AGENTS.md.
set -euo pipefail

repo_root=$(cd "$(git rev-parse --show-toplevel)" && pwd -P)
found=0

report() {
  if [ "$found" -eq 0 ]; then
    echo "pre-commit: refusing to commit symlink(s) pointing outside the repo:" >&2
    found=1
  fi
  printf '  %s -> %s\n' "$1" "$2" >&2
}

# In `git diff --cached --raw`, the new mode is field 2; 120000 means a symlink,
# and the staged blob of a symlink is its target path.
while IFS= read -r line; do
  [ "$(printf '%s\n' "$line" | awk '{print $2}')" = "120000" ] || continue
  path=${line#*$'\t'}
  target=$(git cat-file -p ":$path" 2>/dev/null || true)
  [ -n "$target" ] || continue

  # Absolute targets are machine-specific / outside the repo by definition.
  case "$target" in
    /*) report "$path" "$target"; continue ;;
  esac

  # Physically resolve the target's directory — follows any intermediate symlinks
  # (e.g. a _private boundary link), as long as that directory exists locally.
  link_dir=$(cd "$repo_root/$(dirname "$path")" 2>/dev/null && pwd -P || true)
  resolved=""
  [ -n "$link_dir" ] && resolved=$(cd "$link_dir" && cd "$(dirname "$target")" 2>/dev/null && pwd -P || true)

  if [ -n "$resolved" ]; then
    case "$resolved/" in
      "$repo_root"/*) : ;;            # inside the repo → fine
      *) report "$path" "$target" ;;  # outside → reject
    esac
  else
    # Dangling target (dir missing locally): fall back to a lexical escape check.
    case "$(dirname "$path")/$target" in
      ../*|*/../*) report "$path" "$target" ;;
    esac
  fi
done < <(git diff --cached --raw --diff-filter=ACM)

if [ "$found" -ne 0 ]; then
  echo "" >&2
  echo "Symlinks must stay within the repository. For a local-only link" >&2
  echo "(e.g. into _private), untrack it: git rm --cached <path>" >&2
  exit 1
fi
exit 0
