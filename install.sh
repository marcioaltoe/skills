#!/usr/bin/env bash
set -euo pipefail

repo=${SKILLS_REPO:-marcioaltoe/skills}
ref=${SKILLS_REF:-main}
dest=${SKILLS_DEST:-.agents/skills}
agent=${SKILLS_AGENT:-universal}
setup=""
list=0
dry_run=0

red=""
green=""
dim=""
off=""
if [[ -t 1 ]]; then
  red=$'\033[0;31m'
  green=$'\033[0;32m'
  dim=$'\033[0;2m'
  off=$'\033[0m'
fi

error() {
  printf '%serror%s: %s\n' "$red" "$off" "$*" >&2
  exit 1
}

info() {
  printf '%s%s%s\n' "$dim" "$*" "$off"
}

success() {
  printf '%s%s%s\n' "$green" "$*" "$off"
}

usage() {
  cat <<'USAGE'
Usage:
  install.sh <setup> [options]
  install.sh --list

Options:
  --list             List available setups
  --agent <name>     Target agent for the skills CLI (default: universal)
  --dest <path>      Legacy option; only .agents/skills is supported
  --repo <owner/repo>
                     Source repository (default: marcioaltoe/skills)
  --ref <ref>        Branch, tag, or commit to download (default: main)
  --dry-run          Print what would be installed
  -h, --help         Show this help

Examples:
  curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- typescript-bun
  curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- --list
  ./install.sh go-cli-tui --agent universal
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --list)
      list=1
      shift
      ;;
    --dest)
      [[ $# -ge 2 ]] || error "--dest requires a path"
      dest=$2
      shift 2
      ;;
    --agent)
      [[ $# -ge 2 ]] || error "--agent requires an agent name"
      agent=$2
      shift 2
      ;;
    --repo)
      [[ $# -ge 2 ]] || error "--repo requires owner/repo"
      repo=$2
      shift 2
      ;;
    --ref)
      [[ $# -ge 2 ]] || error "--ref requires a branch, tag, or commit"
      ref=$2
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*)
      error "unknown option: $1"
      ;;
    *)
      [[ -z "$setup" ]] || error "only one setup can be installed at a time"
      setup=$1
      shift
      ;;
  esac
done

download_to_stdout() {
  local url=$1
  if command -v curl >/dev/null; then
    curl -fsSL "$url"
  elif command -v wget >/dev/null; then
    wget -qO- "$url"
  else
    error "curl or wget is required"
  fi
}

script_dir=""
if [[ -n "${BASH_SOURCE[0]:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fi

use_local=0
if [[ -n "$script_dir" && -d "$script_dir/skills" && -d "$script_dir/setups" ]]; then
  use_local=1
fi

raw_base="https://raw.githubusercontent.com/$repo/$ref"

read_setup_file() {
  local name=$1
  if [[ $use_local -eq 1 && -f "$script_dir/setups/$name" ]]; then
    cat "$script_dir/setups/$name"
  else
    download_to_stdout "$raw_base/setups/$name"
  fi
}

if [[ $list -eq 1 ]]; then
  read_setup_file "_index.txt" |
    while IFS='|' read -r slug description; do
      [[ -z "${slug:-}" || "$slug" == \#* ]] && continue
      printf '%-18s %s\n' "$slug" "$description"
    done
  exit 0
fi

[[ -n "$setup" ]] || {
  usage
  exit 1
}

setup_file="$setup.txt"
setup_content=$(read_setup_file "$setup_file") || error "setup not found: $setup"

case "$dest" in
  .agents/skills | ./.agents/skills | "$PWD/.agents/skills") ;;
  *)
    error "--dest is not supported by the skills CLI; use --agent instead"
    ;;
esac

is_safe_skill_path() {
  local path=$1
  [[ -n "$path" ]] || return 1
  [[ "$path" != /* ]] || return 1
  IFS='/' read -r -a parts <<<"$path"
  for part in "${parts[@]}"; do
    [[ -n "$part" ]] || return 1
    [[ "$part" != "." && "$part" != ".." ]] || return 1
  done
}

if command -v bunx >/dev/null; then
  skills_cmd=(bunx skills)
elif command -v npx >/dev/null; then
  skills_cmd=(npx --yes skills)
else
  error "bunx or npx is required to run the skills CLI"
fi

if [[ $use_local -eq 1 ]]; then
  skills_source=$script_dir
else
  skills_source="https://github.com/$repo/tree/$ref"
fi

has_skill() {
  local name=$1
  local existing
  [[ ${#skill_names[@]} -gt 0 ]] || return 1
  for existing in "${skill_names[@]}"; do
    [[ "$existing" == "$name" ]] && return 0
  done
  return 1
}

skill_names=()
while IFS= read -r line || [[ -n "$line" ]]; do
  line=${line%$'\r'}
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  is_safe_skill_path "$line" || error "unsafe skill path in $setup_file: $line"

  if [[ $use_local -eq 1 && ! -d "$script_dir/$line" ]]; then
    error "skill path not found: $line"
  fi

  skill_name=$(basename "$line")
  if ! has_skill "$skill_name"; then
    skill_names+=("$skill_name")
  fi
done <<<"$setup_content"

installed=${#skill_names[@]}
[[ $installed -gt 0 ]] || error "setup contains no skills: $setup"

args=(add "$skills_source" --agent "$agent" --copy -y)
for skill_name in "${skill_names[@]}"; do
  args+=(--skill "$skill_name")
done

if [[ $dry_run -eq 1 ]]; then
  for skill_name in "${skill_names[@]}"; do
    printf 'would install %-32s from %s\n' "$skill_name" "$skills_source"
  done
  success "Dry run complete: $installed skill(s) in setup '$setup'"
else
  info "Installing $installed skill(s) from setup '$setup' with the skills CLI"
  "${skills_cmd[@]}" "${args[@]}"
  success "Installed $installed skill(s) from setup '$setup'; skills-lock.json is managed by the skills CLI"
fi
