---
name: knowledge-workspace
description: Work with project documentation and the central knowledge repository (gesttione-solutions/tabularium). Use when editing docs/, CONTEXT.md, specs, ADRs, or task files in any repo with a .tabularium-project file; when deciding where a documentation change should be committed; or when touching tabularium's mirror, notes, or shared areas.
metadata:
  category: setup
  tags: [workflow, documentation, git, repository-context]
  version: 0.3.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Knowledge Workspace (Tabularium)

The central knowledge repository is **gesttione-solutions/tabularium**: per-project mirrors, editorial notes, and shared standards. Code repositories own their documentation as regular files; Tabularium aggregates it automatically.

## The contract

Documentation (`CONTEXT.md`, `docs/` — specs, ADRs, task files, review artifacts) consists of **regular files in the code repository**. There is ONE commit flow:

- Edit docs and code together and commit together, in the same branch and PR. `task_NN.md` status flips and `## Result` sections are ordinary repo commits — no second repository, no separate docs push.
- After every push to `main` (any merge type or direct push; never feature branches), GitHub Actions mirrors the paths listed in `.tabularium-export` into `tabularium/projects/<project>/mirror/`. This is automatic — **never sync manually**.
- The mirror is **read-only**. Never edit `projects/<project>/mirror/` in tabularium; the next sync overwrites it. Content worth editing belongs either in the code repo (project docs) or in tabularium's editorial areas.
- Editorial areas are edited directly in tabularium and pushed to its `main`: `projects/<project>/notes/` (project notes that don't belong to the repo — meeting notes, era archives, client feedback) and `shared/` (cross-project standards). `registry/projects.json` whitelists which repository may publish to which project.
- Consumption is one-way: nothing in tabularium is ever written back to code repositories. To reference `shared/` material from a repo, link to it — do not copy it in.

## The export contract

| File in the code repo | Purpose |
| --- | --- |
| `.tabularium-project` | Exactly the project name — the key under `projects/` and in the tabularium registry |
| `.tabularium-export` | What the repo publishes: one path per line, directories recursive, `!pattern` lines are excludes (rsync/gitignore-like), `#` comments |
| `.github/workflows/tabularium-sync.yml` | Caller of tabularium's reusable sync workflow (org repos) or the standalone variant (personal-account repos) |

Only committed files can be exported (the sync reads a checkout of the merged commit), and symlinks are rejected. When adding a new exported artifact (e.g. an OpenAPI file), update `.tabularium-export` in the same PR.

## Adding a new project

Follow `templates/repo/` and the README in tabularium: register in `registry/projects.json` (`active: true`), create `projects/<name>/notes/`, add the three files above to the repo, grant it access to the `TABULARIUM_APP_CLIENT_ID` variable and `TABULARIUM_APP_PRIVATE_KEY` secret (org-level for org repos, repo-level for personal-account repos), merge to `main`.

## Anti-patterns

- Creating symlinks for `CONTEXT.md`/`docs`, mounting a `.knowledge/` checkout, or running a bootstrap script — that flow is retired everywhere.
- Editing or committing anything under `projects/<project>/mirror/` in tabularium.
- Splitting a docs change out of the PR that motivated it "to sync faster" — the mirror updates on merge; in-flight state living only in the branch is correct.
- Copying `shared/` content into a code repository — link to it instead; copies drift.
- Pointing `.tabularium-project` at a different project's folder.
