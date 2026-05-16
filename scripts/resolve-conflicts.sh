#!/usr/bin/env bash
# Resolves conflicts in .inbox/ by latest timestamp:
# for each skill that has SKILL.md.<repo>, identifies the most recent SKILL.md
# across all repos that contained it, copies it as the canonical SKILL.md,
# and deletes the conflict files.

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
INBOX="$REPO_ROOT/.inbox"
DEV_DIR="$HOME/dev"

if [[ ! -d "$INBOX" ]]; then
  echo "error: $INBOX does not exist" >&2
  exit 1
fi

# stat -f on macOS, stat -c on Linux
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

  # Only process if there is at least one SKILL.md.<repo>
  conflict_files=("$skill_dir"SKILL.md.*)
  [[ -f "${conflict_files[0]}" ]] || continue

  CHECKED=$((CHECKED + 1))

  # Collect candidates: (mtime, repo, source-path)
  best_mtime=0
  best_repo=""
  best_path=""

  # Include repos from _sources.txt to also consider the original winner
  if [[ -f "$skill_dir/_sources.txt" ]]; then
    while IFS= read -r line; do
      # Strip " (conflict)" and any trailing whitespace
      repo=$(echo "$line" | sed 's/ (conflict)$//' | sed 's/[[:space:]]*$//')
      [[ -n "$repo" ]] || continue

      # Look up SKILL.md in the source repo
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
    echo "  ⚠ $name: could not locate any source — keeping current state"
    continue
  fi

  # Replace SKILL.md with the winner
  cp "$best_path" "$skill_dir/SKILL.md"

  # Remove conflict files
  rm -f "$skill_dir"SKILL.md.*

  # Record the winner in _sources.txt (cleanup (conflict) entries)
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
echo "✓ checked: $CHECKED skills with conflicts, resolved: $RESOLVED"
