# OpenAPI Generation from Zod Schemas

Companion to `SKILL.md` §OpenAPI Spec Generated From Zod. Read this when implementing or reviewing any endpoint that must appear in `/openapi.json`. The generation mechanics here apply to **both** API styles — for the route declarations in your convention (REST verbs vs POST-only actions) read `style-rest.md` or `style-post-only.md`.

## Generation Flow

```text
Zod schema (api-contracts)  →  .openapi() metadata  →  createRoute()  →  /openapi.json  →  Scalar UI  +  typed clients
```

There is no hand-maintained `openapi.yaml` or `openapi.json` file in the repo. The spec exists only at runtime, served by the Hono app.

## Step 1 — Annotate Zod Schemas

Extend Zod through `@hono/zod-openapi` and attach `.openapi()` metadata where schemas are defined, inside the shared contracts package. The ref name is what appears in `components.schemas`.

```ts
// packages/api-contracts/src/managed-account-holders.ts
import { z } from "@hono/zod-openapi";

export const ManagedAccountHolderSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "0198f5f3-..." }),
    type: z.enum(["person", "organization"]),
    displayName: z.string().min(2).openapi({ example: "Show de Compras" }),
    slug: z.string().min(1).openapi({ example: "show-de-compras" }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("ManagedAccountHolder");

export const CreateManagedAccountHolderRequestSchema = z
  .object({
    type: z.enum(["person", "organization"]),
    displayName: z.string().min(2),
    taxId: z.string().min(11),
  })
  .openapi("CreateManagedAccountHolderRequest");
```

The error schema is shared by every endpoint in both styles. `code` is required; `requestId` is required in production; `catchall` allows optional extras (`fieldErrors`, `resourceId`, `retryAfter`, ...).

```ts
export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z
      .object({
        code: z.string(),
        requestId: z.string().optional(), // required in production
      })
      .catchall(z.unknown()),
  })
  .openapi("ErrorResponse");
```

The **success** response schema differs by style: REST returns the resource (or a structured collection) directly; POST-only wraps it in a `{ data, message }` envelope. See your style's reference file for the exact success schema.

## Step 2 — Register Routes with `createRoute`

Every endpoint is declared with `createRoute` so the generator knows its method, path, params/query/body schemas, and every response status code. The route shape **is** the style — the concrete `createRoute` examples for your convention live in `style-rest.md` / `style-post-only.md`.

Whatever the style, the controller mounts routes with `app.openapi(route, handler)`, which also validates params, query, and JSON bodies. Do not add a separate validator when `createRoute` already declares the schemas.

## Step 3 — Expose `/openapi.json` and Scalar UI

One place in the app bootstrap wires the generated spec and the UI. Nothing else references them.

```ts
// src/app.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";

const app = new OpenAPIHono();

app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "session-token",
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "API", version: process.env.APP_VERSION ?? "0.0.0" },
  servers: [{ url: "https://api.example.com" }],
});

app.get("/reference", apiReference({ spec: { url: "/openapi.json" }, theme: "default", layout: "modern" }));
```

## Rules for Accurate OpenAPI

- Every endpoint must be declared with `createRoute` and mounted with `app.openapi(route, handler)`. A direct `app.get(...)` / `app.post(...)` will not appear in `openapi.json` — that is a bug, not a shortcut.
- Every response the endpoint can emit must be listed in `responses`. Use `ErrorResponseSchema` as the shared error body for `400`/`401`/`403`/`404`/`409`/`500`.
- Every schema reused across endpoints must call `.openapi("RefName")` for stable `$ref`s in `components.schemas`.
- Auth requirements must be declared via `security`. Register the scheme once with `registerComponent`, then reference it per route. Never document auth in free-form `description` text.
- Do not commit generated specs to git — the spec regenerates on every boot.
- Contract tests boot the server, fetch `/openapi.json`, and diff it against a committed snapshot of _schema names and response codes only_ — not the full body — to catch accidental removals without locking examples.

## Client Generation

When frontends, SDKs, CLI, or MCP tooling consume the API through generated clients (e.g. `openapi-typescript`, `orval`, `Kubb`), point the generator at the live `/openapi.json` during codegen. The backend Zod contracts and the generated clients must derive from the same route/schema definitions.

## Common Mistakes to Reject in Review

| Mistake | Why it breaks the API contract |
| --- | --- |
| `app.get/post("/foo", handler)` instead of `app.openapi(route, handler)` | Endpoint vanishes from `/openapi.json` |
| Schema inlined instead of `.openapi("RefName")` | Duplicated shapes; noisy diffs; weaker codegen |
| Only `200` declared in `responses` | SDKs cannot model errors |
| Query/body fields accepted but missing from `request` | OpenAPI lies to clients |
| `security: []` or missing where auth is required | Generated SDKs omit auth headers |
| Free-form `description: "Requires auth"` instead of `security` | Machine-readable auth is lost |
| Checking `openapi.json` into git | Generated artifact becomes stale |
| Mixing REST and POST-only routes in one API | Inconsistent surface; pick one style per project |
