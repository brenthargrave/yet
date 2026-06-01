#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <commit-message-file>" >&2
  exit 2
fi

MESSAGE_FILE="$1"

if [[ ! -f "$MESSAGE_FILE" ]]; then
  echo "error: commit message file not found: $MESSAGE_FILE" >&2
  exit 2
fi

LINES=()
while IFS= read -r line; do
  LINES+=("$line")
done < <(git stripspace --strip-comments < "$MESSAGE_FILE")

SUBJECT="${LINES[0]:-}"
FAILURES=()
TRAILER_RE='^(Fixes|Refs|Sentry|Co-Authored-By): .+$'
CONVENTIONAL_COMMIT_RE='^[a-z]+(\([^)]+\))?!?:[[:space:]]'

add_failure() {
  FAILURES+=("$1")
}

if [[ -z "$SUBJECT" ]]; then
  add_failure "subject is required"
else
  case "$SUBJECT" in
    "Merge "*|"Revert \""*)
      exit 0
      ;;
  esac

  if (( ${#SUBJECT} > 50 )); then
    add_failure "subject must be 50 characters or fewer (${#SUBJECT})"
  fi

  if [[ ! "$SUBJECT" =~ ^[A-Z] ]]; then
    add_failure "subject must start with a capital letter"
  fi

  if [[ "$SUBJECT" == *. ]]; then
    add_failure "subject must not end with a period"
  fi

  if [[ "$SUBJECT" =~ $CONVENTIONAL_COMMIT_RE ]]; then
    add_failure "conventional-commit prefixes are not used in this repo"
  fi

  FIRST_WORD="${SUBJECT%% *}"
  case "$FIRST_WORD" in
    Added|Adds|Adding|Changed|Changes|Changing|Disabled|Disables|Disabling|Documented|Documents|Documenting|Enabled|Enables|Enabling|Extracted|Extracts|Extracting|Fixed|Fixes|Fixing|Hardened|Hardens|Hardening|Improved|Improves|Improving|Moved|Moves|Moving|Normalized|Normalizes|Normalizing|Refactored|Refactors|Refactoring|Refreshed|Refreshes|Refreshing|Removed|Removes|Removing|Switched|Switches|Switching|Updated|Updates|Updating|Wired|Wires|Wiring)
      add_failure "subject should use imperative mood, e.g. 'Add' or 'Fix', not '$FIRST_WORD'"
      ;;
  esac
fi

LINE_COUNT=${#LINES[@]}

if (( LINE_COUNT > 1 )) && [[ -n "${LINES[1]}" ]]; then
  add_failure "leave a blank line between the subject and body"
fi

TRAILER_START=$LINE_COUNT
INDEX=$((LINE_COUNT - 1))

while (( INDEX >= 2 )); do
  LINE="${LINES[INDEX]}"

  if [[ "$LINE" =~ $TRAILER_RE ]]; then
    TRAILER_START=$INDEX
    ((INDEX--))
    continue
  fi

  break
done

if (( TRAILER_START < LINE_COUNT )); then
  if (( TRAILER_START > 2 )) && [[ -n "${LINES[TRAILER_START - 1]}" ]]; then
    add_failure "leave a blank line before trailers"
  fi
fi

BODY_END=$((LINE_COUNT - 1))
if (( TRAILER_START < LINE_COUNT )); then
  BODY_END=$((TRAILER_START - 2))
fi

if (( BODY_END >= 2 )); then
  for (( INDEX = 2; INDEX <= BODY_END; INDEX++ )); do
    LINE="${LINES[INDEX]}"

    if [[ -z "$LINE" ]]; then
      continue
    fi

    if (( ${#LINE} > 72 )); then
      add_failure "body lines must be 72 characters or fewer (line $((INDEX + 1)))"
    fi
  done
fi

if (( ${#FAILURES[@]} > 0 )); then
  {
    echo "commit message does not match this repo's format:"
    for FAILURE in "${FAILURES[@]}"; do
      echo "- $FAILURE"
    done
    echo
    echo "subject example:"
    echo "  Add repo commit-msg hook"
  } >&2
  exit 1
fi
