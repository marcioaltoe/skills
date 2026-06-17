---
name: observability-audit
description: "Use when reviewing whether code has enough operational evidence: structured logs, correlation IDs, metrics, traces, run summaries, error normalization, and safe redaction. Trigger for production readiness reviews, sync/job reviews, incident-prone code, or before delivery of backend workflows. Do not use for visual UI-only review."
metadata:
  category: observability
  tags: [observability, logging, qa, backend]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Observability Audit

Use this skill to verify that a change can be operated after it ships.

## Audit Questions

- Can an operator tell whether the workflow ran?
- Can failures be grouped by cause?
- Can a user report be traced to request, job, tenant, account, or external system IDs?
- Are retries, partial failures, and skipped records visible?
- Are secrets and personal data excluded from logs and evidence?
- Does the code preserve external request IDs or provider correlation IDs?

## Required Evidence by Surface

### HTTP APIs

- request or correlation ID
- route or operation name
- status code and duration
- authenticated actor or tenant ID when safe
- normalized error kind

### Background Jobs and Syncs

- run ID
- source system
- checkpoint before and after
- counts for fetched, changed, skipped, failed
- retry count
- failure categories

### External Adapters

- external system name
- operation name
- safe external identifier
- request ID returned by provider
- timeout/retry classification

## Log Quality Checklist

- Logs are structured, not interpolated blobs.
- Levels match operational severity.
- Sensitive fields are redacted or omitted.
- Log lines include enough context to join related events.
- Expected validation failures are not logged as process errors.
- Exceptions preserve stack traces at the boundary that handles them.

## Review Output

When auditing, report:

```md
## Observability Findings

- [severity] [file:line] Finding and operational impact.

## Missing Evidence

- Request/job/correlation IDs:
- Counts/status summaries:
- External provider metadata:
- Redaction concerns:

## Recommended Fixes

- Concrete code or logging changes.
```

## Common Mistakes

- Logging only at startup and final failure.
- Logging raw request bodies, tokens, headers, or presigned URLs.
- Recording "success" without counts or checkpoint evidence.
- Hiding provider request IDs.
- Treating observability as comments instead of executable code paths.
