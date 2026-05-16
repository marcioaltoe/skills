#!/usr/bin/env bash
set -euo pipefail

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "error: você está em main — nada a mesclar" >&2
  exit 1
fi

PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "")

if [[ -z "$PR_NUMBER" ]]; then
  echo "error: nenhuma PR encontrada para '$CURRENT_BRANCH'" >&2
  exit 1
fi

# Verifica status de review (warning, não bloqueia)
REVIEW_STATE=$(gh pr view "$PR_NUMBER" --json reviewDecision -q .reviewDecision 2>/dev/null || echo "")
if [[ "$REVIEW_STATE" != "APPROVED" ]]; then
  echo "warn: PR #$PR_NUMBER não está aprovada (review state: ${REVIEW_STATE:-none})"
  read -r -p "      continuar mesmo assim? [y/N] " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "abortado"
    exit 1
  fi
fi

echo "→ squash merge PR #$PR_NUMBER (--auto: espera CI passar)"
gh pr merge "$PR_NUMBER" --squash --delete-branch --auto

echo "→ voltando pra main"
git checkout main --quiet
git pull --ff-only origin main --quiet

echo ""
echo "✓ PR #$PR_NUMBER squashed e main atualizada"
