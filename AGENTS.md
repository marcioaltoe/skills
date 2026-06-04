# Repository conventions

Guide for creating and maintaining skills here. Applies both to you (human) and to an assistant agent.

## High Priority

- Use the relevant local skills before changing skills, documentation, samples, or repo workflow files. The dispatch table below is mandatory for agent work in this repository.
- Write all repository content in English. This includes examples, sample agent instructions, prompts, comments, templates, and skill bodies.
- Prefer local code search (`rg`, `rg --files`) for this repository. Use external research tools only for external documentation or web/source research.
- Validate before completion. At minimum, run `make list` for catalog changes and `git diff --check` before claiming work is ready.
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

- `<collection>`: an installable context grouping. Pick the folder by the skill's primary use case, not by every possible secondary tag.
- `<skill-name>`: lowercase, hyphens, no spaces. This is the slug used in `bunx skills add ... --skill <name>`.
- `metadata.category`: the domain classification for the skill, independent of the physical collection folder. Keep it specific (`frontend`, `backend`, `writing`, `marketing`, etc.) and use `metadata.tags` for secondary filters.
- Repository language is English. All tracked files, docs, examples, prompts, skill bodies, comments, and templates must be written in English.
- Keep one canonical copy of each skill. Prefer install recipes that combine top-level collections over duplicating folders, nesting reusable sets inside a context folder, or using symlinks. Do not use symlinks inside `skills/` or any installable collection because remote subdirectory installs through `bunx skills add <owner>/<repo>/<path>` must work from a plain GitHub checkout.
- `.agents/skills` is the only allowed symlink layer. It exists only to expose canonical repo skills to the local agent runtime; it is not an installable catalog collection and must not contain copied skill content.

Current collections:

| Collection        | Use for                                                         |
| ----------------- | --------------------------------------------------------------- |
| `dev-core`        | Core development workflow, tooling, testing, and guardrails.    |
| `dev-frontend`    | React, UI, routing, styling, accessibility, and web quality.    |
| `dev-backend`     | APIs, auth, databases, migrations, and platform services.       |
| `dev-methods`     | Architecture, planning, QA, security, DDD, and analysis.        |
| `dev-specialized` | AI SDKs, agent frameworks, jobs, observability, payments, APIs. |
| `product-design`  | Product design, Figma, interface design, diagrams, and assets.  |
| `marketing`       | Marketing, GTM, sales, positioning, pitch, launch, and SEO.     |
| `writing`         | General writing, technical docs, communication, ADRs, and RFCs. |
| `office-docs`     | Office documents, PDFs, presentations, and spreadsheets.        |
| `learning`        | Deliberate practice, learning plans, and skill development.     |
| `research-tools`  | Web research, search, scrape, and source capture helpers.       |
| `llm-wiki`        | Core Karpathy-style LLM Wiki workflows.                         |
| `knowledge-tools` | Obsidian, QMD, and Mermaid tools for knowledge work.            |
| `skill-authoring` | Skill creation, evaluation, packaging, and improvement.         |

## Local Agent Skill Enforcement

Agents working in this repository must use the relevant local skills from `.agents/skills` before editing or reviewing skills, documentation, or repo workflow files. Load the smallest useful set; do not bulk-load every linked skill.

Required local skill triggers:

| Task                                      | Required skills                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| Create or rewrite a skill                 | `skill-creator`, `skill-architect`, `skill-best-practices`, `write-a-skill`  |
| Improve, benchmark, or evaluate skill     | `autoresearch`, `skill-best-practices`                                       |
| Find whether a skill exists               | `find-skills`                                                                |
| Write or revise README/docs/prose         | `tech-writer`, `crafting-effective-readmes`, `writing-clearly-and-concisely` |
| Write PRDs, ADRs, issues, PR descriptions | `tech-writer`                                                                |
| Make implementation changes               | `coding-guidelines`, `no-workarounds`                                        |
| Look up current technical docs            | `context7`                                                                   |
| Do web/source research                    | `exa-web-search`                                                             |
| Commit changes                            | `commit-style`, `verification-before-completion`                             |
| Claim work is complete                    | `verification-before-completion`                                             |
| Hand off session work to another agent    | `handoff`                                                                    |

