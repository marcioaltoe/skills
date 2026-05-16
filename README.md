# marcioaltoe/skills

Personal collection of [agent skills](https://github.com/vercel-labs/skills) for Claude Code and other compatible agents. Each skill is a set of instructions that extends the agent's capabilities for specific tasks.

## Installation

Uses the [`skills`](https://github.com/vercel-labs/skills) CLI (already published on npm).

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

Without `-g`, it installs in the current project at `.claude/skills/`.

## Categories

| Category | Domain |
|---|---|
| [`ai/`](./skills/ai) | Claude API, prompts, agents, skills (meta), MCPs |
| [`architecture/`](./skills/architecture) | DDD, modular decomposition, system design |
| [`backend/`](./skills/backend) | APIs, databases, ORMs, auth, payments |
| [`design/`](./skills/design) | UI/UX, diagrams, design systems, theming |
| [`development/`](./skills/development) | TypeScript, Go, refactoring, general patterns |
| [`devops/`](./skills/devops) | Docker, CI/CD, deploy, infra |
| [`frontend/`](./skills/frontend) | React, TanStack, Tailwind, shadcn, Storybook |
| [`git/`](./skills/git) | PRs, rebase, commits, git workflows |
| [`marketing/`](./skills/marketing) | Pitch decks, copywriting, fundraising, sales |
| [`testing/`](./skills/testing) | Vitest, QA, anti-patterns, testing doctrines |
| [`tools/`](./skills/tools) | Obsidian, file formats, auxiliary MCPs |
| [`writing/`](./skills/writing) | Docs, READMEs, communication |

## Create a new skill

See [AGENTS.md](./AGENTS.md) for conventions and [Makefile](./Makefile) for the commands.

Flow:

```bash
# 1. Open a branch with the ma/ prefix
make branch NAME=add-my-skill

# 2. Create the structure (minimal frontmatter in AGENTS.md)
mkdir -p skills/development/my-skill
$EDITOR skills/development/my-skill/SKILL.md

# 3. Test locally
bunx skills add ./skills/development/my-skill -g

# 4. Commit (Conventional Commits)
git add skills/development/my-skill
git commit -m "feat(development): add my-skill"

# 5. Open PR + trigger Claude review
make pr
make review

# 6. After review is approved
make merge
```

Run `make help` to see all available targets.

## License

MIT — see [LICENSE](./LICENSE).
