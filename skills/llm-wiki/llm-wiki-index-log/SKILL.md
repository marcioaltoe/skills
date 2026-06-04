---
name: llm-wiki-index-log
description: Maintain index.md and log.md for an LLM Wiki. Use when rebuilding catalogs, appending ingest/query/lint history, making wiki activity parseable, or fixing missing index entries.
metadata:
  category: knowledge-management
  tags: [llm-wiki, index, log, catalog, audit-trail]
  version: 0.1.0
  author: Marcio Altoé
---

# LLM Wiki Index And Log

Use this skill to keep the wiki navigable and auditable.

## `index.md`

`index.md` is content-oriented. It should help the agent and human find the right pages quickly.

Recommended sections:

- Sources
- Entities
- Concepts
- Synthesis
- Questions
- Open Threads
- Recently Updated

Each entry should include:

```markdown
- [[concepts/example-concept]] - One-line summary. Sources: 3. Updated: YYYY-MM-DD.
```

## `log.md`

`log.md` is chronological and append-only. Use parseable headings:

```markdown
## [YYYY-MM-DD] ingest | Source Title

- Source: [[sources/source-title]]
- Pages touched: [[concepts/x]], [[entities/y]]
- Notes:
- Open questions:
```

Valid operation labels:

- `capture`
- `ingest`
- `query`
- `save-back`
- `lint`
- `schema`
- `merge`
- `reindex`

## Rebuild workflow

1. Enumerate wiki Markdown pages, excluding `raw/`, assets, and archived files unless requested.
2. Read frontmatter and first heading/summary for each page.
3. Group by page type.
4. Detect missing or stale entries.
5. Rewrite `index.md` in a stable order.
6. Append a `reindex` entry to `log.md`.

## Guardrails

- Do not use `log.md` as a dumping ground for long analysis.
- Do not remove old log entries except to fix formatting corruption.
- Keep index summaries short enough to scan.
- If `index.md` and actual files disagree, trust the files and rebuild the index.
