---
name: llm-wiki-dedupe-merge
description: Detect and merge duplicate or overlapping LLM Wiki pages. Use when lint finds duplicate entities/concepts, aliases are missing, cross-language pages overlap, or ingestion created competing pages for the same topic.
metadata:
  category: knowledge-management
  tags: [llm-wiki, dedupe, merge, aliases, wikilinks]
  version: 0.1.0
  author: Marcio Altoé
---

# LLM Wiki Dedupe And Merge

Use this skill to prevent entity and concept sprawl.

## Candidate signals

Look for duplicates using:

- same slug with different casing or punctuation
- abbreviations and expanded names
- translations or cross-language variants
- overlapping aliases
- pages linking to the same source claims
- short stub pages whose content is fully contained in another page
- folder pollution, such as `concepts/concepts-name.md`

## Workflow

1. Find duplicate candidates with filename, title, aliases, backlinks, and source overlap.
2. Read each candidate page before deciding.
3. Choose the canonical page based on:
   - most complete sourced content
   - better title
   - stronger backlinks
   - schema folder fit
4. Merge unique claims into the canonical page.
5. Preserve all useful aliases.
6. Preserve source provenance near claims.
7. Replace duplicate pages with redirects or delete them only after updating inbound links.
8. Update all wikilinks that point to duplicate pages.
9. Update `index.md`.
10. Append a `merge` entry to `log.md`.

## Canonical alias pattern

```yaml
aliases:
  - Short Name
  - Expanded Name
  - Alternate spelling
  - Translation
```

## Redirect note pattern

Use a redirect note when deleting would be risky:

```markdown
---
title: Duplicate Title
type: redirect
status: archived
aliases: []
---

This page was merged into [[concepts/canonical-page]].
```

## Guardrails

- Do not merge pages only because titles are similar.
- Do not drop contradictions during merge.
- Do not delete a duplicate until inbound links have been updated or a redirect exists.
- Do not overwrite user-reviewed pages unless the user approves or the schema allows it.
