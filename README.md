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

# Install the recommended development skill set
bunx skills add marcioaltoe/skills/skills/dev-base-skills -g
bunx skills add marcioaltoe/skills/skills/write-common -g

# Install a single skill
bunx skills add marcioaltoe/skills/skills/dev-base-skills --skill commit-style -g

# List available skills without installing
bunx skills add marcioaltoe/skills --list
```

Without `-g`, skills are installed in the current project at `.claude/skills/`.

## Recommended Skill Sets

Use multiple installable folders to compose a working context. Skills should have one canonical home; do not duplicate folders just to build a context.

### Development

Install the base development skills plus common writing/documentation skills:

```bash
bunx skills add marcioaltoe/skills/skills/dev-base-skills -g
bunx skills add marcioaltoe/skills/skills/write-common -g
```

### LLM Wiki

Install the LLM Wiki core workflow, shared writing skills, MCP-backed source tools, and local wiki tools:

```bash
bunx skills add marcioaltoe/skills/skills/llm-wiki/core -g
bunx skills add marcioaltoe/skills/skills/write-common -g
bunx skills add marcioaltoe/skills/skills/llm-wiki/mcps -g
bunx skills add marcioaltoe/skills/skills/llm-wiki/tools -g
```

## Collections

Skills are grouped by installable context. The domain classification still lives in each skill's `metadata.category` frontmatter field.

| Collection                                     | Purpose                                                    |
| ---------------------------------------------- | ---------------------------------------------------------- |
| [`dev-base-skills/`](./skills/dev-base-skills) | Base development skills used across active projects.       |
| [`dev-specialized/`](./skills/dev-specialized) | Specialized tools, frameworks, APIs, and integrations.     |
| [`design-product/`](./skills/design-product)   | Product design, Figma, interface, and visual asset skills. |
| [`write-marketing/`](./skills/write-marketing) | Marketing, GTM, sales, positioning, and launch skills.     |
| [`write-common/`](./skills/write-common)       | General writing, technical docs, communication, and RFCs.  |
| [`productivity/`](./skills/productivity)       | Document, office, diagrams, and knowledge tools.           |
| [`llm-wiki/core/`](./skills/llm-wiki/core)     | Core Karpathy-style LLM Wiki workflows.                    |
| [`llm-wiki/mcps/`](./skills/llm-wiki/mcps)     | MCP-backed search, scrape, and source capture helpers.     |
| [`llm-wiki/tools/`](./skills/llm-wiki/tools)   | Obsidian, QMD, and Mermaid tools for LLM Wiki work.        |
| [`skills-build/`](./skills/skills-build)       | Skills and subagent creation, evaluation, and improvement. |
| [`ai-media/`](./skills/ai-media)               | AI image generation and image prompt creation.             |

The [`llm-wiki/`](./skills/llm-wiki) folder is a namespace with a README and nested installable sets. Prefer composing several folders with `bunx skills add` over copying or symlinking the same skill into multiple contexts.

## Documentation skills

Two evidence-first documentation skills generate one selected Markdown document at a time instead of creating a full docs set by default:

- [`backend-docs`](./skills/dev-base-skills/backend-docs): document backend architecture, bounded contexts, onboarding, API contracts, or backend gaps.

  ```text
  --mode <architecture|onboarding|gap-analysis|api-contracts|bounded-context> --backendPath <path-or-scope> [--outputPath <doc.md>]
  ```

- [`frontend-docs`](./skills/dev-base-skills/frontend-docs): document frontend architecture, onboarding, route/data contracts, component systems, DESIGN.md compliance, or UI gaps.

  ```text
  --mode <architecture|onboarding|gap-analysis|route-data|component-system> --frontendPath <path-or-scope> [--outputPath <doc.md>]
  ```

Install examples:

```bash
bunx skills add marcioaltoe/skills/skills/dev-base-skills --skill backend-docs -g
bunx skills add marcioaltoe/skills/skills/dev-base-skills --skill frontend-docs -g
```

## Anatomy of a skill

Each skill lives under an installable set, usually `skills/<collection>/<skill-name>/SKILL.md`. Nested sets are also valid when a context needs clear subgroups, for example `skills/llm-wiki/core/<skill-name>/SKILL.md`.

Every `SKILL.md` starts with YAML frontmatter the CLI uses to discover and route it:

```markdown
---
name: commit-style
description: Creates commit messages following Conventional Commits — use when the user asks "commit", "git commit", or after changes are ready to be recorded.
metadata:
  category: git
  tags: [git, commits, conventional-commits]
  version: 0.1.0
  author: marcioaltoe
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
2. Add your skill under the appropriate installable set, such as `skills/<collection>/` or `skills/<context>/<set>/` (see [AGENTS.md](./AGENTS.md) for the structure and frontmatter contract).
3. Write all repository content in English, including docs, examples, prompts, comments, templates, and skill bodies.
4. Test locally: `bunx skills add ./skills/<collection>/<your-skill> -g` or `bunx skills add ./skills/<context>/<set>/<your-skill> -g`.
5. Format before committing: `make fmt` (uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter/) — Markdown, JS, TS, JSON).
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(dev-base-skills): add my-skill`.
7. Open a pull request.

CI runs `npx skills add . --list` on every PR to validate frontmatter. If it fails, double-check `name`, `description`, and YAML indentation.

## License

MIT — see [LICENSE](./LICENSE).
