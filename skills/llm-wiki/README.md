# LLM Wiki

Core skills for applying Andrej Karpathy's LLM Wiki method: a persistent Markdown wiki maintained by an LLM, with raw sources kept separate from curated synthesis.

Primary source researched with Exa: [Andrej Karpathy, `llm-wiki`](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6079205).

## Install

LLM Wiki work is intentionally composed from four top-level installable sets:

```bash
bunx skills add marcioaltoe/skills/skills/llm-wiki -g
bunx skills add marcioaltoe/skills/skills/writing -g
bunx skills add marcioaltoe/skills/skills/research-tools -g
bunx skills add marcioaltoe/skills/skills/knowledge-tools -g
```

Use local paths while developing:

```bash
bunx skills add ./skills/llm-wiki --list
bunx skills add ./skills/writing --list
bunx skills add ./skills/research-tools --list
bunx skills add ./skills/knowledge-tools --list
```

## Set Layout

| Set               | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `llm-wiki`        | Core ingest, query, lint, schema, index, and git flow. |
| `writing`         | Shared writing, technical docs, and prose quality.     |
| `research-tools`  | MCP-backed web search and scraping helpers.            |
| `knowledge-tools` | Obsidian, QMD, and Mermaid local wiki tools.           |

The LLM Wiki context is a composed install recipe, not a nested folder tree. Skills live in one canonical top-level set and contexts are created by installing several sets together.

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

## Skills

### Core

| Skill                     | Role                                                           |
| ------------------------- | -------------------------------------------------------------- |
| `llm-wiki-method`         | Orchestrates ingest, query, lint, and wiki conventions.        |
| `llm-wiki-source-capture` | Captures raw sources, clippings, transcripts, and inbox items. |
| `llm-wiki-schema`         | Maintains the wiki's `AGENTS.md` or `CLAUDE.md` contract.      |
| `llm-wiki-ingest`         | Compiles sources into pages, claims, entities, and concepts.   |
| `llm-wiki-query`          | Queries the wiki with citations and saves reusable answers.    |
| `llm-wiki-index-log`      | Keeps `index.md` and `log.md` navigable and auditable.         |
| `llm-wiki-dedupe-merge`   | Detects duplicates, missing aliases, and safe merge paths.     |
| `llm-wiki-lint`           | Checks links, frontmatter, citations, and contradictions.      |
| `llm-wiki-git-sync`       | Versions changes, reviews diffs, and syncs wiki backups.       |

### MCPs

| Skill            | Role                                                  |
| ---------------- | ----------------------------------------------------- |
| `exa-web-search` | Runs MCP-backed web search, filtering, and synthesis. |
| `firecrawl`      | Extracts web pages and crawls into clean Markdown.    |

### Tools

| Skill               | Role                                                       |
| ------------------- | ---------------------------------------------------------- |
| `qmd`               | Searches Markdown bases with lexical and semantic search.  |
| `obsidian-markdown` | Writes Obsidian-compatible notes, wikilinks, and callouts. |
| `obsidian-cli`      | Interacts with Obsidian vaults from the command line.      |
| `obsidian-bases`    | Creates views for sources, entities, status, and reviews.  |
| `mermaid-syntax`    | Creates Mermaid diagrams embedded in Markdown notes.       |

### Shared Writing Set

Install `writing` with this context for `docs-writer`, `doc-coauthoring`, `writing-clearly-and-concisely`, and other reusable writing skills.

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
