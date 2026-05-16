#!/usr/bin/env bash
set -euo pipefail

NAME="${1:-}"

if [[ -z "$NAME" ]]; then
  echo "error: NAME é obrigatório" >&2
  echo "uso: make branch NAME=<slug>" >&2
  echo "ex:  make branch NAME=add-react-skill" >&2
  exit 1
fi

# Slugify: lowercase, [a-z0-9-] apenas
SLUG=$(echo "$NAME" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9-]+/-/g' \
  | sed -E 's/^-+|-+$//g' \
  | sed -E 's/-+/-/g')

if [[ -z "$SLUG" ]]; then
  echo "error: NAME inválido após slugify" >&2
  exit 1
fi

BRANCH="ma/$SLUG"

# Verifica se já existe
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "error: branch '$BRANCH' já existe localmente" >&2
  echo "      use: git checkout $BRANCH" >&2
  exit 1
fi

# Atualiza main e cria branch
echo "→ Atualizando main"
git fetch origin main --quiet
git checkout main --quiet
git pull --ff-only origin main --quiet

echo "→ Criando $BRANCH"
git checkout -b "$BRANCH"

echo ""
echo "✓ branch pronta: $BRANCH"
echo "  edite os arquivos, faça commits no padrão conventional, depois: make pr"
