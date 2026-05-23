# Cancel Subscription Endpoint — Complete Design

## 1. Chosen Style & Inference Reasoning

**Chosen style: POST-only action-based.**

The skill (`SKILL.md` §"Choose the API Style First") requires determining the style in a fixed order:

1. **Project docs win.** No `AGENTS.md`, ADR, or design doc was provided that specifies a style, so this step yields nothing to override the inference.
2. **Infer from existing routes.** The task states the repo already has routes declared with `createRoute({ method: "post", ... })` and paths shaped like `/billing/subscriptions/cancel`. Per the skill's rule, *"every route `method: "post"` with `/<action>` suffixes means POST-only."* The path `/billing/subscriptions/cancel` is exactly `POST /<context=billing>/<entity=subscriptions>/<action=cancel>` — a workflow action, which `style-post-only.md` explicitly allows alongside `create | get | list | update | delete`.
3. Greenfield/ambiguous: not applicable — step 2 resolved decisively.

Therefore the new endpoint must be **POST-only**, and I must **not** introduce a REST verb (e.g. `DELETE /billing/subscriptions/{id}`) into this surface. `cancel` is a state transition, not a resource deletion, so it is correctly modeled as a dedicated action path rather than `delete`.

**Endpoint:** `POST /billing/subscriptions/cancel`

- Method: `POST` (every endpoint is POST in this style).
- Input: JSON body only — no query string, no URL params.
- Body for an action keyed by identity: `{ id }` plus any action-specific options.
- Response: the `{ data, message }` success envelope; errors use the shared `{ error, details }` envelope.
- Scope (`organizationId` / `workspaceId`) is derived from the session, never accepted in the body.

---

## 2. Use Case First (Clean Architecture, top-down)

Design starts from the application use case, then maps to HTTP. Controllers are thin adapters.

```ts
// src/contexts/billing/application/use-cases/cancel-subscription.use-case.ts
import type { Result } from "@/shared/result";

/** When the cancellation takes effect. */
export type CancelSubscriptionMode = "at_period_end" | "immediately";

export interface CancelSubscriptionInput {
  /** Subscription identifier. */
  subscriptionId: string;
  /** Tenant scope, derived from the session — never from the client body. */
  organizationId: string;
  /** Default: cancel at the end of the current billing period. */
  mode: CancelSubscriptionMode;
  /** Optional free-text reason for analytics/audit. */
  reason?: string;
}

export interface CancelSubscriptionOutput {
  id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  cancelAtPeriodEnd: boolean;
  /** ISO-8601; set when cancellation is scheduled for period end. */
  cancelAt: string | null;
  /** ISO-8601; set once actually canceled. */
  canceledAt: string | null;
  currentPeriodEnd: string;
  updatedAt: string;
}

// Typed application errors (mapped to HTTP in ONE shared helper, never inline):
//   SubscriptionNotFoundError        -> 404  SUBSCRIPTION_NOT_FOUND
//   SubscriptionAlreadyCanceledError -> 409  SUBSCRIPTION_ALREADY_CANCELED
//   SubscriptionNotCancelableError   -> 422  SUBSCRIPTION_NOT_CANCELABLE
//   ForbiddenSubscriptionAccessError -> 403  SUBSCRIPTION_ACCESS_FORBIDDEN

export interface CancelSubscriptionUseCase {
  execute(input: CancelSubscriptionInput): Promise<Result<CancelSubscriptionOutput, AppError>>;
}
```

The use case owns the domain rules (idempotency, allowed state transitions). The controller only parses HTTP → DTO, calls `execute`, and maps the result back to HTTP.

---

## 3. Zod Contract Schemas (shared `api-contracts` package)

Zod is the single source of truth: it drives runtime validation, `z.infer` types, and the OpenAPI spec. Every reused schema calls `.openapi("RefName")` so it lands in `components.schemas`. The cancel action gets its **own** request and response schema, and the response wraps the resource in the `{ data, message }` envelope.

