#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOK_SRC="$REPO_ROOT/scripts/hooks/commit-msg"
HOOK_DST="$REPO_ROOT/.git/hooks/commit-msg"

if [[ ! -f "$HOOK_SRC" ]]; then
  echo "error: $HOOK_SRC not found" >&2
  exit 1
fi

chmod +x "$HOOK_SRC"

# Use a relative symlink so updates to the script reflect immediately
ln -sf "../../scripts/hooks/commit-msg" "$HOOK_DST"

echo "✓ commit-msg hook installed"
echo "  commits are now validated against Conventional Commits"
