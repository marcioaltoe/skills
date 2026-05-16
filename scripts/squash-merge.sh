#!/usr/bin/env bash
set -euo pipefail

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "error: you are on main — nothing to merge" >&2
  exit 1
fi

PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "")

if [[ -z "$PR_NUMBER" ]]; then
  echo "error: no PR found for '$CURRENT_BRANCH'" >&2
  exit 1
fi

# Check review status (warning only, does not block)
REVIEW_STATE=$(gh pr view "$PR_NUMBER" --json reviewDecision -q .reviewDecision 2>/dev/null || echo "")
if [[ "$REVIEW_STATE" != "APPROVED" ]]; then
  echo "warn: PR #$PR_NUMBER is not approved (review state: ${REVIEW_STATE:-none})"
  read -r -p "      continue anyway? [y/N] " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "aborted"
    exit 1
  fi
fi

echo "→ squash merge PR #$PR_NUMBER (--auto: waits for CI to pass)"
gh pr merge "$PR_NUMBER" --squash --delete-branch --auto

echo "→ switching back to main"
git checkout main --quiet
git pull --ff-only origin main --quiet

echo ""
echo "✓ PR #$PR_NUMBER squashed and main updated"
