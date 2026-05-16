#!/usr/bin/env bash
# Importa skills de um diretório .agents/skills (ou .claude/skills) para .inbox/
# com deduplicação por hash de SKILL.md e rastreio de origem.
#
# uso: scripts/import-skills.sh <source-repo-path> [source-label]
#   <source-repo-path>  caminho para o repo (procura .agents/skills/ e .claude/skills/)
#   [source-label]      nome amigável (default: basename do path)

set -euo pipefail

SOURCE_REPO="${1:-}"
SOURCE_LABEL="${2:-$(basename "${SOURCE_REPO}")}"

if [[ -z "$SOURCE_REPO" ]]; then
  echo "uso: $0 <source-repo-path> [source-label]" >&2
  exit 1
fi

if [[ ! -d "$SOURCE_REPO" ]]; then
  echo "error: $SOURCE_REPO não existe" >&2
  exit 1
fi

# Procura o diretório de skills (preferindo .agents/skills, que é a fonte real
# quando .claude/skills é só symlinks)
SKILLS_DIR=""
for candidate in ".agents/skills" ".claude/skills"; do
  if [[ -d "$SOURCE_REPO/$candidate" ]]; then
    SKILLS_DIR="$SOURCE_REPO/$candidate"
    break
  fi
done

if [[ -z "$SKILLS_DIR" ]]; then
  echo "warn: nenhum diretório de skills encontrado em $SOURCE_REPO" >&2
  exit 0
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
INBOX="$REPO_ROOT/.inbox"
mkdir -p "$INBOX"

# Padrões de exclusão (skills instaladas via app — não copiar)
SKIP_REGEX='^(compozy|cy-|skeeper)'

NEW=0
DUP=0
CONFLICT=0
SKIPPED=0

echo "→ Importando de $SKILLS_DIR (label: $SOURCE_LABEL)"

for skill_dir in "$SKILLS_DIR"/*/; do
  [[ -d "$skill_dir" ]] || continue
  name=$(basename "$skill_dir")

  # Resolve symlinks (vortex usa symlinks de .claude/skills -> .agents/skills)
  real_dir=$(cd "$skill_dir" && pwd -P)

  if [[ "$name" =~ $SKIP_REGEX ]]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  if [[ ! -f "$real_dir/SKILL.md" ]]; then
    echo "  skip $name (sem SKILL.md)"
    continue
  fi

  target="$INBOX/$name"
  sources_file="$target/_sources.txt"

  # Helper para anotar origem sem duplicar
  track_source() {
    local label="$1"
    touch "$sources_file"
    grep -qxF "$label" "$sources_file" || echo "$label" >> "$sources_file"
  }

  if [[ ! -d "$target" ]]; then
    # Primeira vez vendo essa skill
    mkdir -p "$target"
    cp -R "$real_dir/." "$target/"
    rm -f "$target/_sources.txt"
    track_source "$SOURCE_LABEL"
    NEW=$((NEW + 1))
  else
    # Já existe — compara SKILL.md
    if cmp -s "$real_dir/SKILL.md" "$target/SKILL.md"; then
      track_source "$SOURCE_LABEL"
      DUP=$((DUP + 1))
    else
      # Divergente — salva versão alternativa
      cp "$real_dir/SKILL.md" "$target/SKILL.md.$SOURCE_LABEL"
      track_source "$SOURCE_LABEL (conflict)"
      CONFLICT=$((CONFLICT + 1))
      echo "  ⚠ conflito: $name (versão salva em SKILL.md.$SOURCE_LABEL)"
    fi
  fi
done

echo ""
echo "✓ $SOURCE_LABEL: $NEW novas, $DUP idênticas, $CONFLICT conflitos, $SKIPPED puladas (compozy/cy/skeeper)"
