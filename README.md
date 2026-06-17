# marcioaltoe/skills

[![validate](https://github.com/marcioaltoe/skills/actions/workflows/ci-validate.yml/badge.svg)](https://github.com/marcioaltoe/skills/actions/workflows/ci-validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A curated collection of [agent skills](https://github.com/vercel-labs/skills) for Claude Code and other compatible agents. Each skill is a focused set of instructions — frontmatter plus a `SKILL.md` body — that an agent loads on demand to extend its capabilities for a specific task.

## Requirements

- A skills-aware agent, such as [Claude Code](https://claude.com/claude-code).
- macOS/Linux setup install: `bash`, `tar`, and `curl` or `wget`.
- Windows setup install: PowerShell 5+ or PowerShell 7.
- Node.js 18+ or Bun only if you use the `skills` CLI directly or run the web catalog locally.

## Installation

Use setup presets when preparing a project. They work without Node or Bun and copy the selected skills into `.agents/skills` by default.

```bash
# macOS or Linux
curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- saas
```

```powershell
# Windows PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) saas"
```

List presets with `curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- --list`.

For normal projects, start with the project-type setup: `saas`, `go-cli`, `go-cli-tui`, or `rust-cli`. These project setups include the base Grill -> PRD -> Issues -> Implement -> Review workflow, including `grill-with-docs` with `domain-modeling` for `CONTEXT.md`/ADR capture. Add `agent-automation` only when the project uses Linear, GitHub PR evidence, CodeRabbit, and Roundfix. Add `paperclip-hermes` only for the experimental Paperclip/Hermes orchestration flow.

See the [setup guide](https://marcioaltoe.github.io/skills/setups/) for every OS command and the skills included in each preset. Use the [web catalog](https://marcioaltoe.github.io/skills/) to search all skills by name, workflow phase, tag, or author.

If you already have Node or Bun, you can still install a workflow phase or a single skill with the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
bunx skills add marcioaltoe/skills/skills/05-implementation-loop
bunx skills add marcioaltoe/skills/skills/07-evidence-delivery --skill conventional-commits
bunx skills add marcioaltoe/skills --list
```

The root command `bunx skills add marcioaltoe/skills` opens a large grouped picker. Prefer the setup guide, the searchable catalog, a phase path, or `--skill <name>` for normal installs. [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json) is generated from `skills-registry.json` by `scripts/build-marketplace.mjs`; run `make marketplace` after editing the registry.

## Collections

Skills are grouped by workflow phase or domain collection — the folder under `skills/`. The author, domain tags, and upstream provenance live in [`skills-registry.json`](./skills-registry.json), not in frontmatter.

| Collection                                                   | Purpose                                                                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [`00-setup/`](./skills/00-setup)                             | Prepare repo conventions, local skills, setup workflows, and baseline agent guardrails.        |
| [`01-discovery/`](./skills/01-discovery)                     | Understand the problem, research context, question assumptions, and capture risks.             |
| [`02-planning/`](./skills/02-planning)                       | Turn discovery into product, GTM, communication, and PRD-level plans.                          |
| [`03-engineering-design/`](./skills/03-engineering-design)   | Produce technical design, architecture, security, UX, documentation, and design-system plans.  |
| [`04-issue-decomposition/`](./skills/04-issue-decomposition) | Break approved plans into clear, ordered, verifiable issues.                                   |
| [`05-implementation-loop/`](./skills/05-implementation-loop) | Execute code changes, framework work, tests, migrations, and implementation guardrails.        |
| [`06-review-repair/`](./skills/06-review-repair)             | Review diffs, debug failures, repair quality issues, resolve conflicts, and verify behavior.   |
| [`07-evidence-delivery/`](./skills/07-evidence-delivery)     | Write delivery evidence, commits, handoffs, docs, PDFs, decks, spreadsheets, and status notes. |
| [`08-release/`](./skills/08-release)                         | Release, deploy, observe, and operate production-facing services.                              |
| [`09-learning-loop/`](./skills/09-learning-loop)             | Improve skills, process, teaching material, evaluations, and harness behavior from feedback.   |
| [`10-marketing/`](./skills/10-marketing)                     | Create content, positioning, SEO, campaigns, sales material, GTM plans, and pitch assets.      |

Prefer composing top-level folders with `bunx skills add` over copying, symlinking, or nesting the same skill inside a context folder.

## Catalog

`web/` is a static, searchable catalog of every skill in this repo: a card grid with full-text search, filters by collection and tag, grouping by collection or author, and a copy-install button for any skill or a whole workflow phase. It is generated from [`skills-registry.json`](./skills-registry.json) plus each `SKILL.md` — no database.

All catalog metadata lives in one file, [`skills-registry.json`](./skills-registry.json) — one entry per skill with its `author`, curated domain tags, `local-path`, `collection`, and (for vendored skills) upstream `repo`/`path`/`ref`. Collection tells you where the skill fits in the workflow; tags tell you the domain or technology, such as `frontend`, `backend`, `react`, `security`, `marketing`, `documentation`, or `skill-authoring`. The catalog uses this classification by default; toggle "Include author tags" to also surface each skill's own frontmatter tags.

```bash
cd web && npm install && npm run dev   # http://localhost:4321
```

`.github/workflows/deploy-pages.yml` builds and publishes it to GitHub Pages on every push to `main` that touches `skills/**` or `web/**`. One-time setup: **Settings → Pages → Source = "GitHub Actions"**. See [web/README.md](./web/README.md) for details.

## Upstream sync

Many skills here are vendored from upstream repositories and then hardened locally. [`skills-registry.json`](./skills-registry.json) records each vendored skill's upstream origin (`repo`, `path`, `ref`); entries without a `repo` are authored locally and never synced. The local copy is always the source of truth — sync only reports upstream changes, it never overwrites local edits.

`scripts/sync-skills.mjs` compares each tracked skill's upstream folder against the baseline in `skills-registry.lock.json`. When upstream changed, the `Sync upstream skills` workflow opens a PR with a drift report for a human to review and port.

```bash
node scripts/sync-skills.mjs   # detect drift, refresh the lock, write sync-report.md
```

Run it from Actions → "Sync upstream skills" → Run workflow. The weekly cron is disabled until the manifest is confirmed; enable it by uncommenting the `schedule` block in [`.github/workflows/sync-skills.yml`](./.github/workflows/sync-skills.yml).

## Documentation skills

Two evidence-first documentation skills generate one selected Markdown document at a time instead of creating a full docs set by default:

- [`backend-docs`](./skills/03-engineering-design/backend-docs): document backend architecture, bounded contexts, onboarding, API contracts, or backend gaps.

  ```text
  --mode <architecture|onboarding|gap-analysis|api-contracts|bounded-context> --backendPath <path-or-scope> [--outputPath <doc.md>]
  ```

- [`frontend-docs`](./skills/03-engineering-design/frontend-docs): document frontend architecture, onboarding, route/data contracts, component systems, DESIGN.md compliance, or UI gaps.

  ```text
  --mode <architecture|onboarding|gap-analysis|route-data|component-system> --frontendPath <path-or-scope> [--outputPath <doc.md>]
  ```

Install examples:

```bash
bunx skills add marcioaltoe/skills/skills/03-engineering-design --skill backend-docs
bunx skills add marcioaltoe/skills/skills/03-engineering-design --skill frontend-docs
```

## Anatomy of a skill

Each skill lives under an installable workflow phase or domain collection, usually `skills/<collection>/<skill-name>/SKILL.md`. Use top-level collection folders instead of copying or nesting skills to create alternate contexts.

Every `SKILL.md` starts with YAML frontmatter the CLI uses to discover and route it:

```markdown
---
name: conventional-commits
description: Creates Conventional Commit messages and PR titles — use when the user asks "commit", "git commit", or "open PR", or after changes are ready to be recorded.
metadata:
  version: 0.1.0
  tags: [git, commits, conventional-commits]
---

# Commit Style

Short paragraph explaining the skill's purpose.

## When to use

- Scenario 1
- Scenario 2

## How to apply

Concrete, imperative steps the agent will follow literally.
```

The `description` is the most important field — agents read it to decide whether to load the skill. The catalog's author, tags, and collection come from [`skills-registry.json`](./skills-registry.json), not this frontmatter. See [AGENTS.md](./AGENTS.md) for full conventions.

## Contributing

Contributions are welcome.

1. Fork the repo and create a branch.
2. Add your skill under the appropriate installable set, such as `skills/<collection>/` (see [AGENTS.md](./AGENTS.md) for the structure and frontmatter contract).
3. Write all repository content in English, including docs, examples, prompts, comments, templates, and skill bodies.
4. Test locally: `bunx skills add ./skills/<collection>/<your-skill> -g`, then confirm the catalog parses with `make list`.
5. Format before committing: `make fmt` (uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter/) — Markdown, JS, TS, JSON).
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(05-implementation-loop): add my-skill`.
7. Open a pull request.

CI runs `npx skills add . --list` on every PR to validate frontmatter. If it fails, double-check `name`, `description`, and YAML indentation.

## License

MIT — see [LICENSE](./LICENSE).
