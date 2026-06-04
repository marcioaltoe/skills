---
name: llm-wiki-source-capture
description: Capture web pages, PDFs, transcripts, notes, and inbox items into an LLM Wiki raw source layer. Use when adding sources, clipping articles, importing files, normalizing source metadata, or preparing raw/ for ingestion.
metadata:
  category: knowledge-management
  tags: [llm-wiki, sources, web-clipper, ingestion, provenance]
  version: 0.1.0
  author: Marcio Altoé
---

# LLM Wiki Source Capture

Use this skill to collect source material before it is compiled into wiki pages.

## Workflow

1. Identify the wiki root and source target:
   - `raw/` for immutable source material
   - `inbox/` for untriaged notes, quick captures, and partial thoughts
   - `raw/assets/` for downloaded images or attachments
2. Preserve the original source whenever feasible. Do not rewrite raw source content during capture.
3. Add or normalize frontmatter for captured Markdown:

```yaml
---
title: Source Title
source_url: https://example.com
source_type: article | paper | transcript | note | pdf | doc | image
author:
captured: YYYY-MM-DD
status: unprocessed
tags:
  - raw
---
```

4. For web sources, prefer clean Markdown extraction. Use `firecrawl` for scraping/crawling and `exa-web-search` for discovery.
5. For Obsidian Web Clipper captures, keep the clipping in `raw/` or `inbox/` and only add missing metadata.
6. For YouTube or podcast transcripts, preserve title, creator/channel, URL, publish date if available, and transcript source.
7. For images, download local copies when they carry evidence the LLM may need later. Link them from the raw source.
8. Append a capture entry to `log.md` only when the source is now ready for ingestion or needs human review.

## Capture decisions

- Put stable external references in `raw/` even if the source is also online.
- Put quick notes and half-formed thoughts in `inbox/`; process them later into raw sources or wiki pages.
- Mark low-quality captures as `status: needs-review` instead of ingesting them immediately.
- Do not ingest duplicates; link to the existing raw file and note the duplicate in `log.md`.

## Handoff to ingest

Before invoking ingest, provide:

- raw source path
- source type
- reliability notes
- known related wiki pages
- whether the user wants high, normal, or shallow extraction depth
