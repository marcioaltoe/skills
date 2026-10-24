# Curated source

This skill adapts the official OpenClaw gogcli Agent Skills at tag `v0.47.0`:

- Core: `.agents/skills/gog/SKILL.md` (stored in `references/automation.md`).
- Services: `.agents/skills/gog-{gmail,calendar,drive,docs,sheets,slides,contacts}/SKILL.md`.
- Source repository: https://github.com/openclaw/gogcli/tree/v0.47.0/.agents/skills
- License: see `LICENSE`.

The curated entry point consolidates these services into one installable skill. The registry uses `update: off` to preserve this layout. The locked folder SHA records the upstream core baseline, not a digest of this adapted folder. Refresh the core and service references together after reviewing changes; do not replace this directory with the core skill alone.

Private workflow references informed account selection, approval boundaries, attachment handling, and preserving file identity. No private accounts, credentials, signatures, or workspace paths are distributed.
