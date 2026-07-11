SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help skills-link skills-update setup-list setups-check registry-check setup list fmt fmt-check dev

help: ## Show available commands
	@awk 'BEGIN { FS = ":.*## " } /^##@/ { printf "\n%s\n", substr($$0, 5) } /^[a-zA-Z0-9_-]+:.*## / { printf "  make %-15s # %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

##@ Agent Skills

skills-link: ## Recreate .claude/skills symlinks from .agents/skills
	@set -euo pipefail; \
	mkdir -p .claude/skills; \
	find .claude/skills -mindepth 1 -maxdepth 1 -exec rm -rf {} +; \
	count=0; \
	for skill in .agents/skills/*; do \
		[[ -e "$$skill" ]] || continue; \
		name="$$(basename "$$skill")"; \
		ln -s "../../.agents/skills/$$name" ".claude/skills/$$name"; \
		count="$$((count + 1))"; \
	done; \
	echo "Linked $$count skills from .agents/skills -> .claude/skills"

skills-update: ## Install missing skills and update existing ones to latest (reads skills-lock.json)
	@bunx skills experimental_install
	@bunx skills update -p -y
	@changed="$$(git ls-files --modified --others --exclude-standard -- '*.md' '*.json' '*.js' '*.mjs' '*.ts')"; \
	if [[ -n "$$changed" ]]; then npx --yes oxfmt@latest $$changed; else echo "No changed files to format"; fi

setup-list: ## List available setup presets
	@./install.sh --list

setups-check: ## Validate setup preset files
	@node scripts/check-setups.mjs

registry-check: ## Validate registry, lockfile, and frontmatter consistency
	@node scripts/check-registry.mjs

setup: ## Install one setup preset, e.g. make setup SETUP=typescript-bun
	@test -n "$(SETUP)" || { echo "SETUP is required, e.g. make setup SETUP=typescript-bun"; exit 1; }
	@./install.sh "$(SETUP)"

list: ## List skills discovered in the repo
	@npx --yes skills add . --list

fmt: ## Format md/js/ts/json files with oxfmt
	@npx --yes oxfmt@latest .

fmt-check: ## Check formatting without writing
	@npx --yes oxfmt@latest --check .

dev: ## Start the development server
	@cd web && bun run dev
