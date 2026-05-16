# marcioaltoe/skills

[![validate](https://github.com/marcioaltoe/skills/actions/workflows/validate.yml/badge.svg)](https://github.com/marcioaltoe/skills/actions/workflows/validate.yml)
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

# Install a specific category
bunx skills add marcioaltoe/skills/skills/git -g

# Install a single skill
bunx skills add marcioaltoe/skills/skills/git --skill commit-style -g

# List available skills without installing
bunx skills add marcioaltoe/skills --list
```

Without `-g`, skills are installed in the current project at `.claude/skills/`.

## Categories

| Category                                 | Domain                                           |
| ---------------------------------------- | ------------------------------------------------ |
| [`ai/`](./skills/ai)                     | Claude API, prompts, agents, skills (meta), MCPs |
| [`architecture/`](./skills/architecture) | DDD, modular decomposition, system design        |
| [`backend/`](./skills/backend)           | APIs, databases, ORMs, auth, payments            |
| [`design/`](./skills/design)             | UI/UX, diagrams, design systems, theming         |
| [`development/`](./skills/development)   | TypeScript, Go, refactoring, general patterns    |
| [`devops/`](./skills/devops)             | Docker, CI/CD, deploy, infra                     |
| [`frontend/`](./skills/frontend)         | React, TanStack, Tailwind, shadcn, Storybook     |
| [`git/`](./skills/git)                   | PRs, rebase, commits, git workflows              |
| [`marketing/`](./skills/marketing)       | Pitch decks, copywriting, fundraising, sales     |
| [`testing/`](./skills/testing)           | Vitest, QA, anti-patterns, testing doctrines     |
| [`tools/`](./skills/tools)               | Obsidian, file formats, auxiliary MCPs           |
| [`writing/`](./skills/writing)           | Docs, READMEs, communication                     |

## Anatomy of a skill

Each skill lives at `skills/<category>/<skill-name>/SKILL.md` and starts with YAML frontmatter the CLI uses to discover and route it:

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
2. Add your skill under the appropriate `skills/<category>/` folder (see [AGENTS.md](./AGENTS.md) for the structure and frontmatter contract).
3. Test locally: `bunx skills add ./skills/<category>/<your-skill> -g`.
4. Format before committing: `make fmt` (uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter/) — Markdown, JS, TS, JSON).
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(development): add my-skill`.
6. Open a pull request.

CI runs `npx skills add . --list` on every PR to validate frontmatter. If it fails, double-check `name`, `description`, and YAML indentation.

## License

MIT — see [LICENSE](./LICENSE).
