---
name: llm-wiki-ingest
description: Ingest raw sources into an LLM Wiki by extracting claims, entities, concepts, summaries, links, and contradictions. Use when processing files from raw/ or inbox/, updating source pages, or merging new evidence into existing wiki pages.
metadata:
  category: knowledge-management
  tags: [llm-wiki, ingest, extraction, synthesis, provenance]
  version: 0.1.0
  author: Marcio Altoé
---

# LLM Wiki Ingest

Use this skill to compile a raw source into the wiki.

## Workflow

1. Read the wiki schema and `index.md`.
2. Read the raw source. If it is long, outline it first and then process sections.
3. Extract structured notes:
   - source metadata
   - 5-15 key claims
   - named entities
   - reusable concepts
   - evidence snippets
   - contradictions or tensions
   - open questions
4. Search existing wiki pages for each important entity and concept. Prefer `qmd`; use `rg` when qmd is unavailable.
5. Create or update the source summary page in `wiki/sources/`.
6. Merge new evidence into existing entity/concept pages when they already exist. Create new pages only for durable concepts or entities.
7. Update synthesis pages only when the source changes the broader interpretation.
8. Add aliases for abbreviations, translations, common spellings, and product names when useful.
9. Update `index.md`.
10. Append an ingest entry to `log.md`.

## Source page template

```markdown
---
title: Source Title
type: source
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
source_url:
source_type:
aliases: []
tags: []
---

# Source Title

## Summary

## Key Claims

## Entities

## Concepts

## Evidence

## Contradictions Or Tensions

## Open Questions

## Pages Touched
```

## Merge rules

- Preserve existing sourced claims unless a newer source contradicts them.
- Add source links near the claims they support.
- Mark contradictions explicitly instead of silently choosing one source.
- Keep raw-source details in source pages; keep reusable understanding in entity, concept, and synthesis pages.
- If extraction depth is unclear, default to standard depth for one source and shallow depth for batches.

## Stop conditions

Stop and ask the user before ingesting when:

- the source is private or sensitive and its handling rules are unclear
- the source quality is too poor to summarize reliably
- the source would create many pages in a taxonomy the schema does not define