```ts
// packages/api-contracts/src/billing/subscriptions.ts
import { z } from "@hono/zod-openapi";

/** Subscription resource / view model. Reused across billing endpoints. */
export const SubscriptionSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "0198f5f3-2b1a-7c44-9f0e-2c1d4a6b8e10" }),
    status: z
      .enum(["active", "trialing", "past_due", "canceled", "incomplete"])
      .openapi({ example: "canceled" }),
    cancelAtPeriodEnd: z.boolean().openapi({ example: true }),
    cancelAt: z.string().datetime().nullable().openapi({ example: "2026-06-30T23:59:59.000Z" }),
    canceledAt: z.string().datetime().nullable().openapi({ example: null }),
    currentPeriodEnd: z.string().datetime().openapi({ example: "2026-06-30T23:59:59.000Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-05-23T12:00:00.000Z" }),
  })
  .openapi("Subscription");

/** Request body for the cancel action. JSON body only — id lives in the body, not the path. */
export const CancelSubscriptionRequestSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "0198f5f3-2b1a-7c44-9f0e-2c1d4a6b8e10" }),
    mode: z
      .enum(["at_period_end", "immediately"])
      .default("at_period_end")
      .openapi({ example: "at_period_end" }),
    reason: z.string().min(1).max(500).optional().openapi({ example: "Switching plans" }),
  })
  .openapi("CancelSubscriptionRequest");

/** Success envelope — ALWAYS { data, message }. Never the resource at the top level. */
export const CancelSubscriptionResponseSchema = z
  .object({
    data: SubscriptionSchema,
    message: z.string().openapi({ example: "Success" }),
  })
  .openapi("CancelSubscriptionResponse");

// Inferred types (no hand-written duplicates):
export type CancelSubscriptionRequest = z.infer<typeof CancelSubscriptionRequestSchema>;
export type CancelSubscriptionResponse = z.infer<typeof CancelSubscriptionResponseSchema>;
```

The shared error schema is defined once for the whole API (used by `400/401/403/404/409/422/500`):

```ts
// packages/api-contracts/src/shared/error.ts
import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: "Subscription not found" }),
    details: z
      .object({
        code: z.string().openapi({ example: "SUBSCRIPTION_NOT_FOUND" }),
        requestId: z.string().optional().openapi({ example: "req_01HZ..." }), // required in production
      })
      .catchall(z.unknown()), // allows fieldErrors, resourceId, retryAfter, ...
  })
  .openapi("ErrorResponse");
```

---

## 4. `createRoute` Declaration (POST-only)

Declares method, path, body schema, `security`, and **every** status code the endpoint can emit. This is what makes the endpoint appear in `/openapi.json`.

```ts
// src/contexts/billing/infra/http/routes/cancel-subscription.route.ts
import { createRoute } from "@hono/zod-openapi";
import {
  CancelSubscriptionRequestSchema,
  CancelSubscriptionResponseSchema,
  ErrorResponseSchema,
} from "api-contracts";

export const cancelSubscriptionRoute = createRoute({
  method: "post",
  path: "/billing/subscriptions/cancel",
  tags: ["billing.subscriptions"],
  summary: "Cancel a subscription",
  description: "Cancels a subscription immediately or at the end of the current billing period.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: CancelSubscriptionRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Subscription canceled (or scheduled to cancel at period end)",
      content: { "application/json": { schema: CancelSubscriptionResponseSchema } },
    },
    400: {
      description: "Validation error at the HTTP boundary",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Missing or invalid authentication",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Authenticated but not allowed to cancel this subscription",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Subscription not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    409: {
      description: "Subscription already canceled",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    422: {
      description: "Subscription is in a state that cannot be canceled",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Unhandled server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
```

**Status-code choice for cancel:** `200 OK` is correct because the response carries a body (the updated subscription inside the envelope). `204 No Content` would be wrong here — the action returns the new state. `202 Accepted` is reserved for async REST resource-style operations, not this POST-only synchronous action.

---

## 5. Controller Wiring (thin, self-registering)

The controller mounts the route with `app.openapi(route, handler)` — never `app.post(...)`. `createRoute` already validates the JSON body, so no separate `zValidator` is added. Scope comes from the session; errors route through the single shared helper.

