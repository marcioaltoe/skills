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

1. `scripts/build-index.mjs` finds every `skills/**/SKILL.md`, parses its frontmatter with `gray-matter`, and writes `src/data/skills.json` — the skills plus facet counts (setups, collections, categories, tags). Internal skills (`metadata.internal: true`) are excluded.
2. Each skill is assigned a coarse **setup** bucket (Backend, Frontend, Fullstack, …) derived from its collection folder. Edit `SETUP_BY_COLLECTION` in the build script to change the mapping.
3. **Tags** come from each skill's frontmatter `metadata.tags` merged with a curated overlay at the repo root, [`skills-tags.json`](../skills-tags.json) — a `{ skills: { "<name>": ["frontend", "fullstack", …] } }` map. Curate cross-cutting filter tags there in one place, without editing every `SKILL.md`. Any tag string works; the file's `vocabulary` field documents the suggested set.
4. If `skills-sources.json` exists at the repo root, skills listed there get an `upstream` field and a `⇅ synced` badge in the UI (see the upstream-sync section in the root README).
5. `src/pages/index.astro` renders the cards server-side and groups them by setup. A single inline script handles search, the setup pills, the collection/sort selects, the tag filter (matches all selected tags), and the copy-install button — no UI framework.

`src/data/skills.json` is generated and git-ignored; it is rebuilt on every `dev` and `build`.

## Deploy

`.github/workflows/deploy-pages.yml` builds the catalog and publishes `web/dist` to GitHub Pages on every push to `main` that touches `skills/**` or `web/**`. One-time setup: repo **Settings → Pages → Source = "GitHub Actions"**. The site serves from `/skills` (set by `PAGES_BASE`); override with `PAGES_BASE=/ npm run build` to serve from root.
