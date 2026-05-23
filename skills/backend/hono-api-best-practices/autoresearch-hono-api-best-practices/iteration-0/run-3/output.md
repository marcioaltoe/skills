# Audit — `app.get('/v1/orders/:id', handler)` returning `{ data: order }`

## Verdict

**NOT compliant.** The route fails the API Design Checklist on multiple counts. The single most important problem is that **it is internally inconsistent**: it combines REST signals (the `GET` verb and the `/v1/orders/:id` resource path) with the POST-only signature (the `{ data, message }`-style envelope `{ data: order }`). The skill forbids mixing styles within one API surface. On top of that, it is registered with `app.get(...)` instead of `createRoute` + `app.openapi(...)`, so it never appears in `/openapi.json` regardless of style.

---

## Step 0 — Determine the project's API style

The skill mandates locking onto exactly one of two mutually exclusive styles before auditing. Resolution order from `SKILL.md`:

1. **Project docs win.** Checked for `AGENTS.md`, ADRs, and design docs that name an API style. **None found** that govern a Hono API project. (The only `AGENTS.md` files in scope are skill-authoring docs, not a host backend.)
2. **Infer from existing routes.** Grepped for `createRoute({` across the codebase. **No real registered routes exist** outside the skill's own reference examples — there is no established convention to inherit.
3. **Greenfield / ambiguous → ask the user; default to standard REST for a new public API** unless the project has already standardized on POST-only.

**Conclusion:** This is the **ambiguous/greenfield** case. No style is fixed yet, so the project must pick one. The route as written cannot be compliant under *either* style because it borrows from both — that mismatch is the central violation. Because the route already uses HTTP verbs and a resource path with `/:id`, and because the skill defaults new public APIs to **standard REST**, REST is the recommended target. The fully corrected POST-only variant is also given so the team can choose, but the two must never coexist.

> **Action required:** confirm the project style. The corrected designs below show both; ship exactly one.

---

## Step 1 — Diagnose the route as written

```ts
// As written — NON-COMPLIANT
app.get('/v1/orders/:id', handler); // returns { data: order }
```

Signals it sends:

| Signal | Points to | Notes |
| --- | --- | --- |
| `GET` verb | Standard REST | POST-only uses `POST` for every endpoint |
| `/v1/orders/:id` (verb + path param) | Standard REST | POST-only would be `POST /<context>/orders/get` with `{ id }` in the JSON body, no path param |
| `{ data: order }` envelope | POST-only | REST returns the resource **directly**, unwrapped |
| `app.get(...)` registration | Neither — invalid in both | Both styles require `createRoute` + `app.openapi(...)` |

The route is a **chimera**: REST transport with a POST-only response envelope. Whatever style the project adopts, at least one of these has to change.

---

## Step 2 — API Design Checklist (item by item)

Walking all 10 items of `SKILL.md` §API Design Checklist against the route as written. Where a verdict depends on the chosen style, both are shown.

