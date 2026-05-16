SHELL := /bin/bash
.DEFAULT_GOAL := help

# Stage variables (passed inline: make branch NAME=foo)
NAME ?=
TITLE ?=

.PHONY: help branch pr review merge install-hooks list

help: ## Mostra os comandos disponíveis
	@echo "Workflow:"
	@echo "  1. make branch NAME=<slug>          # cria ma/<slug> a partir de main atualizada"
	@echo "  2. <edita e commita normalmente>"
	@echo "  3. make pr [TITLE=\"...\"]            # push + abre PR com body agrupado"
	@echo "  4. make review                      # comenta @claude na PR para review"
	@echo "  5. make merge                       # squash merge + delete branch + volta pra main"
	@echo ""
	@echo "Outros:"
	@echo "  make list                           # lista skills descobertas no repo"
	@echo "  make install-hooks                  # instala commit-msg hook (conventional commits)"
	@echo ""
	@echo "Notas:"
	@echo "  - Branches sempre começam com prefixo ma/"
	@echo "  - Commits e PR titles seguem Conventional Commits"
	@echo "  - PR body é gerado a partir dos commits (Features / Fixes / Refactors)"

branch: ## Cria branch ma/<NAME> a partir de main atualizada
	@./scripts/new-branch.sh "$(NAME)"

pr: ## Push + abre PR com body auto-gerado
	@./scripts/open-pr.sh "$(TITLE)"

review: ## Dispara review do Claude na PR atual
	@./scripts/review-pr.sh

merge: ## Squash merge da PR atual + delete branch + volta pra main
	@./scripts/squash-merge.sh

install-hooks: ## Instala commit-msg hook (Conventional Commits)
	@./scripts/install-hooks.sh

list: ## Lista skills descobertas no repo
	@npx --yes skills add . --list
