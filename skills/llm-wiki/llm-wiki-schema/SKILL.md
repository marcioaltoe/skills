---
name: llm-wiki-schema
description: Create and maintain the AGENTS.md or CLAUDE.md schema for a Karpathy-style LLM Wiki. Use when initializing a wiki, changing page conventions, adding workflows, defining folders, or tuning how agents ingest, query, lint, and log.
metadata:
  category: knowledge-management
  tags: [llm-wiki, schema, agents-md, conventions, obsidian]
  version: 0.1.0
  author: Marcio Altoé
---

# LLM Wiki Schema

Use this skill to create or revise the wiki's operating contract. The schema is the prompt file that turns a general agent into a disciplined wiki maintainer.

## Required schema sections

Create or maintain these sections in `AGENTS.md` or `CLAUDE.md` at the wiki root:

- purpose and scope of the wiki
- folder map and ownership rules
- page types and frontmatter contract
- naming and slug conventions
- wikilink rules
- source citation rules
- ingest workflow
- query and save-back workflow
- lint workflow
- index and log maintenance
- merge, dedupe, and contradiction policy
- user review points

## Default folders

```text
raw/
inbox/
wiki/
  sources/
  entities/
  concepts/
  synthesis/
  questions/
  wiki-health/
raw/assets/
index.md
log.md
```

Use a flatter layout if the wiki is small, but keep raw sources separate from generated wiki pages.

## Page frontmatter contract

```yaml
---
title: Page Title
type: source | entity | concept | synthesis | question
status: draft | active | needs-review | archived
created: YYYY-MM-DD
updated: YYYY-MM-DD
aliases: []
sources: []
tags: []
reviewed: false
---
```

## Schema update workflow

1. Read the current schema before editing.
2. Identify the operational problem: missing folder, bad links, duplicate pages, weak citations, too much extraction, stale index, or unclear review policy.
3. Make the smallest rule change that prevents recurrence.
4. Add an example only when it removes ambiguity.
5. Update `log.md` with a `schema` entry that explains what changed and why.

## Guardrails

- Do not encode project-specific temporary preferences as permanent rules.
- Do not let the schema contradict the actual folder structure.
- Keep commands and naming conventions copy-pasteable.
- Prefer rules the agent can verify with file reads or searches.
