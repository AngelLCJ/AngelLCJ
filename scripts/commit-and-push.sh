#!/usr/bin/env bash
# usage: commit-and-push.sh "<message>" <path>...
# Commits the given paths if they changed and pushes, rebasing over concurrent
# writers (Actions and the local stats sync). On a rebase conflict our freshly
# generated files win; the next scheduled build reconciles anything else.
set -euo pipefail
readonly ATTEMPTS=5
msg=$1; shift
git add -- "$@"
if git diff --cached --quiet; then
  echo "nothing to commit"
  exit 0
fi
git commit --quiet -m "$msg"
for ((i = 1; i <= ATTEMPTS; i++)); do
  if git push --quiet; then exit 0; fi
  echo "push rejected (attempt $i/$ATTEMPTS), rebasing"
  git pull --rebase --quiet -X theirs
done
echo "push failed after $ATTEMPTS attempts" >&2
exit 1
