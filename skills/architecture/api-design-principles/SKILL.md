---
name: api-design-principles
description:
  Design POST-only action-based HTTP APIs for Bun + Hono backends using Clean Architecture, Zod contracts in a shared
  package, and thin controllers. Use when defining new endpoints, auditing existing routes for compliance, shaping
  request/response envelopes, or mapping typed application errors to HTTP status codes. Do not use for RESTful CRUD with
  GET/PUT/DELETE verbs, GraphQL, tRPC, non-Hono runtimes, or frontend-only concerns.
---

# API Design & Standards (POST-only + Zod)

## When to Use This Skill

- Defining new HTTP endpoints for a bounded context (POST-only action paths)
- Reviewing or refactoring existing API routes
- Establishing API standards for a TypeScript/Clean Architecture backend
- Designing contracts (request/response) for frontend or third-party consumers
- Auditing an API surface for consistency before implementation or breaking changes
- Designing or reviewing backend endpoints in a Bun + Hono service
- Defining or updating API contracts in a shared contracts package (for example, `api-contracts`)
- Enforcing consistent API standards across controllers, routes, and generated docs

### Project-Specific Guidance

Treat this skill as generic API-design guidance. In any concrete repository, always also review that project's
`AGENTS.md` and ADRs (or equivalent architecture docs); if they differ from this skill, project-specific rules take
precedence.

## Core Principles

- **POST-only HTTP contracts**: Endpoints use `POST` with action-based paths and JSON body inputs.
- **Contracts in a shared `api-contracts` package**: All request/response schemas live in a central contracts package.
- **Zod is the single source of truth**: Every schema drives three things at once — runtime validation, TypeScript types (`z.infer`), and the OpenAPI spec. Schemas are NEVER duplicated in hand-written OpenAPI YAML/JSON.
- **Every endpoint declared via `createRoute` + `app.openapi(route, handler)`**: Never `app.post(...)` directly. The `createRoute` call MUST list every possible response status code in `responses` (success + every error: `400`/`401`/`403`/`404`/`409`/`422`/`500` as applicable). Any design output proposing a new endpoint MUST include the full `createRoute({ ... })` block.
- **Error mapping goes through a single shared helper**: Typed application errors MUST be translated to HTTP via a shared helper (e.g. `mapApplicationErrorToResponse(context, error)`). NEVER inline `return context.json({ error, details: { code } }, <status>)` in a controller, use case, or route handler. If the helper doesn't yet cover a new error type, extend the helper — do not branch inline.
- **`openapi.json` is generated, never authored**: The spec at `/openapi.json` (or `/doc`) is produced by `@hono/zod-openapi` from registered Zod schemas and routes. If the spec is wrong, fix the Zod schema — not the spec.
- **Scalar UI consumes the generated spec**: Interactive docs (`/reference` or `/docs`) render from the same `openapi.json` the clients consume. No separate documentation artifact exists.
- **Clean Architecture**: Infrastructure controllers are thin adapters over application use cases. Design starts from domain use cases and application DTOs, then maps to HTTP.

## Design Workflow (Top-Down)

1. **Start from use case**
   - Identify bounded context and use case (e.g. `ListUsers`, `CreateOrder`).
   - Define clear input/output DTOs in application layer.
2. **Define HTTP contract**
   - Choose action path, confirm POST-only usage, and define status codes and error shapes.
   - Decide JSON body fields for input and response structure (no query/path params in POST-only APIs).
3. **Map HTTP ↔ use case**
   - Implement a thin controller or route that parses HTTP input into DTOs, calls the use case, and maps the result to
     HTTP responses.
4. **Apply cross-cutting concerns consistently**
   - Authentication/authorization middleware, validation, logging, and error handling follow global patterns (see
     error-handling and auth skills).

## Audit Workflow

When auditing an existing route or API surface, walk through the full §API Design Checklist for EACH endpoint under review and explicitly report pass/fail for every item — including schema-level concerns like `.openapi("RefName")` metadata on every request/response schema in `api-contracts`, not just method/path/envelope. A route that uses `POST` with a correct envelope but inline Zod schemas (missing `.openapi("RefName")`) is still non-compliant and MUST be flagged.

## HTTP Contract (POST-only Action-Based)

### Paths and Methods

- **Method**: all endpoints are `POST`.
- **Path shape**: `POST /<context>/<entity>/<action>`.
- **Actions**: `create | get | list | update | delete` (workflow actions like `cancel`, `confirm`, `switch` are allowed
  when needed).
- **Inputs**: JSON body only (no query-string, no URL params).

Example (context `visio`, entity `companies`):

```text
POST /visio/companies/create
POST /visio/companies/get
POST /visio/companies/list
POST /visio/companies/update
POST /visio/companies/delete
```

**Avoid:**

- Using `non-POST verbs` in a POST-only API.
- Placing identifiers in the URL path when the contract expects JSON body input.
- Overloading a single endpoint with a "doEverything" action flag.

### Parameters (POST-only)

