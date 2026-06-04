---
name: llm-wiki-query
description: Query an LLM Wiki and optionally save useful answers back into the wiki. Use when answering questions from wiki pages, comparing concepts, tracing sources, generating cited synthesis, or filing durable query results.
metadata:
  category: knowledge-management
  tags: [llm-wiki, query, synthesis, citations, save-back]
  version: 0.1.0
  author: Marcio Altoé
---

# LLM Wiki Query

Use this skill to answer questions from a compiled wiki and preserve useful answers.

## Workflow

1. Read the wiki schema and `index.md`.
2. Classify the query:
   - `wiki`: answer from compiled pages
   - `raw`: exact lookup in source material
   - `hybrid`: use both compiled pages and raw sources
3. Search for relevant pages. Prefer `qmd` with hybrid lexical and semantic search; use `rg` for exact names, aliases, and dates.
4. Read the top relevant pages fully enough to answer. Do not rely on snippets alone for important claims.
5. Answer with:
   - concise direct response
   - links to supporting wiki pages
   - clear separation of sourced facts, synthesis, and inference
   - open questions when evidence is insufficient
6. If the answer should persist, save it as:
   - `wiki/questions/<slug>.md` for question-shaped answers
   - `wiki/synthesis/<slug>.md` for reusable analysis
7. Update `index.md` and append a `query` or `save-back` entry to `log.md`.

## Citation rules

- Use wiki links for internal pages: `[[concepts/example]]`.
- Link source pages near claim clusters, not only at the end.
- For raw source claims not yet compiled, identify the raw file path or URL.
- Mark inference explicitly when the answer combines multiple sources.

## Save-back template

```markdown
---
title: Question Or Synthesis Title
type: question
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: []
aliases: []
tags: []
---

# Question Or Synthesis Title

## Answer

## Evidence

## Related Pages

## Open Questions
```

## Anti-patterns

- Do not answer from memory when the wiki has relevant pages.
- Do not cite a page you did not inspect.
- Do not save every chat answer; save durable synthesis only.
- Do not overwrite existing synthesis without checking source links and update history.
