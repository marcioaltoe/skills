---
name: llm-wiki-lint
description: Health-check an LLM Wiki for broken links, orphan pages, stale claims, malformed frontmatter, duplicates, missing aliases, weak citations, and contradictions. Use when running wiki maintenance or preparing a cleanup report.
metadata:
  category: knowledge-management
  tags: [llm-wiki, lint, maintenance, contradictions, quality]
  version: 0.1.0
  author: Marcio Altoé
---

# LLM Wiki Lint

Use this skill to keep the wiki healthy as it compounds.

## Checks

Run lightweight checks first:

- malformed YAML frontmatter
- missing required frontmatter fields
- broken wikilinks
- double-nested wikilinks like `[[[[page]]]]`
- source pages missing from `index.md`
- pages without inbound links
- pages with no source links
- duplicate or near-duplicate titles
- missing aliases on important entities and concepts
- stale `updated` dates after edits

Run deeper checks when requested or after large batches:

- contradictions between pages
- stale claims superseded by newer sources
- synthesis pages that no longer cite enough evidence
- concepts repeatedly mentioned but lacking pages
- open questions that now have evidence

## Workflow

1. Read the schema so lint rules match the wiki's conventions.
2. Build an inventory of Markdown pages by type.
3. Run mechanical checks with shell tools where possible.
4. Read affected pages before proposing semantic fixes.
5. Group findings by severity:
   - error: broken navigation or corrupted metadata
   - warning: weak structure, missing aliases, orphan pages
   - info: improvement opportunity
6. Apply safe mechanical fixes when requested.
7. Write a lint report to `wiki/wiki-health/YYYY-MM-DD.md` for non-trivial findings.
8. Update `index.md` and append a `lint` entry to `log.md`.

## Safe auto-fixes

- fix double-nested wikilinks
- update stale index entries
- add missing `updated` dates after edits
- normalize obvious slug formatting
- add aliases that are directly present in page text

## Human review required

- merging duplicate pages
- resolving contradictions
- deleting pages
- changing page type or folder taxonomy
- marking a claim obsolete

## Report template

```markdown
# Wiki Health YYYY-MM-DD

## Summary

## Errors

## Warnings

## Info

## Recommended Fix Order

## Follow-up Sources To Find
```
