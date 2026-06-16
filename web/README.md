# Skills catalog

A static web catalog for the skills in this repository. It parses every `skills/**/SKILL.md` frontmatter into a single index, then renders search, filtering, setup install commands, and setup contents. Built with [Astro](https://astro.build); the interactive parts are plain client scripts, so the output is static HTML/CSS/JS.

## Quick start

```bash
cd web
npm install
npm run dev      # http://localhost:4321 — regenerates the index, then serves
```

Other commands:

```bash
npm run build:index   # parse SKILL.md files -> src/data/skills.json
npm run build         # build:index runs first, then a static export to web/dist
npm run preview       # serve the production build locally
```

Routes:

- `/` - searchable skill catalog with workflow phase and tag filters.
- `/setups/` - OS-specific install commands and the skills included in each setup preset.

## How it works

1. `scripts/build-index.mjs` finds every `skills/**/SKILL.md`, parses its frontmatter with `gray-matter`, and writes `src/data/skills.json` — the skills plus facet counts (collections, tags). Internal skills (`metadata.internal: true`) are excluded.
2. The single category axis is the skill's **collection** (its workflow phase or domain folder: `00-setup`, `01-discovery`, `05-implementation-loop`, `10-marketing`, and so on). `COLLECTION_LABELS` in the build script maps each to a friendly label, and each collection carries its recommended install command (`bunx skills add marcioaltoe/skills/skills/<collection>`).
3. **Metadata** — `author`, curated domain tags, and upstream provenance — comes from [`skills-registry.json`](../skills-registry.json) at the repo root: one entry per skill keyed by name. `tags` is our classification, used by default; each skill's own frontmatter `metadata.tags` (`authorTags`) is surfaced only when "Include author tags" is on. Curate it in one place without editing every `SKILL.md`.
4. Registry entries that carry a `repo`/`path`/`ref` get an `upstream` field and a `⇅ synced` badge in the UI (see the upstream-sync section in the root README).
5. `src/pages/index.astro` renders all cards flat; one inline script handles search, the collection pills, Group (none/collection/author) and Sort (name A-Z/Z-A), the tag filter (matches all selected), the author-tags toggle, and copy-install for a single skill or a whole workflow phase.
6. `src/pages/setups.astro` reads `setups/_index.txt` and each `setups/<slug>.txt` file at build time, then cross-references `src/data/skills.json` so setup contents stay tied to the canonical skill index.

`src/data/skills.json` is generated and git-ignored; it is rebuilt on every `dev` and `build`.

## Deploy

`.github/workflows/deploy-pages.yml` builds the catalog and publishes `web/dist` to GitHub Pages on every push to `main` that touches `skills/**` or `web/**`. One-time setup: repo **Settings → Pages → Source = "GitHub Actions"**. Dev and preview serve from the root (`http://localhost:4321`); the deploy sets `PAGES_BASE=/skills` so the site publishes under `marcioaltoe.github.io/skills/`.