```ts
// src/contexts/billing/infra/http/controllers/cancel-subscription.controller.ts
import type { OpenAPIHono } from "@hono/zod-openapi";
import { cancelSubscriptionRoute } from "../routes/cancel-subscription.route";
import { mapApplicationErrorToResponse } from "@/infra/http/error-handling";
import type { CancelSubscriptionUseCase } from "@/contexts/billing/application/use-cases/cancel-subscription.use-case";

export class CancelSubscriptionController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase
  ) {
    this.app.openapi(cancelSubscriptionRoute, async context => {
      const body = context.req.valid("json"); // { id, mode, reason? } — validated by createRoute
      const session = context.get("session"); // auth middleware populated this

      const result = await this.cancelSubscriptionUseCase.execute({
        subscriptionId: body.id,
        mode: body.mode,
        reason: body.reason,
        organizationId: session.organizationId, // scope from session, never from body
      });

      if (!result.ok) {
        // Single shared helper maps typed app errors -> { error, details } + status.
        return mapApplicationErrorToResponse(context, result.error);
      }

      // POST-only success envelope — resource wrapped in `data`, never top-level.
      return context.json({ data: result.value, message: "Success" }, 200);
    });
  }
}
```

---

## 6. Status Codes & Error Mapping

| Outcome | Status | `details.code` |
| --- | --- | --- |
| Canceled / scheduled to cancel | `200 OK` | — (success envelope) |
| Body fails Zod validation | `400 Bad Request` | `VALIDATION_ERROR` |
| No / invalid bearer token | `401 Unauthorized` | `UNAUTHENTICATED` |
| Subscription belongs to another tenant / not allowed | `403 Forbidden` | `SUBSCRIPTION_ACCESS_FORBIDDEN` |
| Subscription id not found in scope | `404 Not Found` | `SUBSCRIPTION_NOT_FOUND` |
| Already canceled (state conflict) | `409 Conflict` | `SUBSCRIPTION_ALREADY_CANCELED` |
| State forbids cancellation (domain rule) | `422 Unprocessable Entity` | `SUBSCRIPTION_NOT_CANCELABLE` |
| Unhandled | `500 Internal Server Error` | `INTERNAL_ERROR` |

`409` vs `422`: `409` is a duplicate/idempotency conflict (already in the canceled state); `422` is a domain-validation failure distinct from HTTP validation (e.g. an `incomplete` subscription that was never activated and cannot be canceled).

The mapping lives in the **single shared helper** — never inlined in the controller. If a new billing error type appears, extend the helper rather than branching inline:

```ts
// src/infra/http/error-handling.ts
import type { Context } from "hono";

export function mapApplicationErrorToResponse(context: Context, error: AppError) {
  const requestId = context.get("requestId");

  switch (error.kind) {
    case "SubscriptionNotFound":
      return context.json(
        { error: "Subscription not found", details: { code: "SUBSCRIPTION_NOT_FOUND", requestId } },
        404
      );
    case "SubscriptionAlreadyCanceled":
      return context.json(
        { error: "Subscription is already canceled", details: { code: "SUBSCRIPTION_ALREADY_CANCELED", requestId } },
        409
      );
    case "SubscriptionNotCancelable":
      return context.json(
        { error: "Subscription cannot be canceled in its current state", details: { code: "SUBSCRIPTION_NOT_CANCELABLE", requestId } },
        422
      );
    case "ForbiddenSubscriptionAccess":
      return context.json(
        { error: "You are not allowed to cancel this subscription", details: { code: "SUBSCRIPTION_ACCESS_FORBIDDEN", requestId } },
        403
      );
    default:
      return context.json(
        { error: "Internal server error", details: { code: "INTERNAL_ERROR", requestId } },
        500
      );
  }
}
```

### Error Envelope (examples)

```jsonc
// 404
{ "error": "Subscription not found", "details": { "code": "SUBSCRIPTION_NOT_FOUND", "requestId": "req_01HZ..." } }
// 409
{ "error": "Subscription is already canceled", "details": { "code": "SUBSCRIPTION_ALREADY_CANCELED", "requestId": "req_01HZ..." } }
```