| # | Checklist item | Verdict | Finding |
| --- | --- | --- | --- |
| 1 | Follows the project's chosen style consistently (no mixing REST and POST-only) | **FAIL** | The defining violation. REST verb + path combined with the POST-only `{ data, ... }` envelope. Mixing is explicitly forbidden. |
| 2 | Contracts in the shared package, annotated with `.openapi("RefName")` | **FAIL** | No schemas referenced at all. `order`/`data` are untyped; nothing is annotated, so nothing reaches `components.schemas`. No request param schema and no response schema. |
| 3 | Uses `createRoute` + `app.openapi`, declaring every success/error status code plus `security` | **FAIL** | Uses `app.get(...)`. Endpoint vanishes from `/openapi.json`. No `responses` map (200/401/403/404 undeclared), no `security` entry. |
| 4 | Parameter placement matches the style | **FAIL (or REST-partial)** | `:id` as a path param is correct **for REST** but should be a validated `z.string()` (e.g. `.uuid()`/`.ulid()`) param schema, not a raw Hono `:id`. For **POST-only** it is wrong outright — the id must be `{ id }` in the JSON body with no path param. |
| 5 | Response shape matches the style; errors use `{ error, details: { code } }` | **FAIL** | `{ data: order }` is the POST-only envelope but with the `message` field missing — so it is not even a valid POST-only envelope. For REST it is wrong: REST returns the order directly, unwrapped. No error envelope is defined for the 404/401/403 paths. |
| 6 | Controller thin, self-registering, delegates to a use case | **UNKNOWN / likely FAIL** | `handler` is opaque. The skill requires a thin controller that self-registers via `app.openapi(route, handler)`, parses validated input into a DTO, and calls a use case. The `app.get` registration already breaks the self-registration contract. |
| 7 | Typed application errors map through the shared HTTP error helper | **UNKNOWN / likely FAIL** | No visible error handling. A `GET .../:id` must handle "not found" (404) and auth (401/403) via `mapApplicationErrorToResponse(context, error)` — not inline `context.json(...)`. Nothing here routes through the shared helper. |
| 8 | Auth/authorization machine-readable in OpenAPI and enforced | **FAIL** | No `security: [{ bearerAuth: [] }]`. With `app.get`, auth cannot be expressed in the spec at all. Order reads are tenant-scoped and must be authenticated/authorized; scope (workspace/org) must come from the credential, never from request input. |
| 9 | `/openapi.json` regenerates at boot and reflects the change | **FAIL** | Direct `app.get(...)` is invisible to `@hono/zod-openapi`. The endpoint will be absent from the generated spec, Scalar UI, and any generated clients. |
| 10 | Tests cover success, validation failure, auth failure, authorization failure, domain conflicts | **FAIL (assumed)** | No contract/controller/OpenAPI tests are derivable from a bare `app.get`. At minimum: 200, 400 (bad id), 401, 403, 404. |

**Score: 0 of 10 clean passes.** Items 1, 2, 3, 5, 8, 9 are hard fails; 4 is style-dependent; 6, 7, 10 fail or are unverifiable but cannot pass as written.

---

## Step 3 — Corrected design

### Shared error contract (both styles)

```ts
// packages/api-contracts/src/error.ts
import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z
      .object({
        code: z.string(), // required, SCREAMING_SNAKE_CASE
        requestId: z.string().optional(), // required in production
      })
      .catchall(z.unknown()),
  })
  .openapi("ErrorResponse");
```

### Order resource schema (both styles share the base resource)

```ts
// packages/api-contracts/src/orders.ts
import { z } from "@hono/zod-openapi";

export const OrderSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "0198f5f3-1c2d-7a40-9b11-7c0a2f4e5d6a" }),
    status: z.enum(["pending", "paid", "shipped", "cancelled"]),
    total: z.string().openapi({ example: "123.45" }),
    currency: z.string().length(3).openapi({ example: "BRL" }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Order");
```

---

### Option A — Standard REST (recommended default for a new public API)

Keep `GET /v1/orders/{id}`, but register it properly and **return the order directly** (drop the `{ data }` wrapper).

```ts
// packages/api-contracts/src/orders.ts (add)
import { z } from "@hono/zod-openapi";

export const GetOrderParamsSchema = z
  .object({ id: z.string().uuid() })
  .openapi("GetOrderParams");
```

```ts
// src/contexts/orders/infra/http/routes/get-order.route.ts
import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  GetOrderParamsSchema,
  OrderSchema,
} from "@/api-contracts";

export const getOrderRoute = createRoute({
  method: "get",
  path: "/v1/orders/{id}", // OpenAPI path param syntax, not Hono ":id"
  tags: ["orders"],
  summary: "Get an order by id",
  security: [{ bearerAuth: [] }],
  request: { params: GetOrderParamsSchema },
  responses: {
    200: {
      description: "The order",
      content: { "application/json": { schema: OrderSchema } }, // returned directly, unwrapped
    },
    400: { description: "Invalid id", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: ErrorResponseSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});
```

```ts
// src/contexts/orders/infra/http/orders.controller.ts
import type { OpenAPIHono } from "@hono/zod-openapi";
import { getOrderRoute } from "./routes/get-order.route";
import { mapApplicationErrorToResponse } from "@/infra/http/error-handling";
import type { GetOrderUseCase } from "@/contexts/orders/application/get-order.use-case";

export class OrdersController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly getOrderUseCase: GetOrderUseCase
  ) {
    this.app.openapi(getOrderRoute, async context => {
      const { id } = context.req.valid("param");
      const credential = context.get("credential"); // workspace/org scope from auth, not from input

      const result = await this.getOrderUseCase.execute({
        orderId: id,
        workspaceId: credential.workspaceId,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json(result.value, 200); // the Order, unwrapped — no { data }
    });
  }
}
```

