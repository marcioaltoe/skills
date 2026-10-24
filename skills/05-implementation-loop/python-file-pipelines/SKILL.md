---
name: python-file-pipelines
description: Implement Python file ingestion, reconciliation, and deterministic report pipelines for CSV, XML, ZIP, SQLite, XLSX, and DOCX. Use for large-file parsing, exact monetary values, incomplete evidence, dry runs, cache isolation, and safe report publication. Do not use for one-off office file creation or to define accounting or tax rules.
license: CC-BY-4.0
metadata:
  category: python
  tags: [python, data-processing, database, testing, security]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Python file pipelines

Separate discovery, parsing, normalization, domain evaluation, and rendering. Keep domain rules and source-layout contracts in their owning project; this skill supplies engineering boundaries, not fiscal conclusions or client-specific configuration.

## Establish evidence and resource limits

1. Read the accepted-input contract, dependency allowlist, rules/configuration, output schema, filesystem ownership, and verification commands. Load `python-services` for package, CLI, worker, and test boundaries.
2. Define the unit of completeness: file set, entity, establishment, period, or another project-owned scope. Distinguish missing, malformed, unsupported, cancelled, and valid-empty inputs. An unreadable source is not proof that an event did not happen.
3. Identify input encoding, date conventions, decimal separators, stable identifiers, schema versions, expected volume, and maximum resource budgets. Retrieve documentation for the installed parser/writer before using format-specific APIs.
4. Read from explicit roots. Keep sources immutable and output paths within their authorized destination. Customer documents and credentials stay outside public skill examples and external services unless separately authorized.

## Parse without hiding failures

- Stream records where the format allows it. Bound bytes, member count, rows, depth, and cumulative expanded archive size according to the input contract; avoid loading an entire yearly archive or workbook by default.
- Inspect ZIP members before processing. Reject traversal, absolute paths, symlink extraction, unexpected nested archives, and expansion beyond limits. Prefer reading an allowed member directly to extracting untrusted paths.
- Treat XML as untrusted input. Use the parser's documented protections against external entities and resource exhaustion. Do not enable remote entity resolution. If the allowed standard-library parser cannot meet the threat model, propose an approved hardened dependency or reject that input.
- For text and CSV, make encoding and delimiters explicit. Preserve identifiers such as account numbers and document keys as strings, including leading zeroes. Return an actionable parse failure with source and record position.
- Normalize amounts with integer minor units or `Decimal` from strings. Specify currency scale, rounding mode, and the boundary where rounding occurs. Do not pass money through binary floating point or silently interpret an invalid amount as zero.
- Normalize dates by the source contract. Preserve period coverage and timezone meaning; an apparently recent row does not establish that the complete requested period was supplied.
- Keep source references through normalization so each finding can identify its evidence. Classify recoverable per-record errors explicitly; do not swallow exceptions to produce a plausible total.

## Make evaluation reproducible

Keep business evaluation independent of file formats and transport adapters. Pass normalized records and versioned rules to deterministic functions. Preserve stable ordering and identifiers; document tie-breaking, duplicate resolution, and tolerance rules.

Track coverage separately from findings. Aggregate incomplete evidence within its correct entity and period; return an explicit partial or inconclusive result when required. Do not replace a missing comparison source with an empty dataset and call it a successful reconciliation.

Use input content hashes, program/rule/schema versions, and relevant options in cache identities. File names and modification times alone do not establish input identity. Keep SQLite transactions short, close connections reliably, and define one ownership strategy for shared writes. Give tests and worktrees separate cache locations.

## Publish complete artifacts

1. Compute the result before writing. A simulation returns the proposed destination and effects while leaving source, destination, and persistent state unchanged; report which paths were actually written.
2. Select an installed writer that supports the required scale. For large XLSX output, consider XlsxWriter constant-memory writing or openpyxl write-only mode after checking feature restrictions. Do not add pandas solely to read a small table.
3. Write to a temporary artifact under the destination filesystem, close the writer, reopen/read back the relevant structure, and validate row counts, exact totals, headers, dates, and required metadata before publication.
4. Compare an existing destination before replacement and follow the project's explicit overwrite policy. Handle cross-device moves and operating-system replacement behavior according to that policy. Atomic replacement protects one file, not a multi-file transaction.
5. Record hashes, rules, versions, evidence coverage, and actual effects without leaking credentials or private paths into public logs. Distinguish deterministic logical content from binary identity: office containers may include timestamps and generated metadata.

Treat spreadsheet strings from untrusted input as data. Use the writer's explicit string behavior where text beginning with a formula marker must remain literal. Formula cells and their cached results are different representations; choose read-back checks accordingly.

## Verify representative boundaries

Use synthetic fixtures in `tmp_path` for exact amounts, leading zeroes, encodings, duplicate identities, corrupt XML/ZIP, expansion limits, missing periods, read failures, interrupted output, and simulation immutability. Include at least one independent output read-back for a changed report generator instead of asserting only the writer calls.

Exercise concurrency and platform branches where changed. Test repeated processing and compare semantic results; only compare bytes when the output contract guarantees stable container metadata. Keep optional real-data regressions explicitly marked and separate from hermetic Task Verification.

## Examples

- "Reconcile monthly XML documents against ledger exports." Parse and normalize each source, retain entity/period coverage, evaluate exact identifiers and amounts, and report missing evidence separately from unmatched records.
- "Export a large audit workbook without exhausting memory." Stream rows with the installed writer's compatible mode, check selected cells and totals independently, then publish the complete file.
- "Two commands lock the SQLite cache." Identify connection and cache ownership, isolate worktree/test stores, and test the intended concurrency contract before changing locking or retry policy.

## Sources

- [Python XML security](https://docs.python.org/3/library/xml.html#xml-security)
- [Python ZIP handling](https://docs.python.org/3/library/zipfile.html)
- [Python Decimal](https://docs.python.org/3/library/decimal.html)
- [XlsxWriter memory modes](https://xlsxwriter.readthedocs.io/working_with_memory.html)
- [openpyxl optimized modes](https://openpyxl.readthedocs.io/en/stable/optimized.html)