`error` is always a human-readable string; the machine-readable `code` lives only inside `details`; `requestId` is required in production. Never `{ error: { code, message } }`, never a top-level `code`.

### Success Envelope (200)

```jsonc
{
  "data": {
    "id": "0198f5f3-2b1a-7c44-9f0e-2c1d4a6b8e10",
    "status": "active",
    "cancelAtPeriodEnd": true,
    "cancelAt": "2026-06-30T23:59:59.000Z",
    "canceledAt": null,
    "currentPeriodEnd": "2026-06-30T23:59:59.000Z",
    "updatedAt": "2026-05-23T12:00:00.000Z"
  },
  "message": "Success"
}
```

For `mode: "immediately"` the same shape returns `status: "canceled"`, `canceledAt` set, and `cancelAtPeriodEnd: false`.

---

## 7. OpenAPI / Docs Guidance

- The spec is generated from the Zod schemas above — never hand-authored, never committed to git. It is served at `/openapi.json` and rendered by Scalar UI at `/reference`, both wired once at bootstrap.
- `bearerAuth` is registered once at bootstrap and referenced per route via `security: [{ bearerAuth: [] }]` — auth is machine-readable, not buried in `description`.

```ts
// src/app.ts (bootstrap — already present; cancel route inherits it)
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
```

Because `SubscriptionSchema`, `CancelSubscriptionRequestSchema`, `CancelSubscriptionResponseSchema`, and `ErrorResponseSchema` all call `.openapi("RefName")`, they appear as stable `$ref`s in `components.schemas`, and generated clients (openapi-typescript / orval / Kubb) can model both the success envelope and every error.

---

## 8. Testing Strategy

- **Contracts (unit):** assert `CancelSubscriptionRequestSchema` accepts `{ id }` (defaulting `mode` to `at_period_end`), accepts `{ id, mode: "immediately", reason }`, and rejects a missing/non-UUID `id` and an out-of-range `reason`. Assert `CancelSubscriptionResponseSchema` enforces the `{ data, message }` envelope and `data.status` enum.
- **Controller (integration):** drive the Hono route end to end:
  - `200` — happy path; assert body is exactly `{ data, message }` with the updated subscription, `cancelAtPeriodEnd: true` for `at_period_end`.
  - `400` — malformed body (missing `id`).
  - `401` — no bearer token.
  - `403` — token for a different tenant.
  - `404` — unknown `id`.
  - `409` — cancel an already-canceled subscription (idempotency/state conflict).
  - `422` — cancel an `incomplete` subscription.
  - Every error asserts the `{ error, details: { code } }` shape with the expected `code`.
- **OpenAPI (contract):** boot the server, fetch `/openapi.json`, assert `paths["/billing/subscriptions/cancel"].post` exists, lists response codes `200/400/401/403/404/409/422/500`, references `CancelSubscriptionResponse` and `ErrorResponse`, and carries the `bearerAuth` security entry. Diff schema names + response codes against a committed snapshot (not the full body) to catch accidental removals.
- **E2E:** exercise the cancel flow through a generated client against a seeded active subscription, verifying the resulting state and that a second cancel yields `409`.

---

## 9. Checklist Conformance

1. **Style consistent** — POST-only `POST /billing/subscriptions/cancel`; no REST verb introduced. ✓
2. **Contracts shared + `.openapi("RefName")`** — all four schemas annotated in `api-contracts`. ✓
3. **`createRoute` + `app.openapi`**, every success and error code declared, plus `security`. ✓
4. **Parameter placement** — JSON body only (`id`, `mode`, `reason`); no path/query params. ✓
5. **Response shape** — `{ data, message }` success envelope; `{ error, details: { code } }` errors. ✓
6. **Thin, self-registering controller** delegating to the use case. ✓
7. **Typed errors via the single shared helper** — no inline `context.json` error responses. ✓
8. **Auth machine-readable** in OpenAPI (`security`) and enforced via session middleware. ✓
9. **`/openapi.json` regenerates at boot** and is verified by a contract test fetching the spec. ✓
10. **Tests** cover success, validation, auth, authorization, and domain conflicts. ✓
