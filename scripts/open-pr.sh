#!/usr/bin/env bash
set -euo pipefail

TITLE_ARG="${1:-}"

# Conventional Commits regex (subject só, sem body)
CC_REGEX='^(feat|fix|refactor|docs|test|chore|perf|style|build|ci|revert)(\([a-z0-9._-]+\))?!?: .{1,}$'

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  echo "error: você está em main. Crie uma branch primeiro: make branch NAME=<slug>" >&2
  exit 1
fi

if [[ ! "$CURRENT_BRANCH" =~ ^ma/ ]]; then
  echo "warn: branch '$CURRENT_BRANCH' não segue o prefixo ma/ (continuando mesmo assim)"
fi

# Garante que main local está atualizada para diff correto
git fetch origin main --quiet

# Pega commits desta branch que não estão em main
COMMITS=$(git log --pretty=format:"%s" origin/main..HEAD || true)

if [[ -z "$COMMITS" ]]; then
  echo "error: nenhum commit novo em relação a origin/main. Commita algo primeiro." >&2
  exit 1
fi

COMMIT_COUNT=$(echo "$COMMITS" | wc -l | tr -d ' ')

# Decide o título da PR
if [[ -n "$TITLE_ARG" ]]; then
  TITLE="$TITLE_ARG"
elif [[ "$COMMIT_COUNT" == "1" ]]; then
  TITLE="$COMMITS"
else
  echo "error: branch tem $COMMIT_COUNT commits — passe TITLE explicitamente" >&2
  echo "uso:   make pr TITLE=\"feat(scope): subject\"" >&2
  echo "" >&2
  echo "commits nesta branch:" >&2
  echo "$COMMITS" | sed 's/^/  - /' >&2
  exit 1
fi

# Valida formato conventional commits
if ! [[ "$TITLE" =~ $CC_REGEX ]]; then
  echo "error: PR title não segue Conventional Commits" >&2
  echo "       título: '$TITLE'" >&2
  echo "       formato esperado: <type>(<scope>): <subject>" >&2
  echo "       types: feat, fix, refactor, docs, test, chore, perf, style, build, ci, revert" >&2
  echo "       ex:    feat(git): add commit-style skill" >&2
  exit 1
fi

# Gera body agrupado
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
  echo "_$COMMIT_COUNT commit(s) — será squashed no merge._"
}

BODY=$(generate_body)

# Push (com -u na primeira vez)
echo "→ push origin $CURRENT_BRANCH"
git push -u origin HEAD --quiet

# Cria a PR
echo "→ abrindo PR"
gh pr create --title "$TITLE" --body "$BODY"

echo ""
echo "✓ PR aberta — próximo passo: make review"
