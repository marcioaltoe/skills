# Skills catalog

A static, searchable web catalog for the skills in this repository. It parses every `skills/**/SKILL.md` frontmatter into a single index, then renders a card grid with full-text search and filtering by setup, collection, and tag. Built with [Astro](https://astro.build); the only interactive part is one client script, so the output is plain static HTML/CSS/JS.

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

## How it works

1. `scripts/build-index.mjs` finds every `skills/**/SKILL.md`, parses its frontmatter with `gray-matter`, and writes `src/data/skills.json` — the skills plus facet counts (collections, tags). Internal skills (`metadata.internal: true`) are excluded.
2. The single category axis is the skill's **collection** (its folder: `dev-backend`, `dev-frontend`, …). `COLLECTION_LABELS` in the build script maps each to a friendly label, and each collection carries its group install command (`bunx skills add marcioaltoe/skills/skills/<collection>`).
3. **Tags** come from two sources kept separate: `tags` is our curated classification from [`skills-tags.json`](../skills-tags.json) (a `{ skills: { "<name>": ["frontend", …] } }` map), used by default; `authorTags` is each skill's own frontmatter `metadata.tags`, surfaced only when "Include author tags" is on. Curate the overlay in one place without editing every `SKILL.md`.
4. If `skills-sources.json` exists at the repo root, skills listed there get an `upstream` field and a `⇅ synced` badge in the UI (see the upstream-sync section in the root README).
5. `src/pages/index.astro` renders all cards flat; one inline script handles search, the collection pills, Group (none/collection/author) and Sort (name A–Z/Z–A), the tag filter (matches all selected), the author-tags toggle, and copy-install for a single skill or a whole collection — no UI framework.

`src/data/skills.json` is generated and git-ignored; it is rebuilt on every `dev` and `build`.

## Deploy

`.github/workflows/deploy-pages.yml` builds the catalog and publishes `web/dist` to GitHub Pages on every push to `main` that touches `skills/**` or `web/**`. One-time setup: repo **Settings → Pages → Source = "GitHub Actions"**. The site serves from `/skills` (set by `PAGES_BASE`); override with `PAGES_BASE=/ npm run build` to serve from root.
