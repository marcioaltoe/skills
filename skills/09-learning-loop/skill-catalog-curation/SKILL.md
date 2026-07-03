---
name: skill-catalog-curation
description: Curates this repository's installable skills catalog. Use when adding, replacing, moving, tagging, vendoring, or removing skills; editing skills-registry.json, setups, sync lockfiles, or the Astro GitHub Pages catalog. Do not use for writing an individual SKILL.md only; use skill-creator and skill-best-practices for that.
metadata:
  category: skill-authoring
  version: 0.1.0
  tags: [skills, catalog, registry, astro, github-pages]
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Skill catalog curation

Keep the skill source tree, registry metadata, setup presets, sync lockfile, and Astro catalog aligned.

## When to use

- A skill is added, removed, renamed, moved between collections, vendored, or replaced.
- `skills-registry.json`, `skills-registry.lock.json`, `setups/`, `install.sh`, `install.ps1`, `web/`, or `.github/workflows/deploy-pages.yml` changes.
- The user asks to curate skills, update catalog metadata, adjust tags/authors/provenance, or change what the GitHub Pages catalog shows.

## Curation workflow

1. Identify the surface being changed:
   - Skill body: `skills/<collection>/<name>/SKILL.md`
   - Catalog metadata: `skills-registry.json`
   - Setup presets: `setups/_index.txt` and `setups/<preset>.txt`
   - Astro catalog: `web/`
   - Upstream sync: `scripts/sync-skills.mjs` and `skills-registry.lock.json`
2. For new or replaced skills, verify whether an official upstream skill exists before writing a local one. Prefer official upstream sources; use community sources only when no official source fits or the user asks for that source.
3. Keep one canonical skill folder under `skills/<collection>/<skill-name>/`. Do not duplicate a skill into multiple collections or add symlinks under `skills/`.
4. Put catalog metadata in `skills-registry.json`, not in frontmatter:
   - `author`
   - curated `tags`
   - `local-path`
   - `collection`
   - optional upstream `repo`, `path`, `ref`, `update`
5. Keep frontmatter focused on agent loading: `name`, `description`, and optional `metadata` such as `version` or author tags.
6. If setup presets change, run `make setups-check`.
7. If the Astro catalog behavior or generated index changes, run the relevant web command from `web/package.json` and inspect the generated catalog behavior.
8. Always run `make list` and `git diff --check` before claiming the curation work is ready.

## Collection choice

Choose the collection by the skill's primary use case, not by every technology it mentions.

- `00-setup`: repo setup, local skills, agent guardrails, setup presets.
- `01-discovery`: research, assumption checks, problem discovery.
- `02-planning`: PRDs, product planning, GTM, communication planning.
- `03-engineering-design`: architecture, security, UX, documentation plans.
- `04-issue-decomposition`: issues, triage, acceptance criteria.
- `05-implementation-loop`: implementation, frameworks, migrations, tests.
- `06-review-repair`: review, debugging, quality repair, verification.
- `07-evidence-delivery`: delivery evidence, docs, commits, reports.
- `08-release`: release, deployment, observability, operations.
- `09-learning-loop`: skill authoring, evaluations, process improvement.
- `10-marketing`: marketing, sales, SEO, pitch material.

## Astro catalog rules

- The public catalog is static and lives under `web/`.
- `web/scripts/build-index.mjs` reads `skills-registry.json` plus each `SKILL.md`.
- `src/data/skills.json` is generated and git-ignored; do not commit it.
- GitHub Pages deploys via `.github/workflows/deploy-pages.yml`.
- Keep collection labels in `web/scripts/build-index.mjs` aligned with the repository's collection table.

## Validation matrix

| Change                           | Required validation                                                           |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Skill body only                  | `make list`, `git diff --check`                                               |
| Registry metadata                | `make list`, `git diff --check`                                               |
| Setup presets                    | `make setups-check`, `make list`, `git diff --check`                          |
| Astro catalog                    | `cd web && npm run build`, `git diff --check`                                 |
| Upstream sync script or lockfile | Run the focused sync/check command and inspect `sync-report.md`               |

## Anti-patterns

- Editing author, tags, collection, or provenance in `SKILL.md` instead of `skills-registry.json`.
- Adding a vendored skill without upstream provenance when the source is known.
- Creating a setup preset that points to a missing skill or a path absent from the registry.
- Treating the Astro page as separate from the registry; it is a projection of registry plus skill frontmatter.
