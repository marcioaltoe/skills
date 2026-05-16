SHELL := /bin/bash
.DEFAULT_GOAL := help

# Stage variables (passed inline: make branch NAME=foo)
NAME ?=
TITLE ?=

.PHONY: help branch pr review merge install-hooks list

help: ## Show available commands
	@echo "Workflow:"
	@echo "  1. make branch NAME=<slug>          # create ma/<slug> from updated main"
	@echo "  2. <edit and commit normally>"
	@echo "  3. make pr [TITLE=\"...\"]            # push + open PR with grouped body"
	@echo "  4. make review                      # comment @claude on the PR for review"
	@echo "  5. make merge                       # squash merge + delete branch + back to main"
	@echo ""
	@echo "Other:"
	@echo "  make list                           # list skills discovered in the repo"
	@echo "  make install-hooks                  # install commit-msg hook (conventional commits)"
	@echo ""
	@echo "Notes:"
	@echo "  - Branches always start with the ma/ prefix"
	@echo "  - Commits and PR titles follow Conventional Commits"
	@echo "  - PR body is generated from commits (Features / Fixes / Refactors)"

branch: ## Create branch ma/<NAME> from updated main
	@./scripts/new-branch.sh "$(NAME)"

pr: ## Push + open PR with auto-generated body
	@./scripts/open-pr.sh "$(TITLE)"

review: ## Trigger Claude review on the current PR
	@./scripts/review-pr.sh

merge: ## Squash merge the current PR + delete branch + back to main
	@./scripts/squash-merge.sh

install-hooks: ## Install commit-msg hook (Conventional Commits)
	@./scripts/install-hooks.sh

list: ## List skills discovered in the repo
	@npx --yes skills add . --list
