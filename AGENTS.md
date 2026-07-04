# Repository conventions

This repository creates, curates, validates, and publishes agent skills. It is both a skills source tree and a static Astro catalog published to GitHub Pages.

Guide for creating and maintaining skills here. Applies both to you (human) and to an assistant agent.

## High Priority

- Use the relevant local skills before changing skills, documentation, samples, or repo workflow files. The dispatch table below is mandatory for agent work in this repository.
- Treat `skills/`, `skills-registry.json`, `setups/`, and `web/` as one product surface: installable skills plus the public catalog. Changes to one often require validation or generated artifacts in another.
- Write all repository content in English. This includes examples, sample agent instructions, prompts, comments, templates, and skill bodies.
- Prefer local code search (`rg`, `rg --files`) for this repository. Use external research tools only for external documentation or web/source research.
- Validate before completion. At minimum, run `make list` for skill changes, `make setups-check` for preset changes, and `git diff --check` before claiming work is ready.
- Do not run destructive git commands such as `git reset`, `git checkout --`, `git restore`, `git clean`, or forced deletion commands unless the user explicitly asks for that operation.

## Structure

```text
skills/
  <collection>/
    <skill-name>/
      SKILL.md            # required
      references/         # optional — deep reference material
      examples/           # optional — usage examples
      templates/          # optional — templates/scaffolds
      scripts/            # optional — automation
```

- `<collection>`: an installable workflow phase or domain grouping. Pick the folder by the skill's primary use case, not by every possible secondary tag.
- `<skill-name>`: lowercase, hyphens, no spaces. This is the slug used in `bunx skills add ... --skill <name>`.
- A skill's collection is its folder under `skills/`. The catalog metadata — `author`, curated `tags`, and (for vendored skills) upstream provenance — lives in `skills-registry.json`, keyed by the folder slug, not in `SKILL.md` frontmatter (see "Catalog, registry, and upstream sync").
- Repository language is English. All tracked files, docs, examples, prompts, skill bodies, comments, and templates must be written in English.
- Keep one canonical copy of each skill. Prefer install recipes that combine top-level collections over duplicating folders, nesting reusable sets inside a context folder, or using symlinks. Do not use symlinks inside `skills/` or any installable collection because remote subdirectory installs through `bunx skills add <owner>/<repo>/<path>` must work from a plain GitHub checkout.
- `.agents/skills` is the only allowed symlink layer: it exposes canonical catalog skills to the local agent runtime and is also the home of repo-internal skills that are not part of the installable catalog (currently `skill-catalog-curation`). It is not an installable catalog collection; never copy catalog skill content into it.

Current collections:

| Collection               | Use for                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `00-setup`               | Repo conventions, local skills, setup workflows, and baseline agent guardrails.            |
| `01-discovery`           | Problem discovery, research, assumption checks, source capture, and risk identification.   |
| `02-planning`            | PRDs, GTM planning, product positioning, communication planning, and business framing.     |
| `03-engineering-design`  | Architecture, security, UX, design systems, documentation plans, and technical design.     |
| `04-issue-decomposition` | Parent/child issue breakdown, triage, dependency ordering, and acceptance criteria.        |
| `05-implementation-loop` | Code implementation, framework work, migrations, tests, prototypes, and coding guardrails. |
| `06-review-repair`       | Code review, debugging, quality audits, conflict repair, accessibility, and verification.  |
| `07-evidence-delivery`   | Delivery evidence, commits, handoffs, docs, status notes, office docs, decks, and reports. |
| `08-release`             | Release, deployment, observability, infrastructure, and production-facing operations.      |
| `09-learning-loop`       | Skill authoring, evaluations, teaching, lessons learned, and process improvement feedback. |
| `10-marketing`           | Marketing content, positioning, SEO, campaigns, sales material, GTM plans, and pitch work. |

## Catalog, registry, and upstream sync

Two generated systems sit alongside the skills, both derived from `skills-registry.json`. Keep them in sync — `make list` and setup validation are CI-enforced.

- **`skills-registry.json`** — one entry per skill, keyed by folder slug, holding the catalog metadata: `author`, curated `tags`, `local-path`, `collection`, and (for vendored skills) the upstream `repo`/`path`/`ref`. This is the source of truth for author, tags, and provenance — not the `SKILL.md` frontmatter. An entry without a `repo` is authored locally.
- When adding or replacing a vendored skill, prefer the official upstream repository and skill path whenever one exists. Use community repositories only when there is no official skill source, or when the user explicitly asks for that community source.
- Before creating a local skill from scratch, first check whether the original/official repository already provides a skill. If not, search community skills. Create a new local skill only when neither source provides an adequate option, and keep the reason visible in the work summary.
- **`web/`** — a static Astro catalog with search, collection/tag filters, grouping, and per-skill/per-phase install commands. `web/scripts/build-index.mjs` reads the registry plus each `SKILL.md` to build the index; `make dev` runs it locally. See [web/README.md](./web/README.md).
- **`scripts/sync-skills.mjs` + `skills-registry.lock.json`** — upstream drift detection. For each registry entry with a `repo`, it compares the upstream folder tree-SHA against the lock baseline. The `Sync upstream skills` workflow opens a PR with a drift report when an upstream changes; it never overwrites local content.

