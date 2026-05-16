#!/usr/bin/env bash
set -euo pipefail

NAME="${1:-}"

if [[ -z "$NAME" ]]; then
  echo "error: NAME is required" >&2
  echo "usage: make branch NAME=<slug>" >&2
  echo "e.g.:  make branch NAME=add-react-skill" >&2
  exit 1
fi

# Slugify: lowercase, [a-z0-9-] only
SLUG=$(echo "$NAME" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9-]+/-/g' \
  | sed -E 's/^-+|-+$//g' \
  | sed -E 's/-+/-/g')

if [[ -z "$SLUG" ]]; then
  echo "error: NAME invalid after slugify" >&2
  exit 1
fi

BRANCH="ma/$SLUG"

# Check if it already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "error: branch '$BRANCH' already exists locally" >&2
  echo "       use: git checkout $BRANCH" >&2
  exit 1
fi

# Update main and create branch
echo "→ Updating main"
git fetch origin main --quiet
git checkout main --quiet
git pull --ff-only origin main --quiet

echo "→ Creating $BRANCH"
git checkout -b "$BRANCH"

echo ""
echo "✓ branch ready: $BRANCH"
echo "  edit files, make conventional commits, then: make pr"