**What changed vs. the original:** `app.get` → `createRoute` + `app.openapi`; `:id` → validated `{id}` param schema; `{ data: order }` → the `Order` returned directly; added `security`, full `responses` (400/401/403/404), shared error helper, and tenant scope from the credential.

---

### Option B — POST-only action-based (only if the project has standardized on it)

Under POST-only the verb, path, and parameter placement all change: `POST /<context>/orders/get`, id in the **JSON body**, response wrapped in the exact `{ data, message }` envelope.

```ts
// packages/api-contracts/src/orders/get.ts
import { z } from "@hono/zod-openapi";
import { OrderSchema } from "../orders";

export const GetOrderRequestSchema = z
  .object({ id: z.string().uuid() }) // id in the body, not the URL
  .openapi("GetOrderRequest");

export const GetOrderResponseSchema = z
  .object({ data: OrderSchema, message: z.string() }) // exact envelope — message required
  .openapi("GetOrderResponse");
```

```ts
// src/contexts/orders/infra/http/routes/get-order.route.ts
import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  GetOrderRequestSchema,
  GetOrderResponseSchema,
} from "@/api-contracts";

export const getOrderRoute = createRoute({
  method: "post",
  path: "/orders/orders/get", // POST /<context>/<entity>/<action>; pick the real context segment
  tags: ["orders"],
  summary: "Get an order by id",
  security: [{ bearerAuth: [] }],
  request: {
    body: { required: true, content: { "application/json": { schema: GetOrderRequestSchema } } },
  },
  responses: {
    200: { description: "The order", content: { "application/json": { schema: GetOrderResponseSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: ErrorResponseSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});
```

```ts
// controller
this.app.openapi(getOrderRoute, async context => {
  const { id } = context.req.valid("json");
  const session = context.get("session");

  const result = await this.getOrderUseCase.execute({ orderId: id, organizationId: session.organizationId });

  if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
  return context.json({ data: result.value, message: "Success" }, 200); // exact envelope, with message
});
```

**Note on the original's envelope:** even read as POST-only, `{ data: order }` is invalid because the required `message` field is missing, and because the transport (`GET` + path param) is wrong for POST-only.

---

## Summary of violations and fixes

| Violation | Style affected | Fix |
| --- | --- | --- |
| Mixes REST transport with POST-only `{ data }` envelope | Both | Pick one style; align transport and response shape. |
| Registered with `app.get(...)` → invisible to `/openapi.json` | Both | Use `createRoute` + `app.openapi(route, handler)`. |
| No `.openapi("RefName")` schemas for params/response/error | Both | Define `OrderSchema`, param/request schema, and `ErrorResponseSchema` in `api-contracts`, all annotated. |
| No `responses` declared (200/400/401/403/404 missing) | Both | List every emitted status code in `createRoute`. |
| No `security` entry; auth not machine-readable | Both | Add `security: [{ bearerAuth: [] }]`; register the scheme once at bootstrap. |
| Raw Hono `:id`, unvalidated | REST | Use OpenAPI `{id}` with a validated param schema (`z.string().uuid()`). |
| Id in URL path | POST-only | Move id into the JSON body (`{ id }`); use `POST /<context>/orders/get`. |
| `{ data: order }` wrapper | REST | Return the `Order` directly (unwrapped). |
| `{ data: order }` missing `message` | POST-only | Use the exact `{ data, message }` envelope. |
| Error path undefined; risk of inline error responses | Both | Route all typed errors through `mapApplicationErrorToResponse`; use the `{ error, details: { code, requestId } }` envelope. |
| Scope possibly trusted from input | Both | Derive workspace/org from the credential/session, never from request input. |
| No tests | Both | Cover 200, 400 (bad id), 401, 403, 404, plus an `/openapi.json` contract test asserting the endpoint, method, schemas, codes, and security. |