- **All inputs in JSON body**; never use query or path params.
- **Create**: full payload for creation (no `id`).
- **Get/Delete**: `{ "id": "..." }` only.
- **List**: `{ page, pageSize, filters }`.
- **Update**: `{ "id": "...", ...patch }`.
- **Org scope**: do not accept `organizationId` if it is derived from the session.
- **One schema per action**: each action has its own request/response schema.

Examples (context `visio`, entity `companies`):

```json
// POST /visio/companies/create
{ "name": "Loja 1", "externalCode": "1", "isActive": true }
```

```json
// POST /visio/companies/get
{ "id": "cmp" }
```

```json
// POST /visio/companies/list
{ "page": 1, "pageSize": 20, "filters": { "isActive": true } }
```

```json
// POST /visio/companies/update
{ "id": "cmp", "name": "Loja 2", "externalCode": "2", "isActive": false }
```

```json
// POST /visio/companies/delete
{ "id": "cmp" }
```

#### Action -> Body Mapping

```text
create  -> { ...payload }
get     -> { id }
list    -> { page, pageSize, filters }
update  -> { id, ...patch }
delete  -> { id }
```

#### Inputs: Do/Don't

```text
DO:     POST /visio/companies/get  { id: "cmp" }
DO:     POST /visio/companies/list { page: 1, pageSize: 20, filters: { isActive: true } }
DO:     POST /visio/companies/update { id: "cmp", name: "Loja 2" }
DON'T:  POST /visio/companies/cmp
DON'T:  POST /visio/companies/list?isActive=true
DON'T:  POST /visio/companies { action: "list", ... }
```

### Consistent Request and Response Shapes

- Request bodies are JSON objects with explicit fields.
- Responses always use the envelope defined in §Response Format (`{ data, message }` / `{ error, details }`).
  - `data` wraps a single resource `{ id, ... }` or a collection `{ items, total, page, pageSize }`.
  - Never return the resource or collection at the top level — always inside `data`.
- Include stable identifiers (UUIDs) and timestamps when relevant.
- Use snake_case or camelCase consistently across all APIs; TypeScript DTOs should reflect the chosen convention.

## TypeScript DTOs and Contracts

Define DTOs in application layer, then reuse them in controllers. Example for listing users:

```ts
// application/dtos/list-users.dto.ts
export type ListUsersBodyDto = {
  page: number;
  pageSize: number;
  filters?: { status?: "active" | "inactive" };
};

export type UserSummaryDto = {
  id: string;
  name: string;
  email: string;
};

export type PaginatedResponseDto<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

Use Zod or similar for runtime validation at the HTTP boundary, but keep DTOs as plain TypeScript types in application
layer.

## Pagination and Filtering

For endpoints returning collections:

- Always support `page` and `pageSize` (or cursor-based pagination when necessary).
- Return a consistent `PaginatedResponseDto<T>` shape.
- Expose filters in the JSON body (`status`, `createdFrom`, `createdTo`, `search`, etc.).

Example contract:

```http
POST /visio/users/list HTTP/1.1
Content-Type: application/json
```

```json
{
  "page": 1,
  "pageSize": 20,
  "filters": {
    "status": "active",
    "search": "julia"
  }
}
```

```json
{
  "items": [
    {
      "id": "...",
      "name": "Julia",
      "email": "julia@example.com"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

## Contracts in a Shared API Contracts Package

Define all API contracts in a shared `packages/api-contracts` (or equivalent) package and consume them from backend
services and frontend clients.

```ts
// packages/api-contracts/src/auth.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
```

On the backend, reuse these schemas for validation and OpenAPI; on the frontend, use the generated types and an HTTP
client.

## Controller Pattern (POST-only HTTP)

Controllers self-register routes via `app.openapi(route, handler)`. `createRoute` handles Zod validation — no `zValidator` call needed.

```ts
// src/contexts/auth/infra/controllers/auth.controller.ts
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { LoginUseCase } from "@/application/use-cases/login.use-case";
import { loginRoute } from "../routes/login.route";
import { mapApplicationErrorToResponse } from "@/infra/http/error-handling";

export class AuthController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly loginUseCase: LoginUseCase
  ) {
    this.app.openapi(loginRoute, async context => {
      const dto = context.req.valid("json");
      const result = await this.loginUseCase.execute(dto);
      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json({ data: result.value, message: "Success" }, 200);
    });
  }
}
```

The companion `loginRoute` lives in a sibling `routes/` file and is built with `createRoute({ method: "post", path: "/auth/login", request, responses })` — see [references/openapi-generation.md](references/openapi-generation.md) for the full template.

## Response Format & Status Codes

Every response MUST use exactly one of these two envelopes. No variants, no nesting an `error` object inside itself, no flattening `code`/`message` to the top level. Pick the envelope by outcome, never by taste.

```ts
// Success response — ALWAYS this exact shape
{
  "data": { /* DTO / ViewModel / PaginatedResponseDto */ },
  "message": "Success"
}

// Error response — ALWAYS this exact shape
{
  "error": "Human-readable message",   // string, safe for UI surfacing
  "details": {
    "code": "STABLE_ERROR_CODE",       // machine-readable, SCREAMING_SNAKE_CASE
    // any additional structured context (ids, field issues, etc.)
  }
}
```

Rules for the error envelope:

- `error` is ALWAYS a string (the human-readable message).
- `details` is ALWAYS an object; the stable `code` lives INSIDE `details`.
- Do NOT nest: `{ "error": { "code": ..., "message": ... } }` is forbidden.
- Do NOT flatten: `{ "code": ..., "message": ..., "details": {} }` is forbidden.
- Do NOT add new top-level keys (`status`, `timestamp`, etc.) — put them in `details`.

## Error Handling and Status Codes

Align HTTP behavior with error-handling patterns skill:

- Use typed application errors and map them to HTTP in one place.
- Prefer structured error bodies with stable `code` fields instead of free-form strings.

Recommended status code usage:

- `200 OK` – successful reads.
- `201 Created` – successful creation; include `Location` header when possible.
- `204 No Content` – successful operations with no body (e.g. delete).
- `400 Bad Request` – validation errors at the HTTP boundary (Zod validation).
- `401 Unauthorized` – missing/invalid authentication.
- `403 Forbidden` – authenticated but not allowed.
- `404 Not Found` – resource not found.
- `409 Conflict` – version conflicts, duplicates, or business invariants.
- `422 Unprocessable Entity` – domain validation failures (if distinct from `400`).
- `500 Internal Server Error` – unhandled errors.

New status codes require documentation in the API contracts.

Example error body (follows the envelope defined in §Response Format — the stable `code` lives inside `details`, never at the top level):

```json
{
  "error": "User was not found",
  "details": {
    "code": "USER_NOT_FOUND",
    "id": "..."
  }
}
```

## OpenAPI Spec Generated From Zod

The OpenAPI specification is a **build artifact of the Zod schemas**, never hand-written. There is no `openapi.yaml` or `openapi.json` file committed to the repo — the spec exists only at runtime, served by the Hono app.

**Generation flow (memorize this chain):**

```text
Zod schema (api-contracts)  →  .openapi("RefName")  →  createRoute({ ... })
                            →  app.openapi(route, handler)  →  /openapi.json
                            →  Scalar UI (/reference)  +  generated client SDKs
```

**Four non-negotiable rules:**

1. **Every schema used across endpoints MUST call `.openapi("RefName")`** so it appears in `components.schemas` as a stable `$ref`.
2. **Every endpoint MUST be declared with `createRoute` and mounted via `app.openapi(route, handler)`** — never `app.post(...)` directly, or the endpoint vanishes from `/openapi.json`.
3. **Every response status code the endpoint can emit MUST be listed in `responses`** — including the error codes (`400`/`401`/`403`/`404`/`409`/`500`). Missing entries make the generated spec lie to clients.
4. **Auth MUST be declared via `security`** on each `createRoute` and registered once at bootstrap with `registerComponent("securitySchemes", ...)`. Auth documented only in free-form `description` text is invisible to codegen.

**Serve the spec and UI from one place:**

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
  info: { title: "Axis API", version: process.env.APP_VERSION ?? "0.0.0" },
});

app.get("/reference", apiReference({ spec: { url: "/openapi.json" } }));
```

**Never commit the generated spec.** It regenerates on every boot; a checked-in copy diverges silently the moment a schema changes. Contract tests fetch `/openapi.json` at runtime and diff it against the committed snapshot of _schema names and response codes_ only.

For the full walkthrough (schema annotation, `createRoute` template, controller wiring with `app.openapi`, common mistakes, client codegen), read [references/openapi-generation.md](references/openapi-generation.md).

## Testing Strategy (API Layer)

- **Contracts**: unit test Zod schemas (valid/invalid payloads).
- **Controllers**: integration tests with Hono test client, including status codes and envelopes.
- **End-to-end**: exercise flows via HTTP requests from clients (frontend, API client, or Playwright/Cypress).

## API Design Checklist

Before merging an API change, ensure:

1. Contract is defined/updated in the shared API contracts package and used by both backend and frontend.
2. Every request/response schema carries `.openapi("RefName")` metadata so it appears in `components.schemas`.
3. Endpoint is registered via `createRoute` with every possible response code (`200`/`201`/`204` + `400`/`401`/`403`/`404`/`409`/`422`/`500` as applicable) and the correct `security` entry.
4. Controller is thin, self-registering, and delegates to a use case.
5. Validation uses Zod (via `app.openapi(route, handler)` or `@hono/zod-validator`) with clear error messages.
6. Responses follow `data`/`message` and `error`/`details` envelopes.
7. Status codes are consistent with the standards above.
8. `/openapi.json` is regenerated at boot, reflects the new/changed endpoint, and is consumable by Scalar UI (`/reference`) and downstream client generators — verified by fetching the spec after boot.
9. Tests cover success, failure, and edge cases for the new behavior.

## Naming and Pitfalls

- **Plural entity names in paths**: `/visio/users/list`, not `/visio/user/list`.
- **Mixing verbs**: Using non-POST verbs in a POST-only API is forbidden.
- **Leaking storage details**: API structure must not mirror the database schema.
- **Inconsistent error formats**: Every error response uses the exact `{ error, details }` envelope — no variants.
- **Breaking changes without versioning**: Response shape changes require a new action path or a versioned contract.
