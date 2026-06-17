---
name: logtape
description: Use when adding, modifying, or reviewing LogTape logging in JavaScript or TypeScript. Covers getLogger categories, structured messages, configure startup rules, contextual properties, lazy evaluation, testing, and common mistakes. Trigger for logging work, log output debugging, or framework integration with @logtape/logtape.
license: MIT
---

# LogTape

LogTape is a zero-dependency logging library for JavaScript and TypeScript across Node.js, Bun, Deno, browsers, and edge runtimes.

Official sources:

- LogTape docs: https://logtape.org/
- Official skill source: https://github.com/dahlia/logtape/tree/main/packages/logtape/skills/logtape

## Core Rules

- Configure LogTape once in the application entry point, before framework startup.
- Do not call `configure()` or `configureSync()` from reusable library code.
- Use array categories for hierarchical filtering: `getLogger(["app", "module", "operation"])`.
- Prefer structured messages with named placeholders and a properties object.
- Use template literal logging only for quick debug messages that do not need structured fields.
- Attach request, tenant, user, sync, or job context through logger context rather than string concatenation.
- Reset LogTape in test teardown when tests configure it.

## Basic Setup

```ts
import { configure, getConsoleSink } from "@logtape/logtape";

await configure({
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    {
      category: ["app"],
      lowestLevel: "info",
      sinks: ["console"],
    },
  ],
});
```

Use `configureSync()` only when the startup path cannot be async. Do not mix async and sync configuration/reset paths.

## Getting Loggers

```ts
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["app", "sync", "sales"]);
const dbLogger = logger.getChild("database");
```

Choose category segments that match stable module boundaries. Avoid categories based on dynamic values such as user IDs, tenant IDs, or request IDs; those belong in structured properties.

## Structured Logging

```ts
logger.info("Imported {count} sales rows for {tenantId}", {
  count: importedRows,
  tenantId,
});

logger.warning("ERP adapter request failed", {
  adapter: "sales",
  status,
  requestId,
});

logger.error("Sync job failed", {
  jobId,
  tenantId,
  error: error instanceof Error ? error.message : String(error),
});
```

Use operational events at `info`, expected recoverable problems at `warning`, operation failures at `error`, and process-ending failures at `fatal`.

## Application vs Library Code

Application entry points:

- Call `configure()` once.
- Select sinks, minimum levels, filters, and production formatting.
- Register redaction and context behavior.

Library or package code:

- Call `getLogger()`.
- Emit useful structured logs.
- Never decide global sinks or minimum levels.

## Testing Guidance

- In tests that call `configure()`, call `await reset()` in teardown.
- Assert behavior first and logs only when logging is part of the contract.
- Prefer capturing a test sink over spying on console output.
- Keep secrets and credentials out of snapshots.

## Common Mistakes

- Calling `configure()` in multiple modules.
- Logging secrets, tokens, full authorization headers, or raw payloads with PII.
- Building strings instead of structured properties.
- Using dynamic values as category segments.
- Swallowing an error after logging it when the caller still needs failure semantics.
