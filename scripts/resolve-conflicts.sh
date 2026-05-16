#!/usr/bin/env bash
# Resolve conflitos em .inbox/ pelo último timestamp:
# para cada skill que tem SKILL.md.<repo>, identifica o SKILL.md mais recente
# entre todos os repos que a continham, copia como SKILL.md canônica,
# e apaga os arquivos de conflito.

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
INBOX="$REPO_ROOT/.inbox"
DEV_DIR="$HOME/dev"

if [[ ! -d "$INBOX" ]]; then
  echo "error: $INBOX não existe" >&2
  exit 1
fi

# stat -f para macOS, stat -c para Linux
get_mtime() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    stat -f "%m" "$1"
  else
    stat -c "%Y" "$1"
  fi
}

RESOLVED=0
CHECKED=0

for skill_dir in "$INBOX"/*/; do
  [[ -d "$skill_dir" ]] || continue
  name=$(basename "$skill_dir")

  # Só processa se tem ao menos um SKILL.md.<repo>
  conflict_files=("$skill_dir"SKILL.md.*)
  [[ -f "${conflict_files[0]}" ]] || continue

  CHECKED=$((CHECKED + 1))

  # Coleta candidatos: (mtime, repo, source-path)
  best_mtime=0
  best_repo=""
  best_path=""

  # Inclui repos do _sources.txt para considerar quem ganhou inicialmente
  if [[ -f "$skill_dir/_sources.txt" ]]; then
    while IFS= read -r line; do
      # Remove " (conflict)" e qualquer trailing whitespace
      repo=$(echo "$line" | sed 's/ (conflict)$//' | sed 's/[[:space:]]*$//')
      [[ -n "$repo" ]] || continue

      # Procura SKILL.md no source
      for candidate in "$DEV_DIR/$repo/.agents/skills/$name/SKILL.md" "$DEV_DIR/$repo/.claude/skills/$name/SKILL.md"; do
        if [[ -f "$candidate" ]]; then
          mt=$(get_mtime "$candidate")
          if [[ $mt -gt $best_mtime ]]; then
            best_mtime=$mt
            best_repo=$repo
            best_path=$candidate
          fi
          break
        fi
      done
    done < "$skill_dir/_sources.txt"
  fi

  if [[ -z "$best_path" ]]; then
    echo "  ⚠ $name: não consegui localizar nenhum source — mantendo state atual"
    continue
  fi

  # Substitui SKILL.md pelo vencedor
  cp "$best_path" "$skill_dir/SKILL.md"

  # Apaga arquivos de conflito
  rm -f "$skill_dir"SKILL.md.*

  # Anota o vencedor em _sources.txt (limpa entradas (conflict))
  sources_file="$skill_dir/_sources.txt"
  tmp=$(mktemp)
  {
    sed 's/ (conflict)$//' "$sources_file" | sort -u
    echo "→ winner: $best_repo"
  } > "$tmp"
  mv "$tmp" "$sources_file"

  RESOLVED=$((RESOLVED + 1))
done

echo ""
echo "✓ verificadas: $CHECKED skills com conflito, resolvidas: $RESOLVED"
