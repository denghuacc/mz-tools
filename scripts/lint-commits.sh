#!/usr/bin/env bash

set -euo pipefail

from_sha="${1:?missing commit range start}"
to_sha="${2:?missing commit range end}"
commitlint_introduction="$(
  git log --reverse --diff-filter=A --format=%H "$to_sha" -- commitlint.config.cjs |
    head -n 1
)"

# The branch predates commitlint. Start at the commit that introduced the
# executable rules so legacy messages do not make the first enforcing PR fail.
if [[ -n "$commitlint_introduction" ]] &&
  git merge-base --is-ancestor "$from_sha" "$commitlint_introduction"; then
  from_sha="${commitlint_introduction}^"
fi

pnpm exec commitlint --from "$from_sha" --to "$to_sha" --verbose
