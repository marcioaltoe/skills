#!/usr/bin/env bash
set -euo pipefail

# Dispara um review do Claude na PR atual.
# Requer a Claude Code Review GitHub App instalada no repo
# (https://github.com/apps/claude) — caso contrário o comentário
# fica inerte mas não causa erro.

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "error: você está em main — sem PR para revisar" >&2
  exit 1
fi

# Confirma que existe PR para a branch
PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "")

if [[ -z "$PR_NUMBER" ]]; then
  echo "error: nenhuma PR encontrada para '$CURRENT_BRANCH'" >&2
  echo "       rode 'make pr' primeiro" >&2
  exit 1
fi

echo "→ comentando @claude na PR #$PR_NUMBER"
gh pr comment "$PR_NUMBER" --body "@claude review"

echo ""
echo "✓ review disparado — acompanhe em:"
gh pr view --json url -q .url
