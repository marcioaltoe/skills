---
name: hono-api-best-practices
description: Design HTTP APIs for Bun + Hono backends using Clean Architecture, Zod contracts in a shared package, OpenAPI generation from Zod, and thin controllers. Supports two selectable conventions — standard REST (resource paths with GET/POST/PATCH/PUT/DELETE) and POST-only action-based paths — picking one per project. Use when defining new endpoints, auditing or refactoring existing routes, shaping request/response contracts and envelopes, establishing API standards, or mapping typed application errors to HTTP status codes. Do not use for GraphQL, tRPC, non-Hono runtimes, or frontend-only concerns.
---

# API Design & Standards (Hono + Zod)

## When to Use This Skill

- Defining new HTTP endpoints for a bounded context
- Reviewing, auditing, or refactoring existing API routes for consistency
- Establishing API standards for a TypeScript/Clean Architecture backend
- Designing contracts for frontend, SDK, CLI, MCP, or third-party consumers
- Defining or updating API contracts in a shared contracts package (e.g. `api-contracts`)
- Enforcing consistent route registration and generated OpenAPI docs

## Choose the API Style First

This skill supports **two mutually exclusive conventions**. Lock onto exactly one per project before designing or auditing any endpoint, and never mix them within the same API surface. The shared core below (Clean Architecture, Zod as source of truth, `createRoute` + `app.openapi`, the error helper, generated OpenAPI) applies to both styles. Only paths, methods, parameter placement, and response shapes differ.

| Style | Shape | Read |
| --- | --- | --- |
| **Standard REST** | Resource paths + HTTP verbs (`GET`/`POST`/`PATCH`/`PUT`/`DELETE`); params in path/query/body; responses return the resource/collection directly | `references/style-rest.md` |
| **POST-only action-based** | Every endpoint is `POST /<context>/<entity>/<action>`; JSON body only; responses use the `{ data, message }` / `{ error, details }` envelope | `references/style-post-only.md` |

Determine the style in this order:

1. **Project docs win.** Check `AGENTS.md`, ADRs, and design docs. If they specify a style (or conflict with anything in this skill), the project documents take precedence.
2. **Infer from existing routes.** Grep for `createRoute({` and inspect `method` / `path`: varied verbs with `/{id}` paths means REST; every route `method: "post"` with `/<action>` suffixes means POST-only.
3. **Greenfield or ambiguous:** ask the user which style the project uses. Default to standard REST for new public APIs unless the project has already standardized on POST-only.

Once chosen, read **only that style's reference file** and apply it consistently. If a project already uses one style, do not introduce endpoints in the other.

## Core Principles (both styles)

- **Contracts in a shared `api-contracts` package**: Request/response schemas live in a central package when shared across backend, frontend, SDKs, or tests.
- **Zod is the single source of truth**: Every schema drives runtime validation, TypeScript types (`z.infer`), and the OpenAPI spec at once. Never duplicate hand-written OpenAPI YAML/JSON.
- **Every endpoint uses `createRoute` + `app.openapi(route, handler)`**: Never register handlers directly with `app.get(...)`, `app.post(...)`, etc., or the endpoint vanishes from `/openapi.json`. The `createRoute` call must list every possible response status code in `responses`.
- **Error mapping goes through a single shared helper**: Typed application errors map to HTTP in one place (e.g. `mapApplicationErrorToResponse(context, error)`). Never inline `return context.json({ error, details: { code } }, status)` in a controller, use case, or route handler. If the helper doesn't cover a new error type, extend the helper — do not branch inline.
- **`openapi.json` is generated, never authored**: The spec is produced by `@hono/zod-openapi` from registered schemas and routes. If the spec is wrong, fix the Zod schema, not the spec. Never commit a generated spec.
- **Scalar UI consumes the generated spec**: Interactive docs render from the same `/openapi.json` the clients consume. No separate documentation artifact exists.
- **Clean Architecture**: Controllers are thin adapters over application use cases. Design starts from domain use cases and application DTOs, then maps to HTTP.

## Design Workflow (Top-Down)

1. **Start from the use case**
   - Identify the bounded context and use case (e.g. `ListManagedAccountHolders`, `CreateOrder`).
   - Define clear input/output DTOs in the application layer.
2. **Map to the chosen style**
   - Apply the path, method, parameter, and response conventions from your style's reference file.
   - Decide status codes and error shapes.
3. **Map HTTP ↔ use case**
   - The route/controller parses validated HTTP input into application DTOs, calls the use case, and maps the result back to HTTP.
4. **Apply cross-cutting concerns consistently**
   - Auth, authorization, validation, logging, idempotency, rate limits, and error handling follow shared helpers.

## Audit Workflow

When auditing an existing route or API surface, first confirm the project's style, then walk the §API Design Checklist for **each** endpoint under review and report pass/fail per item — including schema-level concerns like `.openapi("RefName")` metadata on every request/response schema, not just method/path. A route that uses the right method and shape but inlines Zod schemas (missing `.openapi("RefName")`) is still non-compliant and must be flagged. So is any endpoint that uses the wrong style for the project.

