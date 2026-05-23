# Style: POST-only Action-Based

Read this when the project uses **POST-only action-based** endpoints. The shared core lives in `SKILL.md`; this file covers only what is POST-only-specific. For the OpenAPI generation mechanics, read `openapi-generation.md`.

## Paths and Methods

- **Method**: every endpoint is `POST`.
- **Path shape**: `POST /<context>/<entity>/<action>`.
- **Actions**: `create | get | list | update | delete`; workflow actions like `cancel`, `confirm`, `switch` are allowed when needed.
- **Inputs**: JSON body only — no query string, no URL params.

```text
POST /visio/companies/create
POST /visio/companies/get
POST /visio/companies/list
POST /visio/companies/update
POST /visio/companies/delete
```

Avoid:

- Using non-`POST` verbs.
- Placing identifiers in the URL path when the contract expects JSON body input.
- Overloading one endpoint with a "doEverything" action flag.

## Parameters — JSON Body Only

- **Create**: full payload (no `id`).
- **Get / Delete**: `{ "id": "..." }` only.
- **List**: `{ page, pageSize, filters }`.
- **Update**: `{ "id": "...", ...patch }`.
- **Scope**: do not accept `organizationId` / `workspaceId` when derived from the session.
- **One schema per action**: each action has its own request and response schema.

### Action → Body mapping

```text
create  -> { ...payload }
get     -> { id }
list    -> { page, pageSize, filters }
update  -> { id, ...patch }
delete  -> { id }
```

### Inputs: Do / Don't

```text
DO:     POST /visio/companies/get    { id: "cmp" }
DO:     POST /visio/companies/list   { page: 1, pageSize: 20, filters: { isActive: true } }
DO:     POST /visio/companies/update { id: "cmp", name: "Loja 2" }
DON'T:  POST /visio/companies/cmp
DON'T:  POST /visio/companies/list?isActive=true
DON'T:  POST /visio/companies        { action: "list", ... }
```

## Response Shape — Envelope

Every POST-only response uses exactly one of two envelopes. Pick by outcome, never by taste.

```ts
// Success — ALWAYS this exact shape
{ "data": { /* DTO / ViewModel / PaginatedResponseDto */ }, "message": "Success" }
```

```ts
// Error — the shared envelope from SKILL.md §Error Envelope
{ "error": "Human-readable message", "details": { "code": "STABLE_ERROR_CODE", "requestId": "req_..." } }
```

Success rules:

- `data` wraps a single resource `{ id, ... }` or a collection `{ items, total, page, pageSize }`.
- Never return the resource or collection at the top level — always inside `data`.
- Never add new top-level keys beyond `data` and `message`.
- Error responses follow the shared error envelope (`details.code` required, `details.requestId` required in prod).

## Pagination and Filtering

- Always support `page` and `pageSize` (or cursor-based pagination when necessary).
- Return a consistent paginated shape inside `data`.
- Expose filters in the JSON body (`status`, `createdFrom`, `createdTo`, `search`, etc.).

```http
POST /visio/users/list HTTP/1.1
Content-Type: application/json
```

```json
{ "page": 1, "pageSize": 20, "filters": { "status": "active", "search": "julia" } }
```

```json
{
  "data": {
    "items": [{ "id": "...", "name": "Julia", "email": "julia@example.com" }],
    "total": 1,
    "page": 1,
    "pageSize": 20
  },
  "message": "Success"
}
```

## Contracts in `api-contracts`

Each action gets its own request and response schema; the response schema wraps the resource in the `{ data, message }` envelope.

```ts
// packages/api-contracts/src/visio/companies.ts
import { z } from "@hono/zod-openapi";

export const CompanySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
    externalCode: z.string().min(1),
    isActive: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Company");

export const CreateCompanyRequestSchema = z
  .object({
    name: z.string().min(1),
    externalCode: z.string().min(1),
    isActive: z.boolean().default(true),
    // Unsafe operation → optional idempotency key for safe retries (POST-only carries it in the body, not a header).
    idempotencyKey: z.string().uuid().optional(),
  })
  .openapi("CreateCompanyRequest");

export const CreateCompanyResponseSchema = z
  .object({ data: CompanySchema, message: z.string() })
  .openapi("CreateCompanyResponse");
```

## `createRoute` Example (POST-only)

Create is an unsafe operation: the request schema carries an optional `idempotencyKey` body field for safe retries, and the route declares `429` with rate-limit headers (see `SKILL.md` §Cross-Cutting Concerns).

```ts
// src/contexts/visio/infra/http/routes/create-company.route.ts
import { createRoute } from "@hono/zod-openapi";
import { CreateCompanyRequestSchema, CreateCompanyResponseSchema, ErrorResponseSchema } from "api-contracts";

const rateLimitHeaders = {
  "Retry-After": { schema: { type: "integer" as const }, description: "Seconds to wait before retrying" },
  "RateLimit-Limit": { schema: { type: "integer" as const } },
  "RateLimit-Remaining": { schema: { type: "integer" as const } },
  "RateLimit-Reset": { schema: { type: "integer" as const } },
};

export const createCompanyRoute = createRoute({
  method: "post",
  path: "/visio/companies/create",
  tags: ["visio.companies"],
  summary: "Create a company",
  security: [{ bearerAuth: [] }],
  request: { body: { required: true, content: { "application/json": { schema: CreateCompanyRequestSchema } } } },
  responses: {
    201: { description: "Company created", content: { "application/json": { schema: CreateCompanyResponseSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    409: { description: "idempotencyKey reused with a different payload, or business conflict", content: { "application/json": { schema: ErrorResponseSchema } } },
    429: { description: "Rate limited", headers: rateLimitHeaders, content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});
```

The controller returns the envelope on success, validated at runtime through the shared `respond()` helper (see `SKILL.md` §Validate Both Directions):

```ts
import { respond } from "@/infra/http/respond";
import { CreateCompanyResponseSchema } from "api-contracts";

this.app.openapi(createCompanyRoute, async context => {
  const body = context.req.valid("json");
  const session = context.get("session");
  const result = await this.createCompanyUseCase.execute({ ...body, organizationId: session.organizationId });
  if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
  return respond(context, CreateCompanyResponseSchema, { data: result.value, message: "Success" }, 201); // enveloped, runtime-validated
});
```

## Naming and Pitfalls (POST-only)

- Plural entity names in paths: `/visio/users/list`, not `/visio/user/list`.
- Mixing verbs (any non-`POST` method) is forbidden.
- API structure must not mirror the database schema.
- Every success response uses the exact `{ data, message }` envelope — no variants, no top-level resource.
- Breaking response changes require a new action path or a versioned contract.
