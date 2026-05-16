#!/usr/bin/env bash
# Move skills de .inbox/ para skills/<categoria>/<name>/ conforme mapeamento.
# Descarta postgres-drizzle (duplicata idêntica de drizzle-postgres).

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
INBOX="$REPO_ROOT/.inbox"
SKILLS="$REPO_ROOT/skills"

if [[ ! -d "$INBOX" ]]; then
  echo "error: $INBOX não existe" >&2
  exit 1
fi

# Mapeamento: <categoria>:<skill-name>
MAPPING=$(cat <<'EOF'
architecture:api-design-principles
architecture:app-renderer-systems
architecture:architectural-analysis
architecture:architecture-diagram
architecture:coupling-analysis
architecture:decomposition-planning-roadmap
architecture:domain-analysis
architecture:domain-identification-grouping
architecture:legacy-migration-planner
architecture:modular-decomposition
architecture:modular-design-principles
architecture:tactical-ddd
ai:agent-browser
ai:agent-md-refactor
ai:ai-sdk
ai:autoresearch
ai:brainstorming
ai:context7
ai:deep-research
ai:exa-web-search-free
ai:find-skills
ai:firecrawl
ai:mastra
ai:nano-banana-pro
ai:nano-banana-prompting
ai:pal
ai:skill-best-practices
ai:skill-creator
ai:skill-writer
ai:to-prompt
backend:better-auth-best-practices
backend:better-auth-organization-best-practices
backend:centrifugo
backend:cloudflare
backend:drizzle-orm
backend:drizzle-postgres
backend:drizzle-safe-migrations
backend:evolution-api
backend:hono
backend:inngest
backend:organization-best-practices
backend:stripe-best-practices
backend:stripe-integration
backend:stripe-subscriptions
backend:stripe-webhooks
backend:workflow
backend:wrangler
backend:zod
design:bencium-innovative-ux-designer
design:canvas-design
design:design-spec-extraction
design:figma-design
design:frontend-design
design:interface-design
design:landing-page-design
design:mermaid-diagrams
design:theme-factory
design:ui-ux-pro-max
design:web-design-guidelines
development:caveman
development:council
development:creating-spec
development:es-toolkit
development:executing-plans
development:extreme-software-optimization
development:find-rules
development:golang-pro
development:lesson-learned
development:monorepo-management
development:no-workarounds
development:refactoring-analysis
development:requirements-clarity
development:ship-learn-next
development:systematic-debugging
development:typescript-advanced
development:verification-before-completion
development:vite
devops:helm-chart-scaffolding
frontend:building-components
frontend:react
frontend:shadcn
frontend:shadcn-ui
frontend:storybook
frontend:storybook-stories
frontend:tailwindcss
frontend:tanstack
frontend:tanstack-query
frontend:tanstack-query-best-practices
frontend:tanstack-router
frontend:tanstack-router-best-practices
frontend:tanstack-table
frontend:tech-logos
frontend:ui-craft
frontend:vercel-composition-patterns
frontend:vercel-react-best-practices
frontend:zustand
git:git-rebase
marketing:alex-hormozi-pitch
marketing:brand-guidelines
marketing:brand-storytelling
marketing:business-analyst
marketing:copywriting
marketing:fundraising
marketing:game-changing-features
marketing:hormozi-ad-factory
marketing:pitch-deck
marketing:pitch-deck-visuals
marketing:pitch-gen
marketing:sales-methodology-implementer
marketing:startup-validator
testing:adversarial-review
testing:qa-execution
testing:qa-report
testing:systematic-qa
testing:test-antipatterns
testing:testing-anti-patterns
testing:testing-boss
testing:vitest
tools:ai-pdf-builder
tools:docx
tools:obsidian-bases
tools:obsidian-cli
tools:obsidian-markdown
tools:pdf
tools:pptx
tools:pptx-creator
tools:qmd
tools:xlsx
writing:content-research-writer
writing:crafting-effective-readmes
writing:doc-coauthoring
writing:humanizer
writing:professional-communication
writing:writing-clearly-and-concisely
EOF
)

DISCARD=(
  "postgres-drizzle"
)

# Cria categorias novas (idempotente)
for cat in architecture marketing design tools; do
  mkdir -p "$SKILLS/$cat"
done

MOVED=0
SKIPPED=0
DISCARDED=0

# Descarta primeiro
for skill in "${DISCARD[@]}"; do
  if [[ -d "$INBOX/$skill" ]]; then
    rm -rf "$INBOX/$skill"
    DISCARDED=$((DISCARDED + 1))
    echo "  ✗ descartado: $skill (duplicata)"
  fi
done

# Move conforme mapeamento
while IFS=: read -r category skill; do
  [[ -z "$category" || -z "$skill" ]] && continue
  src="$INBOX/$skill"
  dst_dir="$SKILLS/$category"
  dst="$dst_dir/$skill"

  if [[ ! -d "$src" ]]; then
    echo "  ? não encontrado em .inbox: $skill"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  if [[ -d "$dst" ]]; then
    echo "  ! já existe: $dst (pulando)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  mkdir -p "$dst_dir"
  # Remove .gitkeep se a categoria estava vazia
  rm -f "$dst_dir/.gitkeep"

  mv "$src" "$dst"
  # Remove _sources.txt (era só pra rastreio durante a triagem)
  rm -f "$dst/_sources.txt"

  MOVED=$((MOVED + 1))
done <<< "$MAPPING"

# Skills que sobraram no .inbox (não mapeadas)
REMAINING=$(find "$INBOX" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')

echo ""
echo "✓ movidas: $MOVED, descartadas: $DISCARDED, puladas: $SKIPPED, restantes em .inbox: $REMAINING"

if [[ "$REMAINING" -gt 0 ]]; then
  echo ""
  echo "skills não classificadas (revise manualmente):"
  find "$INBOX" -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sed 's/^/  - /'
fi