## Validate Both Directions (request AND response)

`createRoute` + `app.openapi` validate the **request** (params, query, body) at runtime, but they do **not** validate the **response** — Hono sends whatever the handler returns, even if it drifts from the declared response schema. Declaring response schemas in `responses` and asserting them in tests is not the same as guaranteeing them in production. Validate the outgoing body at runtime too, so the API can never silently return an off-contract response that breaks generated SDKs/MCP/CLI tools.

Do this through one shared response helper that parses the payload through the response schema before sending. A mismatch throws and is caught by the global error handler (mapped to `500`) rather than shipping a malformed body:

```ts
// src/infra/http/respond.ts  — shared, used by every controller in both styles
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { z } from "@hono/zod-openapi";

export function respond<S extends z.ZodTypeAny>(
  context: Context,
  schema: S,
  payload: z.input<S>,
  status: ContentfulStatusCode
) {
  return context.json(schema.parse(payload), status); // runtime-validated against the contract
}
```

Keep `schema.parse` always-on in non-production and at least sampled in production if the parse cost matters; never skip it entirely, or the response contract is unenforced. Request-side: register a `defaultHook` on the `OpenAPIHono` instance so failed request validation becomes the shared error envelope (`400`) instead of Hono's default body — see `references/openapi-generation.md`.

## Controller Pattern (both styles)

Controllers self-register routes via `app.openapi(route, handler)`. `createRoute` validates the request — no separate `zValidator` call is needed. On success the controller returns through `respond(...)` so the body is validated against the declared response schema; the success shape differs by style (the resource schema directly for REST, the `{ data, message }` response schema for POST-only). The error path is identical and goes through the shared error helper.

```ts
import type { OpenAPIHono } from "@hono/zod-openapi";
import { someRoute } from "../routes/some.route";
import { SomeResponseSchema } from "@/api-contracts";
import { mapApplicationErrorToResponse } from "@/infra/http/error-handling";
import { respond } from "@/infra/http/respond";

export class SomeController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly useCase: SomeUseCase
  ) {
    this.app.openapi(someRoute, async context => {
      const input = context.req.valid("json"); // or "query" / "param"
      const credential = context.get("credential");

      const result = await this.useCase.execute({ ...input, workspaceId: credential.workspaceId });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      // REST: respond(context, SomeResourceSchema, result.value, 200)
      // POST-only: respond(context, SomeResponseSchema, { data: result.value, message: "Success" }, 200)
      return respond(context, SomeResponseSchema, result.value, 200);
    });
  }
}
```

See your style's reference file for the exact success shape and concrete `createRoute` examples.

## Cross-Cutting Concerns (both styles)

Bake these into the contract, not just the prose — generated SDK/MCP/CLI consumers depend on them being machine-readable.

- **Idempotency for unsafe operations.** Creation and state-changing operations must be safely retryable — clients and gateways retry on timeouts, and a naive retry double-charges or double-creates. Accept an `Idempotency-Key` (REST header, or an `idempotencyKey` body field in POST-only) on create/state-change endpoints; persist the key with its first result for a dedup window; a replay with the same key returns the original response, the same key with a different payload returns `409`. Reads are naturally idempotent and need no key.
- **Versioning & breaking changes.** Version the surface from day one (`/v1` prefix for REST; a version segment or header for POST-only). Within a version make only additive, backward-compatible changes: add optional fields, never remove or repurpose existing ones, never tighten validation on existing inputs. A breaking change requires a new version plus a deprecation path — signal removal with `Deprecation` and `Sunset` response headers and a migration window. Otherwise generated consumers break silently.
- **Rate limiting.** Declare `429 Too Many Requests` and make limits observable: emit `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` on responses, plus `Retry-After` on a `429`, and declare them in the route's `responses` headers so codegen clients can back off. Scope limits per credential/workspace, not per IP, for authenticated APIs.

## Shared Conventions

Credential model, authorization semantics, and field formats apply to both styles and are detailed in `references/api-conventions.md` — read it when shaping contracts, credentials, or money/date fields. Key defaults:

- **Credentials carry `scopes` (what) + `accessBoundary` (where).** Never infer broad access; whole-tenant access needs an explicit boundary. MCP tokens are a separate credential type. Declare via OpenAPI `security` so codegen/MCP tooling can model them.
- **Authorization:** out-of-scope resource → `404`; exists-but-forbidden → `403`; query filters narrow but never expand a credential's boundary.
- **Field formats:** camelCase JSON fields/query params; money as a decimal string + ISO 4217 (never floats); instants ISO 8601 with timezone, business dates `YYYY-MM-DD`; temporal filters name their dimension (`createdFrom`, not `from`).
- **Async operations:** `202 Accepted` + a status resource with an explicit state enum, polled via `GET`.

