#!/usr/bin/env bash
set -euo pipefail

# Triggers a Claude review on the current PR.
# Requires the Claude Code Review GitHub App installed on the repo
# (https://github.com/apps/claude) — otherwise the comment is inert
# but does not cause an error.

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "error: you are on main — no PR to review" >&2
  exit 1
fi

# Confirm a PR exists for this branch
PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "")

if [[ -z "$PR_NUMBER" ]]; then
  echo "error: no PR found for '$CURRENT_BRANCH'" >&2
  echo "       run 'make pr' first" >&2
  exit 1
fi

echo "→ commenting @claude on PR #$PR_NUMBER"
gh pr comment "$PR_NUMBER" --body "@claude review"

echo ""
echo "✓ review triggered — follow it at:"
gh pr view --json url -q .url
