# Design: Invoice Endpoints (List + Create) — Bun + Hono + `api-contracts`

Backend: Bun + Hono with `@hono/zod-openapi`, Clean Architecture, Zod contracts in a shared `api-contracts` package, OpenAPI generated from Zod, thin self-registering controllers, and a single error-mapping helper.

---

## 1. Chosen API Style and Why

**Standard REST** (resource-oriented paths + HTTP verbs).

How the style was determined (per the skill's decision order):

1. **Project docs win.** No `AGENTS.md`, ADR, or design doc in this skill's project specifies a style — nothing to override the default.
2. **Infer from existing routes.** Greenfield: there are no existing `createRoute({ ... })` declarations to infer REST vs POST-only from.
3. **Greenfield/ambiguous default.** The skill says: *"Default to standard REST for new public APIs unless the project has already standardized on POST-only."* Listing and creating invoices is a textbook resource collection (`GET`/`POST` on `/v1/invoices`), so REST is the natural and lower-noise fit. It produces cleaner generated SDKs (collection/resource returned directly, no envelope) and uses HTTP status codes for outcome signaling.

Consequently every invoice endpoint here is REST: resource paths, conventional verbs, params in path/query/body, and responses returning the resource/collection directly. The two endpoints in scope:

```text
GET    /v1/invoices          # list (paginated, filterable)
POST   /v1/invoices          # create
```

(`GET /v1/invoices/{id}`, `PATCH`, and a state transition like `POST /v1/invoices/{id}/void` are noted under §8 for surface consistency but are out of scope for this task.)

> Consistency rule: if this project later adds endpoints, they all stay REST — never mix in POST-only action paths such as `/invoices/list` or `/invoices/create`.

---

## 2. Start From the Use Cases (Clean Architecture)

Bounded context: `billing`. Two application use cases drive the two endpoints. The HTTP layer is a thin adapter over these.

```ts
// apps/api/src/application/billing/list-invoices.usecase.ts
export interface ListInvoicesInput {
  workspaceId: string;            // injected from auth/credential — never from the client
  status?: "draft" | "open" | "paid" | "void" | "uncollectible";
  customerId?: string;
  cursor?: string;
  pageSize: number;
}

export interface InvoiceDTO {
  id: string;
  number: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  customerId: string;
  currency: string;
  amountDue: string;              // minor-unit-safe decimal as string
  amountPaid: string;
  lineItems: Array<{ description: string; quantity: number; unitAmount: string }>;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListInvoicesOutput {
  items: InvoiceDTO[];
  nextCursor: string | null;
  hasMore: boolean;
}

// apps/api/src/application/billing/create-invoice.usecase.ts
export interface CreateInvoiceInput {
  workspaceId: string;            // from credential
  customerId: string;
  currency: string;
  dueDate?: string;
  lineItems: Array<{ description: string; quantity: number; unitAmount: string }>;
  idempotencyKey?: string;
}
```

Both use cases return a typed `Result<T, ApplicationError>` (the `{ ok, value }` / `{ ok, error }` discriminated union the controller pattern expects). Typed errors (e.g. `INVOICE_CUSTOMER_NOT_FOUND`, `INVOICE_DUPLICATE`, `INVOICE_INVALID_LINE_ITEMS`) are produced here and mapped to HTTP in one place (§7).

---

## 3. Zod Contracts in `api-contracts`

All schemas live in the shared package, extend Zod via `@hono/zod-openapi`, and call `.openapi("RefName")` so they appear in `components.schemas`. Single resources are returned **directly** (no `{ data, message }` wrapper); the list uses the shared structured-collection helper.

### 3.1 Shared error envelope (reused by every endpoint)

```ts
// packages/api-contracts/src/error.ts
import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: "Invoice customer not found" }),
    details: z
      .object({
        code: z.string().openapi({ example: "INVOICE_CUSTOMER_NOT_FOUND" }),
        requestId: z.string().optional().openapi({ example: "req_01HZ..." }), // required in production
      })
      .catchall(z.unknown()), // fieldErrors, resourceId, retryAfter, ...
  })
  .openapi("ErrorResponse");

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
```

### 3.2 Reusable collection helper (shared by all list endpoints)

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

### 3.3 Invoice schemas

```ts
// packages/api-contracts/src/invoices.ts
import { z } from "@hono/zod-openapi";
import { collectionSchema } from "./pagination";

export const InvoiceStatusSchema = z
  .enum(["draft", "open", "paid", "void", "uncollectible"])
  .openapi("InvoiceStatus");

// Monetary amounts as decimal strings to avoid float rounding; ISO-4217 currency.
const MoneySchema = z.string().regex(/^\d+(\.\d{1,2})?$/);

export const InvoiceLineItemSchema = z
  .object({
    description: z.string().min(1).max(500).openapi({ example: "Pro plan — May 2026" }),
    quantity: z.number().int().min(1).openapi({ example: 1 }),
    unitAmount: MoneySchema.openapi({ example: "49.90" }),
  })
  .openapi("InvoiceLineItem");

// Returned DIRECTLY by single-resource reads and by POST creation (no envelope).
export const InvoiceSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "0198f5f3-1c2d-7a4b-9e10-2f3a4b5c6d7e" }),
    number: z.string().openapi({ example: "INV-2026-000042" }),
    status: InvoiceStatusSchema,
    customerId: z.string().uuid().openapi({ example: "0198f5f3-aaaa-7a4b-9e10-2f3a4b5c6d7e" }),
    currency: z.string().length(3).openapi({ example: "BRL" }),
    amountDue: MoneySchema.openapi({ example: "49.90" }),
    amountPaid: MoneySchema.openapi({ example: "0.00" }),
    lineItems: z.array(InvoiceLineItemSchema),
    dueDate: z.string().date().nullable().openapi({ example: "2026-06-15" }),
    createdAt: z.string().datetime().openapi({ example: "2026-05-23T12:00:00.000Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-05-23T12:00:00.000Z" }),
  })
  .openapi("Invoice");

export const InvoiceCollectionSchema = collectionSchema(InvoiceSchema, "InvoiceCollection");

// Creation payload — scope (workspaceId) is NOT accepted from the client; it comes from auth.
export const CreateInvoiceRequestSchema = z
  .object({
    customerId: z.string().uuid(),
    currency: z.string().length(3).openapi({ example: "BRL" }),
    dueDate: z.string().date().optional(),
    lineItems: z.array(InvoiceLineItemSchema).min(1),
  })
  .openapi("CreateInvoiceRequest");

// List query — pagination + filters in query params.
export const ListInvoicesQuerySchema = z
  .object({
    status: InvoiceStatusSchema.optional(),
    customerId: z.string().uuid().optional(),
    cursor: z.string().optional(),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
  })
  .openapi("ListInvoicesQuery");

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceCollection = z.infer<typeof InvoiceCollectionSchema>;
export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>;
export type ListInvoicesQuery = z.infer<typeof ListInvoicesQuerySchema>;
```

```ts
// packages/api-contracts/src/index.ts
export * from "./error";
export * from "./pagination";
export * from "./invoices";
```

Zod is the single source of truth: these schemas drive runtime validation (via `createRoute`), the `z.infer` TypeScript types, and the OpenAPI spec — no hand-written OpenAPI YAML/JSON, no duplicated types.

---

## 4. `createRoute` Declarations

Every endpoint is declared with `createRoute`, lists **every** status code it can emit, and declares `security`. Note `cursor`-based pagination and query filters for the list; `201 Created` with a `Location` header for create.

```ts
// apps/api/src/infra/http/routes/invoices.route.ts
import { createRoute } from "@hono/zod-openapi";
import {
  CreateInvoiceRequestSchema,
  ErrorResponseSchema,
  InvoiceCollectionSchema,
  InvoiceSchema,
  ListInvoicesQuerySchema,
} from "@conexus/api-contracts";

// GET /v1/invoices — collection read (paginated, filterable). Returns the collection directly.
export const listInvoicesRoute = createRoute({
  method: "get",
  path: "/v1/invoices",
  tags: ["invoices"],
  summary: "List invoices",
  security: [{ bearerAuth: [] }],
  request: { query: ListInvoicesQuerySchema },
  responses: {
    200: {
      description: "Invoices",
      content: { "application/json": { schema: InvoiceCollectionSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Unauthenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// POST /v1/invoices — resource creation. Returns the created resource directly with 201.
export const createInvoiceRoute = createRoute({
  method: "post",
  path: "/v1/invoices",
  tags: ["invoices"],
  summary: "Create an invoice",
  security: [{ bearerAuth: [] }],
  request: {
    // Optional idempotency header — recommended for create to make POST safely retryable.
    headers: z.object({ "idempotency-key": z.string().min(1).optional() }),
    body: {
      required: true,
      content: { "application/json": { schema: CreateInvoiceRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      headers: { Location: { schema: { type: "string" }, description: "URL of the created invoice" } },
      content: { "application/json": { schema: InvoiceSchema } },
    },
    400: {
      description: "Validation error (HTTP boundary)",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Unauthenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    409: {
      description: "Conflict (e.g. duplicate via idempotency key)",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    422: {
      description: "Domain validation failure (e.g. customer not found, invalid line items)",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
```

> `z` is imported from `@hono/zod-openapi` at the top of the file alongside `createRoute` if the inline header schema is used:
> `import { createRoute, z } from "@hono/zod-openapi";`

---

## 5. Controller Wiring (Thin, Self-Registering)

The controller mounts routes with `app.openapi(route, handler)` (which validates `param`/`query`/`json`/headers — no separate `zValidator`), parses validated input into the use-case DTO, injects scope from the credential, calls the use case, and maps the result back to HTTP. On success it returns the resource/collection **directly**. The error path goes through the shared helper only.

```ts
// apps/api/src/infra/http/controllers/invoices.controller.ts
import type { OpenAPIHono } from "@hono/zod-openapi";
import { createInvoiceRoute, listInvoicesRoute } from "../routes/invoices.route";
import { mapApplicationErrorToResponse } from "../error-handling";
import type { CreateInvoiceUseCase } from "@/application/billing/create-invoice.usecase";
import type { ListInvoicesUseCase } from "@/application/billing/list-invoices.usecase";

export class InvoicesController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly listInvoices: ListInvoicesUseCase,
    private readonly createInvoice: CreateInvoiceUseCase,
  ) {
    this.registerList();
    this.registerCreate();
  }

  private registerList(): void {
    this.app.openapi(listInvoicesRoute, async (context) => {
      const query = context.req.valid("query");
      const credential = context.get("credential");

      const result = await this.listInvoices.execute({
        workspaceId: credential.workspaceId, // scope from auth, never from client
        ...query,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json(result.value, 200); // unwrapped collection { items, nextCursor, hasMore }
    });
  }

  private registerCreate(): void {
    this.app.openapi(createInvoiceRoute, async (context) => {
      const body = context.req.valid("json");
      const idempotencyKey = context.req.valid("header")["idempotency-key"];
      const credential = context.get("credential");

      const result = await this.createInvoice.execute({
        workspaceId: credential.workspaceId,
        idempotencyKey,
        ...body,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);

      const invoice = result.value;
      context.header("Location", `/v1/invoices/${invoice.id}`);
      return context.json(invoice, 201); // created resource directly
    });
  }
}
```

---

## 6. Status Codes

| Endpoint | Code | When |
| --- | --- | --- |
| `GET /v1/invoices` | `200` | Successful read; returns the collection body |
| | `400` | Bad query params (HTTP-boundary validation) |
| | `401` | Missing/invalid auth |
| | `403` | Authenticated but not allowed to list this workspace's invoices |
| `POST /v1/invoices` | `201` | Created; `Location: /v1/invoices/{id}` header + created resource body |
| | `400` | Malformed/invalid body at the HTTP boundary |
| | `401` | Missing/invalid auth |
| | `403` | Authenticated but not allowed to create in this workspace |
| | `409` | Conflict — duplicate replay of the same idempotency key with a different payload |
| | `422` | Domain validation failure — customer not found, currency mismatch, invalid line items |
| (both) | `429` | Rate limit (if enabled at the gateway) |
| (both) | `500` | Unhandled error |

`400` is reserved for HTTP-boundary (Zod) failures; `422` is the distinct domain-validation failure. All non-2xx bodies use the shared error envelope.

---

## 7. Error Mapping (Single Shared Helper)

No controller, use case, or route handler inlines `context.json({ error, details: { code } }, status)`. Typed application errors map to HTTP in one place; extend the helper for new error types rather than branching inline.

```ts
// apps/api/src/infra/http/error-handling.ts
import type { Context } from "hono";
import type { ApplicationError } from "@/application/errors";

const STATUS_BY_CODE: Record<string, number> = {
  INVOICE_VALIDATION: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  INVOICE_NOT_FOUND: 404,
  INVOICE_DUPLICATE: 409,
  IDEMPOTENCY_KEY_CONFLICT: 409,
  INVOICE_CUSTOMER_NOT_FOUND: 422,
  INVOICE_INVALID_LINE_ITEMS: 422,
};

export function mapApplicationErrorToResponse(context: Context, error: ApplicationError) {
  const status = STATUS_BY_CODE[error.code] ?? 500;
  return context.json(
    {
      error: error.message, // human-readable string, safe for UI
      details: {
        code: error.code, // SCREAMING_SNAKE_CASE, always present
        requestId: context.get("requestId"), // required in production
        ...(error.context ?? {}), // optional: fieldErrors, resourceId, retryAfter, ...
      },
    },
    status as 400 | 401 | 403 | 404 | 409 | 422 | 500,
  );
}
```

Envelope rules honored: `error` is always a string (never holds the code), `details.code` is always present and `SCREAMING_SNAKE_CASE`, `details.requestId` is present in production, and extras live inside `details`.

---

## 8. OpenAPI Generation + Bootstrap

`/openapi.json` is generated from the registered Zod schemas and routes — never hand-authored, never committed. Scalar UI renders the same spec the clients consume.

```ts
// apps/api/src/app.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { InvoicesController } from "./infra/http/controllers/invoices.controller";

export function buildApp(deps: AppDeps): OpenAPIHono {
  const app = new OpenAPIHono();

  // Auth declared once, machine-readable, referenced per route via security: [{ bearerAuth: [] }]
  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "session-token",
  });

  // Self-registering controllers
  new InvoicesController(app, deps.listInvoices, deps.createInvoice);

  // Generated spec + interactive docs
  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: { title: "Billing API", version: process.env.APP_VERSION ?? "0.0.0" },
    servers: [{ url: "https://api.example.com" }],
  });
  app.get("/reference", apiReference({ spec: { url: "/openapi.json" }, theme: "default", layout: "modern" }));

  return app;
}

// apps/api/src/server.ts — Bun entry point
import { buildApp } from "./app";
export default { port: 3000, fetch: buildApp(buildDeps()).fetch };
```

Client generation: point `openapi-typescript` / `orval` / `Kubb` at the live `/openapi.json` so frontend/SDK clients derive from the same schemas.

Future invoice endpoints for surface completeness (out of scope here, listed so the REST surface stays consistent): `GET /v1/invoices/{id}`, `PATCH /v1/invoices/{id}` (only while `draft`), and the state transition `POST /v1/invoices/{id}/finalize` / `POST /v1/invoices/{id}/void` modeled as resource state transitions rather than RPC verbs.

---

## 9. Testing Strategy

- **Contracts (unit):** test `CreateInvoiceRequestSchema`, `ListInvoicesQuerySchema`, `InvoiceSchema`, and `InvoiceCollectionSchema` with valid/invalid payloads — e.g. empty `lineItems` array rejected, `pageSize` coercion + clamp to `[1,100]`, bad currency length, malformed `unitAmount`.
- **Controllers (integration):** boot the Hono app and exercise both routes:
  - `GET /v1/invoices` → `200` collection shape; filters honored; `401` without token; `403` cross-workspace; `400` on bad `pageSize`.
  - `POST /v1/invoices` → `201` with `Location` header + resource body; `400` invalid body; `422` unknown customer; `409` idempotency-key replay with differing payload.
  - Assert every error response matches `{ error, details: { code } }`.
- **OpenAPI (contract):** boot the server, fetch `/openapi.json`, assert both endpoints/methods exist, that `Invoice`, `InvoiceCollection`, `CreateInvoiceRequest`, `ErrorResponse` are in `components.schemas`, that each route lists its full set of response codes, and that `security: [{ bearerAuth: [] }]` is present. Diff against a committed snapshot of schema names + response codes only (not the full body).
- **E2E:** create an invoice through the public API (or a generated client), then list and confirm it appears with the expected status and amounts.

---

## 10. Checklist Compliance

1. **Single style, no mixing** — all-REST (`GET`/`POST /v1/invoices`); no `/list` or `/create` action paths.
2. **Shared contracts annotated** — schemas in `api-contracts`, every reused schema calls `.openapi("RefName")`.
3. **`createRoute` + `app.openapi`** — both routes declared and self-registered; all success + error codes and `security` listed.
4. **Parameter placement** — list filters/pagination in query; create payload in JSON body; optional `idempotency-key` header; scope from auth, not client input.
5. **Response shape** — collection and created resource returned **directly** (no `{ data, message }`); errors use `{ error, details: { code } }`.
6. **Thin controller** — parses input, injects scope, delegates to use cases, maps results.
7. **Errors via shared helper** — `mapApplicationErrorToResponse`, no inline error JSON.
8. **Machine-readable auth** — `bearerAuth` registered once and referenced per route.
9. **`/openapi.json` generated at boot** — verified by a contract test; not committed.
10. **Tests** — cover success, validation failure, auth failure, authorization failure, and domain conflict.
