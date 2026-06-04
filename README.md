# marcioaltoe/skills

[![validate](https://github.com/marcioaltoe/skills/actions/workflows/ci-validate.yml/badge.svg)](https://github.com/marcioaltoe/skills/actions/workflows/ci-validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A curated collection of [agent skills](https://github.com/vercel-labs/skills) for Claude Code and other compatible agents. Each skill is a focused set of instructions — frontmatter plus a `SKILL.md` body — that an agent loads on demand to extend its capabilities for a specific task.

## Requirements

- Node.js 18+ (or Bun). The examples below use `bunx`; `npx` works the same way.
- A skills-aware agent (e.g. [Claude Code](https://claude.com/claude-code)).

## Installation

Install via the [`skills`](https://github.com/vercel-labs/skills) CLI (published on npm).

```bash
# Install all skills globally
bunx skills add marcioaltoe/skills -g

# Install the recommended TypeScript full-stack skill set
bunx skills add marcioaltoe/skills/skills/dev-core -g
bunx skills add marcioaltoe/skills/skills/dev-frontend -g
bunx skills add marcioaltoe/skills/skills/dev-backend -g
bunx skills add marcioaltoe/skills/skills/dev-methods -g
bunx skills add marcioaltoe/skills/skills/writing -g

# Add specialized integrations only when the project needs them
bunx skills add marcioaltoe/skills/skills/dev-specialized -g

# Install a single skill
bunx skills add marcioaltoe/skills/skills/dev-core --skill commit-style -g

# List available skills without installing
bunx skills add marcioaltoe/skills --list
```

Without `-g`, skills are installed in the current project at `.claude/skills/`.

## Recommended Install Sets

Use multiple installable folders to compose a working context. Skills should have one canonical home; do not duplicate folders just to build a context.

### Standard Monorepo: Backend + Frontend

Use for TypeScript monorepos with shared packages, frontend routes and components, backend APIs, database/auth work, and regular architecture or QA tasks.

```bash
bunx skills add marcioaltoe/skills/skills/dev-core -g
bunx skills add marcioaltoe/skills/skills/dev-frontend -g
bunx skills add marcioaltoe/skills/skills/dev-backend -g
bunx skills add marcioaltoe/skills/skills/dev-methods -g
bunx skills add marcioaltoe/skills/skills/writing -g
```

Add specialized integrations only when the project uses them:

```bash
bunx skills add marcioaltoe/skills/skills/dev-specialized -g
```

### Backend-Only Repos

Use for APIs, workers, database schemas, auth, migrations, platform services, and backend documentation.

```bash
bunx skills add marcioaltoe/skills/skills/dev-core -g
bunx skills add marcioaltoe/skills/skills/dev-backend -g
bunx skills add marcioaltoe/skills/skills/dev-methods -g
bunx skills add marcioaltoe/skills/skills/writing -g
```

Add `dev-specialized` when the backend uses AI SDK, Mastra, Inngest, Sentry, Stripe, Centrifugo, Evolution API, or similar project-specific services.

### Documents, Status, and Content Repos

Use for repos that primarily hold documentation, status reports, operating notes, proposals, content drafts, or office artifacts.

```bash
bunx skills add marcioaltoe/skills/skills/writing -g
bunx skills add marcioaltoe/skills/skills/office-docs -g
bunx skills add marcioaltoe/skills/skills/research-tools -g
```

Add marketing skills only when the repo owns GTM, positioning, sales, launch, or SEO content:

```bash
bunx skills add marcioaltoe/skills/skills/marketing -g
```

### LLM Wiki Repos

Use for Karpathy-style LLM Wiki repos that capture source-backed notes, synthesize evidence, and publish structured knowledge in Markdown, Obsidian, QMD, or Mermaid formats.

```bash
bunx skills add marcioaltoe/skills/skills/llm-wiki -g
bunx skills add marcioaltoe/skills/skills/writing -g
bunx skills add marcioaltoe/skills/skills/research-tools -g
bunx skills add marcioaltoe/skills/skills/knowledge-tools -g
```

## Collections

Skills are grouped by installable context. The domain classification still lives in each skill's `metadata.category` frontmatter field.

| Collection                                     | Purpose                                                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`dev-core/`](./skills/dev-core)               | Core development workflow, tooling, testing, and guardrails.                                                           |
| [`dev-frontend/`](./skills/dev-frontend)       | React, UI, routing, styling, accessibility, and web quality.                                                           |
| [`dev-backend/`](./skills/dev-backend)         | APIs, auth, databases, migrations, and platform services.                                                              |
| [`dev-methods/`](./skills/dev-methods)         | Architecture, planning, QA, security, DDD, and analysis, plus PRD, issue breakdown, and triage workflows.              |
| [`dev-specialized/`](./skills/dev-specialized) | AI SDKs, agent frameworks, jobs, observability, and APIs.                                                              |
| [`product-design/`](./skills/product-design)   | Product design, Figma, interface, and visual asset skills.                                                             |
| [`marketing/`](./skills/marketing)             | Marketing, GTM, sales, positioning, and launch skills.                                                                 |
| [`writing/`](./skills/writing)                 | Technical and general writing: docs, READMEs, PRDs, tech specs, ADRs, issues, PR descriptions, and team communication. |
| [`office-docs/`](./skills/office-docs)         | Office documents, PDFs, presentations, and spreadsheets.                                                               |
| [`learning/`](./skills/learning)               | Deliberate practice, learning plans, and skill development.                                                            |
| [`research-tools/`](./skills/research-tools)   | Web research, search, scrape, and source capture helpers.                                                              |
| [`llm-wiki/`](./skills/llm-wiki)               | Core Karpathy-style LLM Wiki workflows.                                                                                |
| [`knowledge-tools/`](./skills/knowledge-tools) | Obsidian, QMD, and Mermaid tools for knowledge work.                                                                   |
| [`skill-authoring/`](./skills/skill-authoring) | Skill creation, evaluation, packaging, and improvement.                                                                |

Prefer composing top-level folders with `bunx skills add` over copying, symlinking, or nesting the same skill inside a context folder.

## Documentation skills

Two evidence-first documentation skills generate one selected Markdown document at a time instead of creating a full docs set by default:

- [`backend-docs`](./skills/dev-backend/backend-docs): document backend architecture, bounded contexts, onboarding, API contracts, or backend gaps.

  ```text
  --mode <architecture|onboarding|gap-analysis|api-contracts|bounded-context> --backendPath <path-or-scope> [--outputPath <doc.md>]
  ```

- [`frontend-docs`](./skills/dev-frontend/frontend-docs): document frontend architecture, onboarding, route/data contracts, component systems, DESIGN.md compliance, or UI gaps.

  ```text
  --mode <architecture|onboarding|gap-analysis|route-data|component-system> --frontendPath <path-or-scope> [--outputPath <doc.md>]
  ```

Install examples:

```bash
bunx skills add marcioaltoe/skills/skills/dev-backend --skill backend-docs -g
bunx skills add marcioaltoe/skills/skills/dev-frontend --skill frontend-docs -g
```

## Anatomy of a skill

Each skill lives under an installable set, usually `skills/<collection>/<skill-name>/SKILL.md`. Use top-level collection folders for reusable sets such as `research-tools` and `knowledge-tools`.

Every `SKILL.md` starts with YAML frontmatter the CLI uses to discover and route it:

```markdown
---
name: commit-style
description: Creates commit messages following Conventional Commits — use when the user asks "commit", "git commit", or after changes are ready to be recorded.
metadata:
  category: git
  tags: [git, commits, conventional-commits]
  version: 0.1.0
  author: Marcio Altoé
---

# Commit Style

Short paragraph explaining the skill's purpose.

## When to use

- Scenario 1
- Scenario 2

## How to apply

Concrete, imperative steps the agent will follow literally.
```

The `description` is the most important field — agents read it to decide whether to load the skill. See [AGENTS.md](./AGENTS.md) for full conventions.

## Contributing

Contributions are welcome.

1. Fork the repo and create a branch.
2. Add your skill under the appropriate installable set, such as `skills/<collection>/` (see [AGENTS.md](./AGENTS.md) for the structure and frontmatter contract).
3. Write all repository content in English, including docs, examples, prompts, comments, templates, and skill bodies.
4. Test locally: `bunx skills add ./skills/<collection>/<your-skill> -g`, then confirm the catalog parses with `make list`.
5. Format before committing: `make fmt` (uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter/) — Markdown, JS, TS, JSON).
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(dev-core): add my-skill`.
7. Open a pull request.

CI runs `npx skills add . --list` on every PR to validate frontmatter. If it fails, double-check `name`, `description`, and YAML indentation.

## License

MIT — see [LICENSE](./LICENSE).