If a `.agents/skills/<name>` symlink is missing or broken, read the canonical skill from `skills/<collection>/<name>/SKILL.md` and repair the symlink when the task depends on it. Do not edit files through `.agents/skills`; edit the canonical files under `skills/`.

### Skill Dispatch Protocol

Before editing, identify the task domain and load every matching skill:

- **Skill creation or rewrite**: `skill-creator`, `skill-architect`, `skill-best-practices`, `write-a-skill`.
- **Skill improvement/evaluation**: `autoresearch`, `skill-best-practices`.
- **Skill discovery or sample cleanup**: `find-skills`.
- **README, AGENTS, sample instructions, or prose**: `tech-writer`, `crafting-effective-readmes`, `writing-clearly-and-concisely`.
- **PRDs, tech specs, ADRs, issues, PR descriptions, status updates**: `tech-writer`.
- **Makefile, scripts, or implementation changes**: `coding-guidelines`, `no-workarounds`.
- **External library/API documentation**: `context7`.
- **Web/source research**: `exa-web-search`.
- **Commit or push work**: `commit-style`, `verification-before-completion`.
- **Hand off session work to another agent**: `handoff`.

When a task touches multiple domains, use all relevant skills. For example, improving a skill README uses both skill-authoring and writing skills.

## Search and Research

- Use `rg` and `rg --files` for local repository discovery. Do not use Context7 or Exa to search local files.
- Use `context7` for current external library, SDK, API, CLI, or cloud-service documentation.
- Use `exa-web-search` for web research, source discovery, competitive/source sweeps, or current information that is not available from local files or official docs.
- For samples that mention skill names, compare the referenced names with current `name:` frontmatter values under `skills/**/SKILL.md`. Keep a short audit note when a sample intentionally mentions removed names.

## Commands

```bash
make list           # list skills discovered in the repo; required for catalog changes
make skills-link    # recreate .claude/skills symlinks from .agents/skills
make skills-update  # install and update skills from skills-lock.json
make fmt            # format md/js/ts/json files with oxfmt
make fmt-check      # check formatting without writing
```

For docs-only changes, formatting the touched Markdown files with `npx --yes oxfmt@latest <file...>` is acceptable. Avoid whole-repo formatting unless the task is specifically to format the repository.

## Git Safety

- Branch names created by agents must start with `ma/`.
- Do not discard, overwrite, or clean user changes without explicit permission.
- Use `git status --short` before staging. If unrelated changes exist, leave them out of the commit.
- Commits and PR titles must follow Conventional Commits.
- PR bodies should summarize changes and list validation commands run.
- Merge is always squash. The PR title becomes the squashed commit message.

## Standard frontmatter

Every `SKILL.md` starts with YAML frontmatter. Required fields are enforced by the `vercel-labs/skills` CLI; the rest is for the future frontend to consume.

```yaml
---
name: my-skill # required — unique slug (lowercase-with-hyphens)
description: One-liner the agent reads # required — the agent uses this to decide when to activate
metadata:
  category: development # domain classification (the CLI ignores it, but the frontend uses it)
  tags: [typescript, refactor] # optional — extra filters
  version: 0.1.0 # semver
  author: Marcio Altoé
  internal: false # true = hides the skill from the default listing
---
```

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

# 6. Commit with Conventional Commits
git add skills/<collection>/<name>
git commit -m "feat(<collection>): add <name> skill"

# 7. Open PR and (after approval) merge
git push -u origin ma/add-<name>
gh pr create --base main --head ma/add-<name> --title "feat(<collection>): add <name> skill"
gh pr merge --squash --delete-branch
git fetch origin main --prune
git switch main
git pull --ff-only
```

### Flow rules

- **Branches** always start with `ma/`.
- **Commits** follow Conventional Commits.
- **PR titles** also follow Conventional Commits.
- **PR bodies** should summarize changes and list validation commands run.
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

The `.github/workflows/ci-validate.yml` workflow runs `npx skills add . --list` on every push to ensure all frontmatters parse. If CI fails, it's probably:

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
