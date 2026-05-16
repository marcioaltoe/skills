#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOK_SRC="$REPO_ROOT/scripts/hooks/commit-msg"
HOOK_DST="$REPO_ROOT/.git/hooks/commit-msg"

if [[ ! -f "$HOOK_SRC" ]]; then
  echo "error: $HOOK_SRC não encontrado" >&2
  exit 1
fi

chmod +x "$HOOK_SRC"

# Usa symlink relativo para que updates ao script reflitam imediatamente
ln -sf "../../scripts/hooks/commit-msg" "$HOOK_DST"

echo "✓ commit-msg hook instalado"
echo "  agora commits são validados contra Conventional Commits"
