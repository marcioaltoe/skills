# Repository conventions

Guide for creating and maintaining skills here. Applies both to you (human) and to an assistant agent.

## Structure

```text
skills/
  <category>/
    <skill-name>/
      SKILL.md            # required
      references/         # optional — deep reference material
      examples/           # optional — usage examples
      templates/          # optional — templates/scaffolds
      scripts/            # optional — automation
```

- `<category>`: one of the existing folders (`ai`, `architecture`, `backend`, `design`, `development`, `devops`, `frontend`, `git`, `marketing`, `testing`, `tools`, `writing`). Creating a new folder = creating a new category. Keep categories tight — if a skill fits two, pick the dominant one and use `metadata.tags` for the rest.
- `<skill-name>`: lowercase, hyphens, no spaces. This is the slug used in `bunx skills add ... --skill <name>`.

## Standard frontmatter

Every `SKILL.md` starts with YAML frontmatter. Required fields are enforced by the `vercel-labs/skills` CLI; the rest is for the future frontend to consume.

```yaml
---
name: my-skill # required — unique slug (lowercase-with-hyphens)
description: One-liner the agent reads # required — the agent uses this to decide when to activate
metadata:
  category: development # explicit (the CLI ignores it, but the frontend uses it)
  tags: [typescript, refactor] # optional — extra filters
  version: 0.1.0 # semver
  author: marcioaltoe
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
make branch NAME=add-<name>

# 2. Create the structure
mkdir -p skills/<category>/<name>

# 3. Create SKILL.md with the standard frontmatter (see section above)
$EDITOR skills/<category>/<name>/SKILL.md

# 4. Test locally
bunx skills add ./skills/<category>/<name> -g

# 5. Verify the frontmatter parses
make list

# 6. Commit (Conventional Commits — install the hook with `make install-hooks`)
git add skills/<category>/<name>
git commit -m "feat(<category>): add <name> skill"

# 7. Open PR, trigger review, and (after approval) merge
make pr        # body is generated grouping feats/fixes/refactors
make review    # comments @claude on the PR
make merge     # squash + delete branch + back to updated main
```

### Flow rules

- **Branches** always start with `ma/` (created via `make branch`).
- **Commits** follow Conventional Commits — `make install-hooks` installs the validator.
- **PR titles** also follow Conventional Commits — `make pr` validates and blocks if they don't match.
- **Merge** is always squash. The PR title becomes the squashed commit message.

### Auto-generated PR body

`make pr` reads all commits on the branch and groups them by type in the body:

```
## Features
- feat(git): add commit-style skill
- feat(development): add review-checklist skill

## Fixes
- fix(testing): tighten vitest skill description

## Refactors
- refactor(git): split commit-style anti-patterns section
```

Commits that aren't feat/fix/refactor (docs, chore, test, etc.) go under "Other".

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

The `.github/workflows/validate.yml` workflow runs `npx skills add . --list` on every push to ensure all frontmatters parse. If CI fails, it's probably:

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
