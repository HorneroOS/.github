#!/usr/bin/env bash
# Full-tree action pin check: every external GitHub Action reference in
# .github/workflows must be pinned to a full 40-char commit SHA with a
# human-readable version comment, e.g.:
#
#   uses: actions/checkout@<40-char-sha> # v4.2.2
#
# Local actions (./...) and docker:// references are exempt. This is the
# batch-level twin of the Danger `action-pin` rule, which enforces the
# same contract on changed workflow files in PRs.
#
# Usage: bash scripts/check-action-pins.sh [--root DIR]
set -euo pipefail

ROOT="."
if [[ ${1:-} == "--root" && -n ${2:-} ]]; then
  ROOT="$2"
fi

fail=0
while IFS= read -r file; do
  lineno=0
  while IFS= read -r line || [[ -n $line ]]; do
    lineno=$((lineno + 1))
    trimmed="$(printf '%s' "$line" | sed 's/^[[:space:]]*//')"
    case "$trimmed" in \#*) continue ;; esac
    case "$trimmed" in *uses:*) ;; *) continue ;; esac
    ref="$(printf '%s' "$trimmed" | sed -n 's/.*uses:[[:space:]]*\([^[:space:]#}]*\).*/\1/p')"
    case "$ref" in "" | ./* | docker://*) continue ;; esac
    if ! printf '%s' "$trimmed" | grep -Eq 'uses:[[:space:]]*[^[:space:]#}]+@[0-9a-f]{40}[[:space:]]+#[[:space:]]*(v[0-9]|governance-v[0-9])'; then
      echo "PIN-FAIL: $file:$lineno: unpinned action \"$ref\""
      fail=1
    fi
  done <"$file"
done < <(find "$ROOT/.github/workflows" -name '*.yml' | sort)

if [[ $fail -eq 0 ]]; then
  echo "PIN-PASS: all external actions are SHA-pinned"
fi
exit $fail
