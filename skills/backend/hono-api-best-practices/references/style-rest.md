# Style: Standard REST

Read this when the project uses **standard REST** (resource-oriented paths + HTTP verbs). The shared core lives in `SKILL.md`; this file covers only what is REST-specific. For the OpenAPI generation mechanics, read `openapi-generation.md`.

## Paths and Methods

Resource-oriented paths, plural collection names, conventional verbs:

- `GET` — reads
- `POST` — creation
- `PATCH` — partial update
- `PUT` — full replacement only when intentionally designed
- `DELETE` — deletion, revocation, disconnection, cancellation of a resource

```text
GET    /v1/customers
POST   /v1/customers
GET    /v1/customers/{id}
PATCH  /v1/customers/{id}
DELETE /v1/customers/{id}
```

For domain operations, model the operation as a resource or state transition rather than an RPC action path:

```text
POST   /v1/connect-sessions
DELETE /v1/connect-sessions/{id}

POST   /v1/jobs
GET    /v1/jobs/{id}

DELETE /v1/integrations/{id}   # disconnect/revoke when the provider supports it
DELETE /v1/grants/{id}           # revoke when the provider supports it
```

Avoid:

- `POST /v1/users/list`, `POST /v1/users/get`, `POST /v1/users/delete`
- `POST /v1/users/{id}/do-something` when a resource or state transition can express it
- Singular collection names like `/v1/user`

## Parameters

- **Path params** identify a specific resource: `/v1/users/{id}`.
- **Query params** filter or page reads: `/v1/transactions?cursor=...&accountId=...`.
- **JSON body** carries creation/update payloads for `POST`, `PATCH`, `PUT`.
- Do not accept scope identifiers (e.g. `workspaceId`, `organizationId`) in request input when they are derived from auth/session/credential context.
- **kebab-case path segments**: `/v1/connect-sessions`, not `/v1/connectSessions` or `/v1/connect_sessions`. JSON fields and query params stay camelCase (see `api-conventions.md`).
- **Immutable id in canonical paths**: path identifiers use the immutable resource id (`/v1/users/{id}`). A mutable slug is a query filter only (`/v1/customers?slug=acme-corp`), never a canonical path identifier — otherwise bookmarks and references break when the slug changes.

```http
GET /v1/customers?type=organization&cursor=abc
```

```http
POST /v1/customers
Content-Type: application/json

{ "type": "organization", "displayName": "Acme Corp", "taxId": "..." }
```

```http
PATCH /v1/customers/01HZ...
Content-Type: application/json

{ "displayName": "Acme Corp ES" }
```

## Response Shapes — Unwrapped

REST success responses return the resource or collection **directly**. Do not wrap single resources in a `{ data, message }` envelope — in a public REST API the wrapper adds noise, weakens generated SDKs, and carries no information the HTTP status and schema don't already convey.

- Successful reads return the resource or a structured collection directly.
- Successful creation returns `201 Created` and the created resource. Include `Location` when practical.
- Successful deletion/revocation/disconnection returns `204 No Content` when no body is needed.
- Errors use the shared structured body (`{ error, details: { code, requestId, ... } }`) — see `SKILL.md` §Error Envelope.

Single resource:

```json
{ "id": "01HZ...", "displayName": "Acme Corp" }
```

Collection (structured, paginated):

```json
{
  "items": [{ "id": "01HZ...", "amount": "123.45", "currency": "BRL" }],
  "nextCursor": "def",
  "hasMore": true
}
```

## Reusable Collection Schema in `api-contracts`

Keep single-resource schemas plain (returned directly) and provide one reusable helper for the structured collection wrapper, so every list endpoint shares the same shape:

```ts
// packages/api-contracts/src/pagination.ts
import { z } from "@hono/zod-openapi";

export function collectionSchema<T extends z.ZodTypeAny>(item: T, ref: string) {
  return z
    .object({
      items: z.array(item),
      nextCursor: z.string().nullable(),
      hasMore: z.boolean(),
    })
    .openapi(ref);
}
```

```ts
// packages/api-contracts/src/customers.ts
import { z } from "@hono/zod-openapi";
import { collectionSchema } from "./pagination";

export const CustomerSchema = z
  .object({
    id: z.string().uuid(),
    type: z.enum(["person", "organization"]),
    displayName: z.string().min(2),
    slug: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Customer"); // returned directly by single-resource reads

export const CustomerCollectionSchema = collectionSchema(
  CustomerSchema,
  "CustomerCollection"
);
```

## Pagination and Filtering