Use `skill-catalog-curation` before changing `skills-registry.json`, setup presets, vendored skill provenance, or the Astro catalog. Its job is to keep skill content, curated metadata, setup installs, and the GitHub Pages surface aligned.

## Local Agent Skill Enforcement

Agents working in this repository must use the relevant local skills from `.agents/skills` before editing or reviewing skills, documentation, or repo workflow files. Load the smallest useful set; do not bulk-load every linked skill.

Required local skill triggers:

| Task                                      | Required skills                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Create or rewrite a skill                 | `skill-creator`, `skill-architect`, `skill-best-practices`, `writing-great-skills` |
| Curate catalog/registry/web setup         | `skill-catalog-curation`                                                           |
| Improve, benchmark, or evaluate skill     | `autoresearch`, `skill-best-practices`                                             |
| Find whether a skill exists               | `find-skills`                                                                      |
| Write or revise README/docs/prose         | `tech-writer`, `crafting-effective-readmes`, `writing-clearly-and-concisely`       |
| Write PRDs, ADRs, issues, PR descriptions | `tech-writer`                                                                      |
| Make implementation changes               | `coding-guidelines`, `no-workarounds`                                              |
| Debug repo scripts, web build, or tooling | `systematic-debugging`, `no-workarounds`                                           |
| Look up current technical docs            | `context7`                                                                         |
| Do web/source research                    | `exa-web-search`                                                                   |
| Commit changes                            | `conventional-commits`, `evidence-gate`                                            |
| Prepare GitHub PRs                        | `github-pr-workflow`, `conventional-commits`, `evidence-gate`                      |
| Claim work is complete                    | `evidence-gate`                                                                    |
| Hand off session work to another agent    | `handoff`                                                                          |

If a `.agents/skills/<name>` symlink is missing or broken, read the canonical skill from `skills/<collection>/<name>/SKILL.md` and repair the symlink when the task depends on it. Do not edit catalog skills through `.agents/skills`; edit the canonical files under `skills/`. The exception is `skill-catalog-curation`, which lives directly in `.agents/skills` as a repo-internal skill and is edited there.

### Skill Dispatch Protocol

Before editing, identify the task domain and load every matching skill:

- **Skill creation or rewrite**: `skill-creator`, `skill-architect`, `skill-best-practices`, `writing-great-skills`.
- **Catalog, registry, setup presets, or Astro catalog**: `skill-catalog-curation`.
- **Skill improvement/evaluation**: `autoresearch`, `skill-best-practices`.
- **Skill discovery or sample cleanup**: `find-skills`.
- **README, AGENTS, sample instructions, or prose**: `tech-writer`, `crafting-effective-readmes`, `writing-clearly-and-concisely`.
- **PRDs, tech specs, ADRs, issues, PR descriptions, status updates**: `tech-writer`.
- **Makefile, scripts, or implementation changes**: `coding-guidelines`, `no-workarounds`.
- **Debugging repo scripts, web build, or CI failures**: `systematic-debugging`, `no-workarounds`.
- **External library/API documentation**: `context7`.
- **Web/source research**: `exa-web-search`.
- **Commit or push work**: `conventional-commits`, `evidence-gate`.
- **GitHub PR preparation**: `github-pr-workflow` before opening, updating, or preparing a PR for review; pair it with `conventional-commits` and `evidence-gate`.
- **Hand off session work to another agent**: `handoff`.

When a task touches multiple domains, use all relevant skills. For example, improving a skill README uses both skill-authoring and writing skills.

## Search and Research

- Use `rg` and `rg --files` for local repository discovery. Do not use Context7 or Exa to search local files.
- Use `context7` for current external library, SDK, API, CLI, or cloud-service documentation.
- Use `exa-web-search` for web research, source discovery, competitive/source sweeps, or current information that is not available from local files or official docs.
- For samples that mention skill names, compare the referenced names with current `name:` frontmatter values under `skills/**/SKILL.md`. Keep a short audit note when a sample intentionally mentions removed names.

## Commands

```bash
make list               # list skills discovered in the repo (CI runs this too)
make setups-check       # validate setup preset files (CI runs this too)
make dev                # run the web/ catalog dev server
make skills-link        # recreate .claude/skills symlinks from .agents/skills
make skills-update      # install/update skills from the bunx skills lockfile
make fmt                # format md/js/ts/json files with oxfmt
make fmt-check          # check formatting without writing
```

For docs-only changes, formatting the touched Markdown files with `npx --yes oxfmt@latest <file...>` is acceptable. Avoid whole-repo formatting unless the task is specifically to format the repository.

## Git Safety

