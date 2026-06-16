#!/usr/bin/env bash
set -euo pipefail

repo=${SKILLS_REPO:-marcioaltoe/skills}
ref=${SKILLS_REF:-main}
dest=${SKILLS_DEST:-.agents/skills}
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
  --dest <path>      Install directory (default: .agents/skills)
  --repo <owner/repo>
                     Source repository (default: marcioaltoe/skills)
  --ref <ref>        Branch, tag, or commit to download (default: main)
  --dry-run          Print what would be installed
  -h, --help         Show this help

Examples:
  curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- fullstack
  curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- --list
  ./install.sh frontend --dest .agents/skills
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

command -v tar >/dev/null || error "tar is required"

download_to_file() {
  local url=$1
  local out=$2
  if command -v curl >/dev/null; then
    curl -fsSL "$url" -o "$out"
  elif command -v wget >/dev/null; then
    wget -qO "$out" "$url"
  else
    error "curl or wget is required"
  fi
}

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

tmp_dir=$(mktemp -d)
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

repo_root=""
if [[ $use_local -eq 1 ]]; then
  repo_root=$script_dir
else
  archive="$tmp_dir/repo.tar.gz"
  extract_dir="$tmp_dir/repo"
  mkdir -p "$extract_dir"
  info "Downloading $repo@$ref"
  download_to_file "https://github.com/$repo/archive/$ref.tar.gz" "$archive"
  tar -xzf "$archive" -C "$extract_dir"
  repo_root=$(find "$extract_dir" -mindepth 1 -maxdepth 1 -type d | head -n 1)
  [[ -n "$repo_root" ]] || error "failed to extract repository archive"
fi

setup_file="$setup.txt"
setup_content=$(read_setup_file "$setup_file") || error "setup not found: $setup"

case "$dest" in
  /*) dest_abs=$dest ;;
  *) dest_abs="$PWD/$dest" ;;
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

installed=0
while IFS= read -r line || [[ -n "$line" ]]; do
  line=${line%$'\r'}
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  is_safe_skill_path "$line" || error "unsafe skill path in $setup_file: $line"

  source_dir="$repo_root/$line"
  [[ -d "$source_dir" ]] || error "skill path not found: $line"
  skill_name=$(basename "$line")
  target_dir="$dest_abs/$skill_name"

  if [[ $dry_run -eq 1 ]]; then
    printf 'would install %-32s -> %s\n' "$skill_name" "$target_dir"
  else
    mkdir -p "$dest_abs"
    rm -rf "$target_dir"
    cp -R "$source_dir" "$target_dir"
    printf 'installed %-32s -> %s\n' "$skill_name" "$target_dir"
  fi
  installed=$((installed + 1))
done <<<"$setup_content"

if [[ $dry_run -eq 1 ]]; then
  success "Dry run complete: $installed skill(s) in setup '$setup'"
else
  success "Installed $installed skill(s) from setup '$setup' into $dest_abs"
fi
