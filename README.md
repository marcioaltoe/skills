# marcioaltoe/skills

[![validate](https://github.com/marcioaltoe/skills/actions/workflows/ci-validate.yml/badge.svg)](https://github.com/marcioaltoe/skills/actions/workflows/ci-validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A curated collection of [agent skills](https://github.com/vercel-labs/skills) for Claude Code and other compatible agents. Each skill is a focused set of instructions — frontmatter plus a `SKILL.md` body — that an agent loads on demand to extend its capabilities for a specific task.

## Requirements

- A skills-aware agent, such as [Claude Code](https://claude.com/claude-code).
- macOS/Linux setup install: `bash`, `curl` or `wget`, and either Bun or Node.js/npm for the `skills` CLI.
- Windows setup install: PowerShell 5+ or PowerShell 7, plus either Bun or Node.js/npm for the `skills` CLI.
- Node.js 18+ or Bun to run the web catalog locally.

## Installation

Use setup presets when preparing a project. The installer reads the preset, calls the [`skills`](https://github.com/vercel-labs/skills) CLI, installs the selected skills into `.agents/skills` by default, and writes `skills-lock.json` so the project can restore or update those skills later.

```bash
# macOS or Linux
curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- typescript
```

```powershell
# Windows PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) typescript"
```

List presets with `curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- --list`.

For normal projects, start with the project-type setup: `typescript` (the primary Bun workspaces monorepo stack: React, Vite, Hono, Drizzle, Vitest), `python` (CLIs, HTTP backends, workers, and file pipelines), `go` (command-line tools and Bubble Tea v2 TUI applications), or `rust` (clap-based CLIs). These project setups include the CONTEXT-driven spec workflow — `brainstorming`/`grill-with-docs` -> `write-idea` (product-level ideas) -> `write-prd` -> `write-techspec` -> `write-tasks` -> `implement-spec`/`implement-task` -> `qa-gate` -> `archive-spec` — with `domain-modeling` for `CONTEXT.md`/ADR capture and per-feature artifacts under `docs/specs/<slug>/`. Use `devops` for infrastructure repositories (Terraform, DigitalOcean, Cloudflare, and Docker, plus apply discipline, observability, delivery evidence, and the same CONTEXT-driven spec workflow with `roundfix`) and `content` for documentation, office files, Google Workspace, research, and marketing work.

See the [setup guide](https://marcioaltoe.github.io/skills/setups/) for every OS command and the skills included in each preset. Use the [web catalog](https://marcioaltoe.github.io/skills/) to search all skills by name, workflow phase, tag, or author.

You can also install a workflow phase or a single skill directly with the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
bunx skills add marcioaltoe/skills/skills/05-implementation-loop
bunx skills add marcioaltoe/skills/skills/07-evidence-delivery --skill conventional-commits
bunx skills add marcioaltoe/skills --list
```

The root command `bunx skills add marcioaltoe/skills` opens a large picker. Prefer the setup guide, the searchable catalog, a phase path, or `--skill <name>` for normal installs.

After installing a setup, keep the generated `skills-lock.json` with the project. To restore or update the project skills later, run:

```bash
bunx skills experimental_install
bunx skills update -p -y
```

## Python projects

The `python` preset installs agent guidance for uv, Ruff, pytest, ty, Typer, and FastAPI, plus application-service and file-pipeline engineering. It includes all language-neutral skills shared by the Go and Rust presets, preserving Roundfix's planning, implementation, QA, and delivery workflow. It adds backend documentation, external adapters, integration tests, security guidance, and Docker.

Skills are capabilities, not application dependencies. Keep an existing project's supported Python versions, argparse commands, build backend, dependency restrictions, type checker, and verification gate. For a new project, use uv, Ruff linting and formatting, pytest, and one selected type checker; add Typer or FastAPI only when the required surface calls for it. The `python-services` skill explains the selection and worker recovery contract. The `python-file-pipelines` skill covers XML/ZIP ingestion, exact monetary values, SQLite cache ownership, incomplete evidence, simulations, and report read-back.

From a local checkout, preview the installation:

```bash
./install.sh python --dry-run
```

To install this checkout's skills into a target project, run the installer from that project's directory:

```bash
/path/to/skills/install.sh python
```

The `python` preset also includes the official Streamlit discovery skill for a rapid internal screen. Activate it only for an explicit internal-tool or prototype requirement, and keep behavior in the Python service package. Installing the skill does not add Streamlit as an application dependency. Production frontend architecture remains a separate decision.

Installing a preset does not adopt a Roundfix Baseline or modify its generated guides. Roundfix owns profile selection, setup snapshots, mandatory dispatch, starter tooling, and adopter refresh through its governed workflow. Its Python integration can import this published `python` list by name while retaining the shared baseline. Preserve existing Baseline decisions and managed regions; select only profiles the installed Roundfix version actually provides.

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

Many skills here are vendored from upstream repositories. [`skills-registry.json`](./skills-registry.json) records each vendored skill's upstream origin (`repo`, `path`, `ref`) and update policy; entries without a `repo` are authored locally and never synced. Synchronization replaces a changed upstream skill folder. Curated variants use `manual` for a reviewable replacement or `off` to freeze the local copy; neither a refreshed lock nor an unchanged upstream proves that the local folder matches its source.

`scripts/sync-skills.mjs` compares each tracked skill's upstream folder against the baseline in `skills-registry.lock.json`. The workflow handles `auto` and `manual` updates separately: validated auto updates can merge automatically, while manual updates stay open for review. An optional `license-path` copies an upstream repository-level notice into the skill as `LICENSE`; its separately locked SHA detects license-only updates and keeps notices with subdirectory installations.

```bash
node scripts/sync-skills.mjs   # replace changed skills, refresh the lock, write sync-report.md
```

Run it from Actions → "Sync upstream skills" → Run workflow. It also runs daily; see [`.github/workflows/sync-skills.yml`](./.github/workflows/sync-skills.yml). Preserve local edits before running a replacement. Run `make test` to verify repository-owned synchronization behavior without network access.

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
  category: git
  tags: [git, commits, conventional-commits]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Commit Style

Short paragraph explaining the skill's purpose.

## When to use

- Scenario 1
- Scenario 2

## How to apply

Concrete, imperative steps the agent will follow literally.
```

The `description` is the most important field — agents read it to decide whether to load the skill. The catalog's curated author, tags, and collection come from [`skills-registry.json`](./skills-registry.json), but locally authored skills still include `category`, `tags`, `version`, `author`, and `source` in frontmatter for portable metadata. See [AGENTS.md](./AGENTS.md) for the full contract.

## Contributing

Contributions are welcome.

1. Fork the repo and create a branch.
2. Add your skill under the appropriate installable set, such as `skills/<collection>/` (see [AGENTS.md](./AGENTS.md) for the structure and frontmatter contract).
3. Add complete frontmatter metadata for locally authored skills: `category`, `tags`, `version`, `author`, and `source`.
4. Update [`skills-registry.json`](./skills-registry.json) with the skill's curated catalog metadata.
5. Write all repository content in English, including docs, examples, prompts, comments, templates, and skill bodies.
6. Test locally: `bunx skills add ./skills/<collection>/<your-skill> -g`, then confirm the catalog parses with `make list`.
7. Format before committing: `make fmt` (uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter/) — Markdown, JS, TS, JSON).
8. Commit using [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(05-implementation-loop): add my-skill`.
9. Open a pull request.

CI runs `npx skills add . --list` on every PR to validate frontmatter. If it fails, double-check `name`, `description`, and YAML indentation.

## License

MIT — see [LICENSE](./LICENSE).