- Branch names created by agents must start with `ma/`.
- Do not discard, overwrite, or clean user changes without explicit permission.
- Use `conventional-commits` before staging, committing, writing a commit message, or preparing a PR title.
- Use `git status --short` before staging. If unrelated changes exist, leave them out of the commit.
- Commits and PR titles must follow Conventional Commits and pass `cog verify "$PR_TITLE"` for PR titles.
- Use Conventional Commits format **without a scope**: `type: imperative subject`. This repo's `cog.toml` declares `scopes = []`, so scoped subjects like `feat(skills): ...` fail `cog verify`.
- Before opening a PR, run the relevant repository verification command.
- PR bodies must include a clear description, linked task or issue when one exists, architectural decisions, and validation commands run.
- Include screenshots or GIFs for UI changes.
- Do not rewrite unrelated files or reformat the whole repository; limit diffs to the requested change.
- Merge is always squash. The PR title becomes the squashed commit message.

## Standard frontmatter

Every `SKILL.md` starts with YAML frontmatter. The `vercel-labs/skills` CLI requires only `name` and `description`. The catalog reads `author`, `tags`, `collection`, and provenance from `skills-registry.json`, not from this frontmatter — a skill's own `metadata.tags` surface in the catalog only behind the "Include author tags" toggle.

```yaml
---
name: my-skill # required — unique slug (lowercase-with-hyphens)
description: One-liner the agent reads # required — triggers and domain (see below)
metadata:
  version: 0.1.0 # optional — shown as a card badge in the catalog
  tags: [typescript, refactor] # optional — the skill's own "author tags"
  internal: false # optional — true hides the skill from the default listing
---
```

### Metadata for authored skills

Locally authored skills whose registry `author` is `Marcio Altoé` must include a complete `metadata` block in frontmatter:

```yaml
metadata:
  category: writing
  tags: [readme, docs, technical-writing, prd, techspec, adr, tasks, issues, qa, communication]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
```

Choose `category` and `tags` for the skill's real domain. Keep only one `version` field. Preserve a higher existing version when updating an older authored skill.

### About `description`

This is the most important field. The agent decides whether to load the skill based on it. Best practices:

- **Lead with the main action**, not with "Skill to..." or "This skill...".
- **List concrete triggers**: which question/context should activate it.
- **Be specific about the domain**: "PRs in Conventional Commits style" > "help with PRs".

Good: `Creates PR descriptions following Conventional Commits — use when the user asks "create PR", "open PR", or after a sequence of commits ready for review.`

Bad: `Skill to help with PRs.`

## Step-by-step: creating a new skill

```bash
# 1. Open a branch (always prefixed with ma/)
git fetch origin main --prune
git switch main
git pull --ff-only
git switch -c ma/add-<name>

# 2. Create the structure
mkdir -p skills/<collection>/<name>

# 3. Create SKILL.md with the standard frontmatter (see section above)
$EDITOR skills/<collection>/<name>/SKILL.md

# 4. Test locally
bunx skills add ./skills/<collection>/<name> -g

# 5. Verify the frontmatter parses
make list

# 6. Commit with Conventional Commits (no scope — cog.toml has scopes = [])
git add skills/<collection>/<name>
git commit -m "feat: add <name> skill"

# 7. Open PR and (after approval) merge
git push -u origin ma/add-<name>
gh pr create --base main --head ma/add-<name> --title "feat: add <name> skill"
gh pr merge --squash --delete-branch
git fetch origin main --prune
git switch main
git pull --ff-only
```

### Flow rules

- **Branches** always start with `ma/`.
- **Commit workflow**: Use `conventional-commits` before staging, committing, writing a commit message, or preparing a PR title.
- **Commits** follow `type: imperative subject` — no scope, because `cog.toml` declares `scopes = []`.
- **PR titles** follow Conventional Commits and must pass `cog verify "$PR_TITLE"`.
- **PR preparation**: Use `github-pr-workflow` before opening, updating, or preparing a PR for review.
- **PR verification**: Run the relevant repository verification command before opening the PR.
- **PR bodies** include a clear description, linked task or issue when one exists, architectural decisions, validation commands run, and screenshots or GIFs for UI changes.
- **Diff scope** stays limited to the requested change; do not rewrite unrelated files or reformat the whole repository.
- **Merge** is always squash. The PR title becomes the squashed commit message.

## `SKILL.md` content conventions

Suggested body structure (after the frontmatter):

```markdown
# Human-readable skill name

Short paragraph explaining the purpose.

## When to use

- Scenario 1
- Scenario 2
- Scenario 3

## How to apply

Concrete steps, in the imperative. Be specific — the agent will follow literally.

## Anti-patterns

- What NOT to do.
- Common mistakes this skill should prevent.

## References (optional)

Links to `references/` or external docs.
```

Keep `SKILL.md` short (ideally < 200 lines). Extensive material goes in `references/` and is linked from the body.

## CI validation

The `.github/workflows/ci-validate.yml` workflow runs on every push and PR. It runs `npx skills add . --list` to confirm every frontmatter parses, then validates setup presets.

A `--list` failure is usually:

- Missing `name` or `description` field.
- Invalid YAML (indentation, quotes).
- Folder has `SKILL.md` but no frontmatter.

## Internal skills

To hide a skill from the listing (e.g., work in progress, template), add:

```yaml
metadata:
  internal: true
```

The skill is only installable if the user passes `--skill <name>` explicitly or sets `INSTALL_INTERNAL_SKILLS=1`.
