---
name: data-sync-workflows
description: Use when designing, planning, implementing, or reviewing data synchronization workflows, ERP imports, incremental syncs, backfills, reconciliation jobs, or scheduled ingestion. Covers source of truth, checkpoints, idempotency, deduplication, retries, repair, evidence, and operational controls. Do not use for one-off pure CRUD code.
metadata:
  category: backend
  tags: [backend, database, sync, jobs]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Data Sync Workflows

Use this skill when data moves between systems and the application must preserve correctness across retries, partial failure, and repeated runs.

## Design Questions

- What is the source of truth for each field?
- Is the sync full, incremental, event-driven, scheduled, or manual?
- What is the stable identity key across systems?
- What checkpoint or cursor proves where the last successful run stopped?
- Can the operation be retried safely?
- What does a partial success mean?
- How will operators see what changed, failed, skipped, or needs repair?

## Core Design Rules

- Define identity and idempotency before implementation.
- Store checkpoints only after durable success for the covered range.
- Separate fetch, normalize, validate, apply, and evidence steps.
- Make every write idempotent or protected by a deterministic conflict rule.
- Keep raw external data out of domain code after normalization.
- Design backfill and replay paths before production use.
- Treat deletion, missing records, and tombstones as explicit product decisions.

## Workflow Shape

```text
load checkpoint
fetch external page or range
normalize records
validate records
deduplicate by stable identity
apply idempotent writes
record per-record evidence
advance checkpoint
emit run summary
```

## Checkpoint Rules

- Use monotonic cursors, updated-at windows, sequence IDs, or source-provided tokens when available.
- Include enough metadata to resume without rereading ambiguous ranges.
- For time-window syncs, use overlap windows and deduplicate by stable identity.
- Never advance the checkpoint past unapplied records.

## Failure Handling

- Classify failures as retryable, permanent, data-quality, auth/config, or human decision required.
- Keep per-record failures visible instead of collapsing the whole run into one generic error.
- Use bounded retries for transient infrastructure errors.
- Stop on repeated deterministic failures and preserve evidence for repair.

## Evidence

Each run should produce a summary with:

- run ID
- source system
- checkpoint before and after
- records fetched, created, updated, skipped, failed
- retry count
- failure categories
- links or IDs for detailed diagnostics

## Review Checklist

- Identity key is stable and documented.
- Sync writes are idempotent.
- Checkpoint advancement is safe.
- Backfill/replay behavior is defined.
- Partial failures are visible and repairable.
- Tests cover duplicate input, out-of-order input, missing fields, retry, and resume.
