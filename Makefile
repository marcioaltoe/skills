SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help skills-link skills-update setup-list setup list marketplace marketplace-check fmt fmt-check dev

help: ## Show available commands
	@echo "  make list                           # list skills discovered in the repo"
	@echo "  make skills-link                    # recreate .claude/skills symlinks"
	@echo "  make skills-update                  # install and update skills from lockfile"
	@echo "  make setup-list                     # list available setup presets"
	@echo "  make setup SETUP=fullstack          # install one setup preset into .agents/skills"
	@echo "  make marketplace                    # regenerate .claude-plugin/marketplace.json from the registry"
	@echo "  make marketplace-check              # fail if marketplace.json is out of sync with the registry"
	@echo "  make fmt                            # format md/js/ts/json files with oxfmt"
	@echo "  make fmt-check                      # check formatting without writing"
	@echo "  make dev                            # start the development server"

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
	@$(MAKE) fmt

setup-list: ## List available setup presets
	@./install.sh --list

setup: ## Install one setup preset, e.g. make setup SETUP=fullstack
	@test -n "$(SETUP)" || { echo "SETUP is required, e.g. make setup SETUP=fullstack"; exit 1; }
	@./install.sh "$(SETUP)"

list: ## List skills discovered in the repo
	@npx --yes skills add . --list

marketplace: ## Regenerate .claude-plugin/marketplace.json from skills-registry.json
	@node scripts/build-marketplace.mjs

marketplace-check: ## Fail if marketplace.json is out of sync with the registry
	@before="$$(shasum -a 256 .claude-plugin/marketplace.json | cut -d' ' -f1)"; \
	node scripts/build-marketplace.mjs; \
	after="$$(shasum -a 256 .claude-plugin/marketplace.json | cut -d' ' -f1)"; \
	[[ "$$before" == "$$after" ]] || \
		{ echo "marketplace.json is stale — run 'make marketplace' and commit the result"; exit 1; }

fmt: ## Format md/js/ts/json files with oxfmt
	@npx --yes oxfmt@latest .

fmt-check: ## Check formatting without writing
	@npx --yes oxfmt@latest --check .

dev: ## Start the development server
	@cd web && bun run dev
