# LLM Wiki

Skill collection for applying Andrej Karpathy's LLM Wiki method: a persistent Markdown wiki maintained by an LLM, with raw sources kept separate from curated synthesis.

Primary source researched with Exa: [Andrej Karpathy, `llm-wiki`](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6079205).

## The Method

The method replaces "ask over a pile of raw documents" with a durable intermediate layer: the wiki. The LLM reads new sources, extracts important information, updates entity and concept pages, revises existing synthesis, flags contradictions, and improves the structure over time.

The wiki becomes a compounding artifact. Chat remains useful for exploration, but knowledge that should survive goes into versionable, searchable Markdown files that can be read in Obsidian or from the terminal.

## Layers

```text
wiki/
  AGENTS.md        # wiki rules: taxonomy, format, workflows
  raw/             # original sources or raw captures
  index.md         # navigable catalog
  log.md           # append-only history
  sources/         # one page per source
  entities/        # people, companies, products, projects
  concepts/        # ideas, methods, terms, patterns
  synthesis/       # high-level summaries, comparisons, maps
  questions/       # answers worth preserving
```

## Workflows

### Ingest

1. Add or point to a raw source.
2. Extract metadata, important claims, evidence, and open questions.
3. Search for related pages in the wiki.
4. Create or update `sources/<slug>.md`.
5. Update affected `entities/`, `concepts/`, and `synthesis/` pages.
6. Update `index.md`.
7. Record the operation in `log.md`.

A relevant source can touch many pages. That is expected: the value of the method is incremental maintenance of links and synthesis, not storing an isolated summary.

### Query

1. Start with `index.md`.
2. Search with `qmd` or `rg`.
3. Answer from the pages found.
4. Separate cited fact, synthesis, and inference.
5. Preserve reusable answers in `questions/` or `synthesis/`.
6. Record the query in `log.md` when it produces new durable knowledge.

### Lint

Review periodically:

- contradictions between sources and synthesis
- dated claims that need verification
- orphan pages
- sources missing from the index
- pages with claims but no source links
- duplicate entities or concepts
- open questions that can now be answered

## Skills In This Collection

| Skill                           | Role in the method                                               |
| ------------------------------- | ---------------------------------------------------------------- |
| `llm-wiki-method`               | Orchestrates ingest, query, lint, and wiki conventions.          |
| `llm-wiki-source-capture`       | Captures raw sources, clippings, transcripts, and inbox items.   |
| `llm-wiki-schema`               | Maintains the wiki's `AGENTS.md` or `CLAUDE.md` contract.        |
| `llm-wiki-ingest`               | Compiles sources into pages, claims, entities, and concepts.     |
| `llm-wiki-query`                | Queries the wiki with citations and saves reusable answers.      |
| `llm-wiki-index-log`            | Keeps `index.md` and `log.md` navigable and auditable.           |
| `llm-wiki-dedupe-merge`         | Detects duplicates, missing aliases, and safe merge paths.       |
| `llm-wiki-lint`                 | Checks links, frontmatter, citations, and contradictions.        |
| `llm-wiki-git-sync`             | Versions changes, reviews diffs, and syncs wiki backups.         |
| `exa-web-search-free`           | Finds external sources and current references.                   |
| `firecrawl`                     | Extracts web pages and crawls into clean Markdown for ingestion. |
| `qmd`                           | Searches local Markdown bases with lexical and semantic search.  |
| `obsidian-markdown`             | Writes Obsidian-compatible notes, wikilinks, and callouts.       |
| `obsidian-cli`                  | Interacts with Obsidian vaults from the command line.            |
| `obsidian-bases`                | Creates views for sources, entities, status, and reviews.        |
| `docs-writer`                   | Keeps technical documentation clear and consistent.              |
| `doc-coauthoring`               | Guides collaborative drafting of larger documents and synthesis. |
| `writing-clearly-and-concisely` | Revises prose for clarity and concision.                         |
| `mermaid-syntax`                | Creates Mermaid diagrams embedded in Markdown notes.             |

## Context Copy Policy

Some skills in this collection also remain in their original collections, such as `productivity`, `dev-base-skills`, `write-common`, and `write-tech-doc`.

This duplication is intentional. For installable context collections, use physical copies instead of symlinks because `bunx skills add marcioaltoe/skills/skills/<collection>` may install only the requested subdirectory. A relative symlink pointing outside the collection would be fragile in that flow.

When a shared skill is updated, synchronize the copy in every collection where it appears and validate with:

```bash
bunx skills add ./skills/llm-wiki --list
bunx skills add ./skills/productivity --list
bunx skills add . --list
```

## Installation

```bash
bunx skills add marcioaltoe/skills/skills/llm-wiki -g
```

Install a specific skill:

```bash
bunx skills add marcioaltoe/skills/skills/llm-wiki --skill llm-wiki-method -g
```

## Usage Prompts

Ingest:

```text
Use the llm-wiki method to ingest this source into ~/notes/wiki.
Update related pages, index.md, and log.md.
```

Query:

```text
Query my LLM Wiki in ~/notes/wiki and answer with links to the pages used.
If the answer is reusable, save it in questions/.
```

Lint:

```text
Run a lint pass on the LLM Wiki in ~/notes/wiki.
Look for contradictions, orphan pages, claims without sources, and missing index.md entries.
```

## Operating Rules

- Raw sources live in `raw/` or are referenced with stable URLs or paths.
- Synthesis lives in Markdown, with links close to the claims they support.
- `index.md` and `log.md` are critical infrastructure, not afterthoughts.
- Contradictions must be preserved and explained, not erased.
- Every relevant update should improve future search, navigation, or synthesis.
