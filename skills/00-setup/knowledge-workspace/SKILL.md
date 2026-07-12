---
name: knowledge-workspace
description: Work with project documentation and the central knowledge repository (gesttione-solutions/tabularium, formerly knowledge). Use when editing docs/, CONTEXT.md, specs, ADRs, or task files; when a repo has .tabularium-project/.tabularium-export files; when CONTEXT.md or docs/ are symlinks into .knowledge/ (legacy repos); and before committing ANY documentation change — the commit flow depends on which mode the repo uses.
metadata:
  category: setup
  tags: [workflow, documentation, git, repository-context]
  version: 0.2.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Knowledge Workspace (Tabularium)

The central knowledge repository is **gesttione-solutions/tabularium** (renamed from `knowledge`): per-project mirrors, editorial notes, and shared standards. Code repositories are migrating from a symlink workspace (legacy) to the **mirror flow** (current). Detect the mode before doing anything:

```bash
ls -la CONTEXT.md docs 2>/dev/null
```

- **Regular files** — or `.tabularium-project` exists → follow the **current contract**.
- **Symlinks into `.knowledge/`** → follow the **legacy contract** at the end.

## Current contract — mirror flow

Documentation (`CONTEXT.md`, `docs/` — specs, ADRs, task files, review artifacts) consists of **regular files in the code repository**. There is ONE commit flow:

- Edit docs and code together and commit together, in the same branch and PR. `task_NN.md` status flips and `## Result` sections are ordinary repo commits — no second repository, no separate docs push.
- After every push to `main` (any merge type or direct push; never feature branches), GitHub Actions mirrors the paths listed in `.tabularium-export` into `tabularium/projects/<project>/mirror/`. This is automatic — **never sync manually**.
- The mirror is **read-only**. Never edit `projects/<project>/mirror/` in tabularium; the next sync overwrites it. Content worth editing belongs either in the code repo (project docs) or in tabularium's editorial areas.
- Editorial areas are edited directly in tabularium and pushed to its `main`: `projects/<project>/notes/` (project notes that don't belong to the repo) and `shared/` (cross-project standards). `registry/projects.json` whitelists which repository may publish to which project.

### The export contract

| File in the code repo | Purpose |
| --- | --- |
| `.tabularium-project` | Exactly the project name — the key under `projects/` and in the tabularium registry |
| `.tabularium-export` | What the repo publishes: one path per line, directories recursive, `!pattern` lines are excludes (rsync/gitignore-like), `#` comments |
| `.github/workflows/tabularium-sync.yml` | Thin caller of tabularium's reusable sync workflow |

Only committed files can be exported (the sync reads a checkout of the merged commit), and symlinks are rejected. When adding a new exported artifact (e.g. an OpenAPI file), update `.tabularium-export` in the same PR.

### Anti-patterns (current mode)

- Creating symlinks for `CONTEXT.md`/`docs`, mounting `.knowledge/`, or running a bootstrap script — that is the retired flow.
- Editing or committing anything under `projects/<project>/mirror/` in tabularium.
- Splitting a docs change out of the PR that motivated it "to sync faster" — the mirror updates on merge; in-flight state living only in the branch is correct.
- Pointing `.tabularium-project` at a different project's folder.

## Legacy contract — symlink workspace (repos not yet migrated)

Until a repo is migrated, it mounts the central repository as a sparse checkout at `.knowledge/` (gitignored) and exposes `CONTEXT.md` and `docs` as versioned symlinks. In that mode:

1. **Code changes** → committed in the code repository, as always.
2. **Documentation changes** (anything under the symlinks, including `task_NN.md` status flips) → committed inside the workspace, never in the code repo:

```bash
git -C .knowledge status
git -C .knowledge add projects/<project>
git -C .knowledge commit -m "docs: <what changed>"
git -C .knowledge push origin main
```

- An unpushed status flip is invisible to every other session — push in the same breath.
- A rejected push means another session moved first: `git -C .knowledge fetch origin main && git -C .knowledge rebase origin/main`, then push. Never force-push.
- If `.knowledge/` or the symlinks are missing, run `scripts/knowledge-bootstrap.sh` (the remote URL now points to `tabularium`; the old `knowledge` URL still redirects).
- Never replace a symlink with a real file, and never commit `.knowledge/`.

## Migrating a legacy repo to the mirror flow

Follow `templates/repo/` and the README in tabularium. In short: flush pending `.knowledge` commits; copy `projects/<project>/{CONTEXT.md,docs}` from tabularium into the repo as real files; remove the symlinks, `.knowledge` mount, bootstrap script and `.gitignore` entry; add `.tabularium-project`, `.tabularium-export`, and the sync workflow; register the project as `active: true` in `registry/projects.json`; merge to `main` and verify the first sync populates `mirror/`.