## Status Codes

- `200 OK` — successful reads and updates with a body
- `201 Created` — successful creation; include `Location` when practical
- `202 Accepted` — async job accepted (REST resource-style operations)
- `204 No Content` — successful delete/revoke/disconnect with no body
- `304 Not Modified` — conditional GET with unchanged representation (REST)
- `400 Bad Request` — malformed input or validation error at the HTTP boundary
- `401 Unauthorized` — missing/invalid authentication
- `403 Forbidden` — authenticated but not allowed
- `404 Not Found` — resource not found
- `409 Conflict` — duplicates, state conflicts, business invariants
- `422 Unprocessable Entity` — domain validation failure distinct from HTTP validation
- `429 Too Many Requests` — rate limit
- `500 Internal Server Error` — unhandled errors

### Error Envelope (both styles)

Errors use the same structured body in both styles. `error` is a human-readable string safe for UI; everything machine-readable lives inside `details`.

```json
{
  "error": "Human-readable message",
  "details": {
    "code": "BANK_CONNECTION_NOT_FOUND",
    "requestId": "req_01HZ..."
  }
}
```

Rules:

- `error` — always a string; never an object, never holds the code.
- `details.code` — **always required**; stable, machine-readable, `SCREAMING_SNAKE_CASE`.
- `details.requestId` — required in production for traceability.
- Additional optional context goes inside `details`: `fieldErrors`, `resourceId`, `retryAfter`, etc.
- Never put `code` at the top level, never nest `{ error: { code, message } }`, never return free-form error strings.

## OpenAPI Spec Generated From Zod

The OpenAPI specification is a build artifact of the Zod schemas, never hand-written.

```text
Zod schema  →  .openapi("RefName")  →  createRoute({ ... })
            →  app.openapi(route, handler)  →  /openapi.json
            →  Scalar UI  +  generated clients
```

Non-negotiable rules:

1. Every reused schema must call `.openapi("RefName")` so it appears in `components.schemas`.
2. Every endpoint must be declared with `createRoute` and mounted with `app.openapi(route, handler)`.
3. Every response status code the endpoint can emit must be listed in `responses`.
4. Auth must be declared via OpenAPI `security`, registered once at bootstrap with `registerComponent("securitySchemes", ...)`.
5. Do not commit generated OpenAPI specs.

For the full walkthrough (schema annotation, bootstrap wiring, client codegen, common mistakes), read `references/openapi-generation.md`. For the route-declaration examples in your convention, read your style's reference file.

## Testing Strategy

- **Contracts**: unit test Zod schemas with valid/invalid payloads.
- **Controllers**: integration test Hono routes — status codes, auth, validation, error mapping, and the response shape for your style.
- **OpenAPI**: boot the server, fetch `/openapi.json` in tests, and verify endpoints, methods, schemas, response codes, and security.
- **E2E**: exercise key flows through the public API or a generated client.

## API Design Checklist

Before merging an API change:

1. The endpoint follows the project's chosen style consistently (no mixing REST and POST-only).
2. Contracts are defined in the shared package and annotated with `.openapi("RefName")`.
3. Route uses `createRoute` and is mounted with `app.openapi`, declaring every success and error status code plus the correct `security` entry.
4. Parameter placement matches the style (REST: path/query/body; POST-only: JSON body only).
5. Response shape matches the style (REST: resource directly; POST-only: `{ data, message }` envelope). Error responses use `{ error, details: { code } }`.
6. Controller is thin, self-registering, and delegates to a use case.
7. Typed application errors map through the shared HTTP error helper.
8. Auth and authorization are machine-readable in OpenAPI and enforced in code.
9. `/openapi.json` regenerates at boot and reflects the change — verified by fetching the spec.
10. Tests cover success, validation failure, auth failure, authorization failure, and domain conflicts.
11. Cross-cutting concerns are addressed: unsafe (create/state-change) operations are idempotent via `Idempotency-Key`; the versioning posture is stated with additive-only/breaking-change rules; rate-limit headers (`RateLimit-*` / `Retry-After`) are declared. For a read-only endpoint, note idempotency as N/A rather than omitting it.
12. Shared conventions hold (see `references/api-conventions.md`): credentials declare `scopes` + `accessBoundary`; authorization uses `403` vs `404` correctly and filters never expand scope; field formats follow camelCase / money-as-decimal-string + ISO 4217 / ISO 8601 instants / `YYYY-MM-DD` dates / named temporal filters; async operations return `202` + a status resource.

## Pitfalls (both styles)

- Do not mirror table names blindly; paths represent public product resources, not the database schema.
- Do not bypass OpenAPI route registration with `app.get(...)` / `app.post(...)`.
- Do not hide auth requirements in free-form `description` text; use `security`.
- Do not make breaking response changes without versioning.
- Do not inline error responses; route them through the shared helper.

Style-specific naming rules and pitfalls live in each style's reference file.