- Prefer cursor-based pagination for financial/event streams, with an explicit `limit` default and maximum (e.g. default `100`, max `500`).
- Use `page` / `pageSize` only for stable administrative lists where cursors are unnecessary.
- Every public collection must define and document a **stable default ordering**. When sorting is exposed, use `sort=field:asc|desc`.
- Put filters in query params for simple reads, naming temporal filters by dimension (`dateFrom`, `createdFrom`) rather than generic `from`/`to` (see `api-conventions.md`).
- If filters become too complex for a readable URL, create a search resource intentionally (e.g. `POST /v1/transaction-searches`) rather than falling back to POST-only list actions.

```http
GET /v1/transactions?accountId=01HZ...&dateFrom=2026-01-01&dateTo=2026-01-31&cursor=abc&sort=date:desc
```

## Conditional Requests (ETag)

For cacheable reads, return an `ETag` and honor `If-None-Match`, replying `304 Not Modified` with an empty body when the representation is unchanged. Declare `304` in the route's `responses`. This cuts bandwidth for clients that poll or re-fetch stable resources.

## `createRoute` Examples (REST)

### Collection read (`GET`)

```ts
import { createRoute, z } from "@hono/zod-openapi";
import { ErrorResponseSchema, CustomerCollectionSchema } from "@acme/api-contracts";

const ListQuerySchema = z
  .object({
    type: z.enum(["person", "organization"]).optional(),
    cursor: z.string().optional(),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
  })
  .openapi("ListCustomersQuery");

export const listCustomersRoute = createRoute({
  method: "get",
  path: "/v1/customers",
  tags: ["customers"],
  summary: "List customers",
  security: [{ bearerAuth: [] }],
  request: { query: ListQuerySchema },
  responses: {
    200: { description: "Customers", content: { "application/json": { schema: CustomerCollectionSchema } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});
```

### Resource creation (`POST`) — returns the resource directly

Creation is an unsafe operation: it accepts an `Idempotency-Key` header for safe retries and declares `429` with rate-limit headers (see `SKILL.md` §Cross-Cutting Concerns).

```ts
import { createRoute, z } from "@hono/zod-openapi";
import { CreateCustomerRequestSchema, ErrorResponseSchema, CustomerSchema } from "@acme/api-contracts";

const rateLimitHeaders = {
  "Retry-After": { schema: { type: "integer" as const }, description: "Seconds to wait before retrying" },
  "RateLimit-Limit": { schema: { type: "integer" as const } },
  "RateLimit-Remaining": { schema: { type: "integer" as const } },
  "RateLimit-Reset": { schema: { type: "integer" as const } },
};

export const createCustomerRoute = createRoute({
  method: "post",
  path: "/v1/customers",
  tags: ["customers"],
  summary: "Create a customer",
  security: [{ bearerAuth: [] }],
  request: {
    headers: z.object({ "Idempotency-Key": z.string().uuid().optional() }),
    body: { required: true, content: { "application/json": { schema: CreateCustomerRequestSchema } } },
  },
  responses: {
    201: { description: "Created", content: { "application/json": { schema: CustomerSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: ErrorResponseSchema } } },
    409: { description: "Idempotency-Key reused with a different payload, or business conflict", content: { "application/json": { schema: ErrorResponseSchema } } },
    429: { description: "Rate limited", headers: rateLimitHeaders, content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});
```

### Resource deletion / disconnection (`DELETE`) — `204`

```ts
import { createRoute, z } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "@acme/api-contracts";

const ParamsSchema = z.object({ id: z.string().uuid() }).openapi("IntegrationParams");

export const deleteIntegrationRoute = createRoute({
  method: "delete",
  path: "/v1/integrations/{id}",
  tags: ["integrations"],
  summary: "Disconnect an integration",
  security: [{ bearerAuth: [] }],
  request: { params: ParamsSchema },
  responses: {
    204: { description: "Disconnected" },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: ErrorResponseSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: ErrorResponseSchema } } },
    409: { description: "State conflict", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});
```

The controller returns the resource directly on success, validated at runtime through the shared `respond()` helper (see `SKILL.md` §Validate Both Directions) — the resource schema for REST, never wrapped:

```ts
import { respond } from "@/infra/http/respond";
import { CustomerCollectionSchema } from "@acme/api-contracts";

this.app.openapi(listCustomersRoute, async context => {
  const query = context.req.valid("query");
  const credential = context.get("credential");
  const result = await this.listUseCase.execute({ workspaceId: credential.workspaceId, ...query });
  if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
  return respond(context, CustomerCollectionSchema, result.value, 200); // unwrapped, runtime-validated
});
```

## Naming and Pitfalls (REST)

- Use plural resources: `/v1/workspaces`, not `/v1/workspace` for collections.
- Do not reintroduce POST-only action paths like `/list`, `/get`, `/update`, `/delete`.
- Do not wrap single resources in `{ data, message }` — return them directly.
- Do not make breaking response changes without versioning.
