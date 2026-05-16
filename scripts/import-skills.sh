#!/usr/bin/env bash
# Imports skills from a .agents/skills (or .claude/skills) directory into .inbox/
# with deduplication by SKILL.md hash and source tracking.
#
# usage: scripts/import-skills.sh <source-repo-path> [source-label]
#   <source-repo-path>  path to the repo (looks for .agents/skills/ and .claude/skills/)
#   [source-label]      friendly name (default: basename of the path)

set -euo pipefail

SOURCE_REPO="${1:-}"
SOURCE_LABEL="${2:-$(basename "${SOURCE_REPO}")}"

if [[ -z "$SOURCE_REPO" ]]; then
  echo "usage: $0 <source-repo-path> [source-label]" >&2
  exit 1
fi

if [[ ! -d "$SOURCE_REPO" ]]; then
  echo "error: $SOURCE_REPO does not exist" >&2
  exit 1
fi

# Look for the skills directory (preferring .agents/skills, which is the real source
# when .claude/skills is only symlinks)
SKILLS_DIR=""
for candidate in ".agents/skills" ".claude/skills"; do
  if [[ -d "$SOURCE_REPO/$candidate" ]]; then
    SKILLS_DIR="$SOURCE_REPO/$candidate"
    break
  fi
done

if [[ -z "$SKILLS_DIR" ]]; then
  echo "warn: no skills directory found in $SOURCE_REPO" >&2
  exit 0
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
INBOX="$REPO_ROOT/.inbox"
mkdir -p "$INBOX"

# Exclusion patterns (skills installed via app — do not copy)
SKIP_REGEX='^(compozy|cy-|skeeper)'

NEW=0
DUP=0
CONFLICT=0
SKIPPED=0

echo "→ Importing from $SKILLS_DIR (label: $SOURCE_LABEL)"

for skill_dir in "$SKILLS_DIR"/*/; do
  [[ -d "$skill_dir" ]] || continue
  name=$(basename "$skill_dir")

  # Resolve symlinks (vortex uses symlinks from .claude/skills -> .agents/skills)
  real_dir=$(cd "$skill_dir" && pwd -P)

  if [[ "$name" =~ $SKIP_REGEX ]]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  if [[ ! -f "$real_dir/SKILL.md" ]]; then
    echo "  skip $name (no SKILL.md)"
    continue
  fi

  target="$INBOX/$name"
  sources_file="$target/_sources.txt"

  # Helper to annotate source without duplicating
  track_source() {
    local label="$1"
    touch "$sources_file"
    grep -qxF "$label" "$sources_file" || echo "$label" >> "$sources_file"
  }

  if [[ ! -d "$target" ]]; then
    # First time seeing this skill
    mkdir -p "$target"
    cp -R "$real_dir/." "$target/"
    rm -f "$target/_sources.txt"
    track_source "$SOURCE_LABEL"
    NEW=$((NEW + 1))
  else
    # Already exists — compare SKILL.md
    if cmp -s "$real_dir/SKILL.md" "$target/SKILL.md"; then
      track_source "$SOURCE_LABEL"
      DUP=$((DUP + 1))
    else
      # Divergent — save alternative version
      cp "$real_dir/SKILL.md" "$target/SKILL.md.$SOURCE_LABEL"
      track_source "$SOURCE_LABEL (conflict)"
      CONFLICT=$((CONFLICT + 1))
      echo "  ⚠ conflict: $name (version saved as SKILL.md.$SOURCE_LABEL)"
    fi
  fi
done

echo ""
echo "✓ $SOURCE_LABEL: $NEW new, $DUP identical, $CONFLICT conflicts, $SKIPPED skipped (compozy/cy/skeeper)"
