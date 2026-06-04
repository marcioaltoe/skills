---
name: llm-wiki-method
description: Build and maintain Karpathy-style LLM wikis as persistent Markdown knowledge bases. Use when ingesting sources, querying a personal wiki, updating Obsidian notes, or running a wiki health check.
metadata:
  category: knowledge-management
  tags: [llm-wiki, knowledge-base, obsidian, markdown, research]
  version: 0.1.0
  author: marcioaltoe
---

# LLM Wiki Method

Use this skill to maintain a persistent Markdown wiki where the agent reads raw sources, synthesizes them into durable pages, updates related notes, and keeps the knowledge base searchable over time.

## Mental model

- Treat the wiki as the durable artifact, not the chat transcript.
- Keep raw sources separate from synthesized wiki pages.
- Use the agent to write and maintain the wiki; use the user for source selection, priorities, and judgment calls.
- Prefer Markdown files that work well in Obsidian and can also be searched from the command line.
- Update many small connected pages when a source affects many concepts.

## Suggested structure

```text
wiki/
  AGENTS.md
  raw/
  index.md
  log.md
  sources/
  entities/
  concepts/
  synthesis/
  questions/
```

- `raw/`: original PDFs, transcripts, exports, scraped pages, or links to immutable source copies.
- `sources/`: one summary page per source, with bibliographic metadata and source-specific claims.
- `entities/`: people, companies, products, projects, teams, places, and other named things.
- `concepts/`: reusable ideas, patterns, principles, terms, and methods.
- `synthesis/`: higher-level essays, comparisons, timelines, maps, and evolving conclusions.
- `questions/`: useful answers that should persist beyond the chat.
- `index.md`: navigable catalog of major sources, concepts, entities, and open threads.
- `log.md`: append-only chronological record of ingests, queries, lint passes, and major updates.

## Ingest workflow

1. Confirm the source and the target wiki root.
2. Save or reference the raw source before synthesis when feasible.
3. Extract source metadata: title, author, date, URL/path, access date, source type, and reliability notes.
4. Search the existing wiki for related entities, concepts, summaries, and contradictions. Use `qmd` when available; otherwise use `rg`.
5. Create or update one `sources/<slug>.md` page with:
   - source metadata
   - concise summary
   - key claims
   - evidence or quotes kept short
   - links to related wiki pages
   - unresolved questions
6. Update related `entities/`, `concepts/`, and `synthesis/` pages. Add only what the source supports.
7. Update `index.md` with new or changed pages.
8. Append an entry to `log.md` with date, source, pages touched, and notable open questions.

## Query workflow

1. Read `index.md` first to orient the search.
2. Search the wiki with `qmd` or `rg`; retrieve the smallest set of pages that can answer the question.
3. Answer from wiki evidence, linking to source and synthesis pages.
4. Distinguish sourced facts, synthesis, and inference.
5. If the answer is useful beyond the chat, create or update a page in `questions/` or `synthesis/`.
6. Append the query and any durable page updates to `log.md`.

## Lint workflow

Run this periodically or after large ingest batches.

Check for:

- contradictions between source summaries and synthesis pages
- stale dated claims that need verification
- source pages not linked from `index.md`
- entity or concept pages with no backlinks
- pages with claims but no source links
- duplicate pages for the same entity or concept
- missing cross-links between obviously related pages
- unresolved questions that now have enough evidence to answer

Write a short lint report in `synthesis/wiki-health/<date>.md` when findings are non-trivial, then update affected pages.

## Page conventions

Use this frontmatter where helpful:

```yaml
---
title: Page Title
type: source | entity | concept | synthesis | question
status: draft | active | needs-review | archived
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources:
  - "[[sources/source-slug]]"
tags:
  - llm-wiki
---
```

## Guardrails

- Do not paste large raw source dumps into synthesis pages.
- Do not collapse disagreement into a single tidy conclusion; preserve contradictions with source links.
- Do not update pages you have not read in this turn unless the edit is mechanical and obvious.
- Date time-sensitive claims.
- Prefer small page updates over broad rewrites.
- Keep source links close to the claims they support.

## Related skills

- Use `llm-wiki-source-capture` to collect raw sources and inbox items.
- Use `llm-wiki-schema` to create or tune the wiki's `AGENTS.md`/`CLAUDE.md`.
- Use `llm-wiki-ingest` for source compilation into pages.
- Use `llm-wiki-query` for cited answers and save-back.
- Use `llm-wiki-index-log` to maintain `index.md` and `log.md`.
- Use `llm-wiki-dedupe-merge` to resolve duplicate entities and concepts.
- Use `llm-wiki-lint` for wiki health checks.
- Use `llm-wiki-git-sync` for versioning and backup.
- Use `exa-web-search-free` to discover external sources.
- Use `firecrawl` to scrape or crawl source pages into clean Markdown.
- Use `qmd` to search the wiki as it grows.
- Use `obsidian-markdown`, `obsidian-cli`, and `obsidian-bases` for Obsidian vault workflows.
- Use `docs-writer`, `doc-coauthoring`, and `writing-clearly-and-concisely` for durable prose.
- Use `mermaid-syntax` for diagrams that should live directly in Markdown.

## References

- Andrej Karpathy, [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6079205)
