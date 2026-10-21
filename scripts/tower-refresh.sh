#!/usr/bin/env bash
# Local-only: refresh aggregate stats from the private work repo and publish them.
# Needs TOWER_WORK_REPO (owner/name) in the environment and an authenticated `gh`.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${TOWER_WORK_REPO:?TOWER_WORK_REPO is required}"
git pull --rebase --quiet
npm run --silent refresh-stats
npm run --silent build
npx vitest run --silent >/dev/null
scripts/commit-and-push.sh "chore: sync tower stats" data/stats.json assets
