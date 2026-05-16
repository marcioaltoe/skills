#!/usr/bin/env bash
set -euo pipefail

TITLE_ARG="${1:-}"

# Conventional Commits regex (subject only, no body)
CC_REGEX='^(feat|fix|refactor|docs|test|chore|perf|style|build|ci|revert)(\([a-z0-9._-]+\))?!?: .{1,}$'

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "error: you are on main. Create a branch first: make branch NAME=<slug>" >&2
  exit 1
fi

if [[ ! "$CURRENT_BRANCH" =~ ^ma/ ]]; then
  echo "warn: branch '$CURRENT_BRANCH' does not follow the ma/ prefix (continuing anyway)"
fi

# Make sure local main is up to date for the correct diff
git fetch origin main --quiet

# Get commits on this branch that aren't on main
COMMITS=$(git log --pretty=format:"%s" origin/main..HEAD || true)

if [[ -z "$COMMITS" ]]; then
  echo "error: no new commits relative to origin/main. Commit something first." >&2
  exit 1
fi

COMMIT_COUNT=$(echo "$COMMITS" | wc -l | tr -d ' ')

# Decide the PR title
if [[ -n "$TITLE_ARG" ]]; then
  TITLE="$TITLE_ARG"
elif [[ "$COMMIT_COUNT" == "1" ]]; then
  TITLE="$COMMITS"
else
  echo "error: branch has $COMMIT_COUNT commits — pass TITLE explicitly" >&2
  echo "usage: make pr TITLE=\"feat(scope): subject\"" >&2
  echo "" >&2
  echo "commits on this branch:" >&2
  echo "$COMMITS" | sed 's/^/  - /' >&2
  exit 1
fi

# Validate Conventional Commits format
if ! [[ "$TITLE" =~ $CC_REGEX ]]; then
  echo "error: PR title does not follow Conventional Commits" >&2
  echo "       title: '$TITLE'" >&2
  echo "       expected format: <type>(<scope>): <subject>" >&2
  echo "       types: feat, fix, refactor, docs, test, chore, perf, style, build, ci, revert" >&2
  echo "       e.g.:  feat(git): add commit-style skill" >&2
  exit 1
fi

# Generate grouped body
generate_body() {
  local feats fixes refactors others
  feats=$(echo "$COMMITS"     | grep -E '^feat(\(|:|!)'     || true)
  fixes=$(echo "$COMMITS"     | grep -E '^fix(\(|:|!)'      || true)
  refactors=$(echo "$COMMITS" | grep -E '^refactor(\(|:|!)' || true)
  others=$(echo "$COMMITS"    | grep -vE '^(feat|fix|refactor)(\(|:|!)' || true)

  if [[ -n "$feats" ]]; then
    echo "## Features"
    echo ""
    echo "$feats" | sed 's/^/- /'
    echo ""
  fi
  if [[ -n "$fixes" ]]; then
    echo "## Fixes"
    echo ""
    echo "$fixes" | sed 's/^/- /'
    echo ""
  fi
  if [[ -n "$refactors" ]]; then
    echo "## Refactors"
    echo ""
    echo "$refactors" | sed 's/^/- /'
    echo ""
  fi
  if [[ -n "$others" ]]; then
    echo "## Other"
    echo ""
    echo "$others" | sed 's/^/- /'
    echo ""
  fi

  echo "---"
  echo ""
  echo "_$COMMIT_COUNT commit(s) — will be squashed on merge._"
}

BODY=$(generate_body)

# Push (with -u on the first time)
echo "→ push origin $CURRENT_BRANCH"
git push -u origin HEAD --quiet

# Create the PR
echo "→ opening PR"
gh pr create --title "$TITLE" --body "$BODY"

echo ""
echo "✓ PR opened — next step: make review"
