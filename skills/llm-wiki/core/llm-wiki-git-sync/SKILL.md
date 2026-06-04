---
name: llm-wiki-git-sync
description: Version and back up an LLM Wiki with git. Use when committing wiki ingests, reviewing wiki diffs, creating backup branches, syncing a private wiki repo, or auditing what the agent changed.
metadata:
  category: knowledge-management
  tags: [llm-wiki, git, backup, audit, versioning]
  version: 0.1.0
  author: marcioaltoe
---

# LLM Wiki Git Sync

Use this skill to keep wiki changes reviewable and recoverable.

## Workflow

1. Check git status before making wiki edits.
2. Keep raw sources, generated wiki pages, schema, index, and log in version control unless the schema says otherwise.
3. Keep local caches, model indexes, and tool state out of git:

```gitignore
.wiki/
.qmd/
.firecrawl/
node_modules/
```

4. After an ingest/query/lint run, review the diff by category:
   - raw sources added
   - source summaries created
   - entity/concept pages updated
   - synthesis/question pages added
   - `index.md` rebuilt
   - `log.md` appended
5. Commit coherent batches with clear messages:

```text
ingest: add source-name
query: save synthesis on topic
lint: fix wiki links and aliases
schema: tune ingest conventions
```

6. Push only when the user wants backup/sync or the wiki repo policy requires it.

## Review checklist

- Raw sources were not silently rewritten.
- Source links stayed close to supported claims.
- `index.md` reflects added/renamed pages.
- `log.md` explains the operation.
- No cache or credential files are staged.
- Large binary assets are intentional.

## Guardrails

- Do not force-push a wiki backup repo without explicit user approval.
- Do not commit private or sensitive raw sources unless the wiki policy allows it.
- Do not squash unrelated ingest batches together if separate commits would make review easier.
