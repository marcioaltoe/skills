# Webhooks API — Create + List (Hono + Zod, OpenAPI-generated, codegen-ready)

## 0. Style decision (do this first)

The skill mandates choosing **exactly one** style per project before designing anything (`SKILL.md` §"Choose the API Style First"). Decision order applied here:

1. **Project docs win** — searched the skill tree for `AGENTS.md` / ADRs / design docs that pin a style. None exist for this surface.
2. **Infer from existing routes** — there are no existing `createRoute({` declarations to grep; this is a greenfield webhooks surface.
3. **Greenfield / ambiguous** — the skill's rule: *"Default to standard REST for new public APIs unless the project has already standardized on POST-only."*

The task is explicitly a **public API surface meant to be consumed by an MCP/CLI/SDK generator** off `/openapi.json`. That is exactly the "new public API" case, and REST also produces cleaner generated SDKs (unwrapped single resources, conventional verbs the generator maps to idiomatic method names). 

**Chosen style: Standard REST** (resource paths + HTTP verbs, params in path/query/body, responses return the resource/collection directly). Following `references/style-rest.md`. No POST-only action paths anywhere on this surface.

Resulting routes:

```text
POST /v1/webhooks        # create a webhook subscription -> 201 + the resource (Location header)
GET  /v1/webhooks        # list webhook subscriptions    -> 200 + structured collection
```

Both are designed top-down from the application use cases (`CreateWebhook`, `ListWebhooks`) per `SKILL.md` §"Design Workflow (Top-Down)".

---

## 1. Application layer — use cases & DTOs (the source of the design)

Controllers are thin adapters; the design starts here (`SKILL.md` §Clean Architecture). DTOs are plain application types — they are **not** the HTTP contract, the HTTP boundary maps to them.

```ts
// src/application/webhooks/dtos.ts
export interface CreateWebhookInput {
  workspaceId: string;            // injected from credential, NEVER from client input
  url: string;
  eventTypes: WebhookEventType[];
  description?: string;
  active: boolean;
}

export interface ListWebhooksInput {
  workspaceId: string;            // injected from credential
  eventType?: WebhookEventType;
  active?: boolean;
  cursor?: string;
  pageSize: number;
}

export interface WebhookView {
  id: string;
  url: string;
  eventTypes: WebhookEventType[];
  description: string | null;
  active: boolean;
  signingSecret: string | null;  // returned ONLY on create (201); null on list reads
  createdAt: string;             // ISO-8601
  updatedAt: string;
}

export interface WebhookCollectionView {
  items: WebhookView[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type WebhookEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "payout.created"
  | "account.updated";
```

Use cases return a typed `Result` (ok/err) so the controller never throws for domain failures — the error path goes through one shared HTTP mapper (`SKILL.md` §"Error mapping goes through a single shared helper").

```ts
// src/application/shared/result.ts
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

```ts
// src/application/webhooks/errors.ts
// Typed application errors. The HTTP helper is the ONLY place these become statuses.
export type WebhookError =
  | { kind: "WEBHOOK_URL_NOT_HTTPS"; message: string }
  | { kind: "WEBHOOK_ALREADY_EXISTS"; message: string; resourceId?: string }
  | { kind: "WEBHOOK_LIMIT_REACHED"; message: string }
  | { kind: "FORBIDDEN"; message: string };
```

```ts
// src/application/webhooks/create-webhook.use-case.ts
import { type Result, ok, err } from "../shared/result";
import type { CreateWebhookInput, WebhookView } from "./dtos";
import type { WebhookError } from "./errors";

export interface WebhookRepository {
  existsByUrl(workspaceId: string, url: string): Promise<boolean>;
  countByWorkspace(workspaceId: string): Promise<number>;
  insert(record: Omit<WebhookView, "id" | "createdAt" | "updatedAt">): Promise<WebhookView>;
  list(input: {
    workspaceId: string;
    eventType?: string;
    active?: boolean;
    cursor?: string;
    limit: number;
  }): Promise<{ items: WebhookView[]; nextCursor: string | null; hasMore: boolean }>;
}

export interface SecretGenerator {
  generateSigningSecret(): string; // e.g. "whsec_..."
}

export class CreateWebhookUseCase {
  constructor(
    private readonly repo: WebhookRepository,
    private readonly secrets: SecretGenerator
  ) {}

  async execute(input: CreateWebhookInput): Promise<Result<WebhookView, WebhookError>> {
    if (!input.url.startsWith("https://")) {
      return err({ kind: "WEBHOOK_URL_NOT_HTTPS", message: "Webhook URL must use HTTPS." });
    }
    if (await this.repo.existsByUrl(input.workspaceId, input.url)) {
      return err({ kind: "WEBHOOK_ALREADY_EXISTS", message: "A webhook for this URL already exists." });
    }
    if ((await this.repo.countByWorkspace(input.workspaceId)) >= 20) {
      return err({ kind: "WEBHOOK_LIMIT_REACHED", message: "Webhook limit reached for this workspace." });
    }

    const created = await this.repo.insert({
      url: input.url,
      eventTypes: input.eventTypes,
      description: input.description ?? null,
      active: input.active,
      signingSecret: this.secrets.generateSigningSecret(), // surfaced once, on 201 only
    });
    return ok(created);
  }
}
```

```ts
// src/application/webhooks/list-webhooks.use-case.ts
import { type Result, ok } from "../shared/result";
import type { ListWebhooksInput, WebhookCollectionView } from "./dtos";
import type { WebhookError } from "./errors";
import type { WebhookRepository } from "./create-webhook.use-case";

export class ListWebhooksUseCase {
  constructor(private readonly repo: WebhookRepository) {}

  async execute(input: ListWebhooksInput): Promise<Result<WebhookCollectionView, WebhookError>> {
    const page = await this.repo.list({
      workspaceId: input.workspaceId,
      eventType: input.eventType,
      active: input.active,
      cursor: input.cursor,
      limit: input.pageSize,
    });
    // List reads MUST NOT leak the signing secret.
    return ok({
      items: page.items.map(w => ({ ...w, signingSecret: null })),
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    });
  }
}
```

---

## 2. Contracts — Zod schemas with `.openapi("RefName")` (shared `api-contracts` package)

Zod is the single source of truth (`SKILL.md` §Core Principles): each schema drives runtime validation, `z.infer` types, **and** the OpenAPI spec. Schemas live in the shared `api-contracts` package so backend, frontend, SDK, CLI, and MCP tooling can all import the same `z.infer` types, and every reused schema calls `.openapi("RefName")` so it lands in `components.schemas` as a stable `$ref` (required for good codegen — `openapi-generation.md` Rules + "Common Mistakes").

Import `z` from `@hono/zod-openapi` (the `.openapi()`-extended Zod), never bare `zod`.

### 2.1 Shared error envelope + pagination helper

```ts
// packages/api-contracts/src/errors.ts
import { z } from "@hono/zod-openapi";

// Shared by EVERY endpoint in the API. `error` is a UI-safe string; everything
// machine-readable lives under `details`. `code` is required; `requestId` is
// required in production; `.catchall` carries optional extras (fieldErrors, retryAfter...).
export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: "A webhook for this URL already exists." }),
    details: z
      .object({
        code: z.string().openapi({ example: "WEBHOOK_ALREADY_EXISTS" }),
        requestId: z.string().optional().openapi({ example: "req_01HZ..." }),
      })
      .catchall(z.unknown()),
  })
  .openapi("ErrorResponse");

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
```

```ts
// packages/api-contracts/src/pagination.ts
import { z } from "@hono/zod-openapi";

// One reusable structured-collection wrapper so every list endpoint shares the shape.
export function collectionSchema<T extends z.ZodTypeAny>(item: T, ref: string) {
  return z
    .object({
      items: z.array(item),
      nextCursor: z.string().nullable().openapi({ example: "eyJpZCI6Ii4uLiJ9" }),
      hasMore: z.boolean().openapi({ example: true }),
    })
    .openapi(ref);
}
```

### 2.2 Webhook contracts

```ts
// packages/api-contracts/src/webhooks.ts
import { z } from "@hono/zod-openapi";
import { collectionSchema } from "./pagination";

// Reused enum -> its own ref so generators emit a single named union, not 3 copies.
export const WebhookEventTypeSchema = z
  .enum(["payment.succeeded", "payment.failed", "payout.created", "account.updated"])
  .openapi("WebhookEventType", { example: "payment.succeeded" });

// The resource as returned by reads. `signingSecret` is nullable: present only on
// the 201 create response, null on list reads (the use case nulls it out).
export const WebhookSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "0198f5f3-7c2a-7b11-9e4d-2b6f0a1c3d4e" }),
    url: z.string().url().openapi({ example: "https://hooks.acme.com/conexus" }),
    eventTypes: z.array(WebhookEventTypeSchema).min(1),
    description: z.string().nullable().openapi({ example: "Prod billing listener" }),
    active: z.boolean().openapi({ example: true }),
    signingSecret: z
      .string()
      .nullable()
      .openapi({
        example: "whsec_3Jv...redacted",
        description: "HMAC signing secret. Returned only once at creation; null on reads.",
      }),
    createdAt: z.string().datetime().openapi({ example: "2026-05-23T12:00:00.000Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-05-23T12:00:00.000Z" }),
  })
  .openapi("Webhook"); // returned directly by single-resource responses (REST: unwrapped)

// Structured, paginated collection for GET /v1/webhooks.
export const WebhookCollectionSchema = collectionSchema(WebhookSchema, "WebhookCollection");

// Creation payload. NOTE: no workspaceId/organizationId here — scope is derived from
// the credential, never accepted as client input (style-rest.md §Parameters).
export const CreateWebhookRequestSchema = z
  .object({
    url: z.string().url().startsWith("https://").openapi({ example: "https://hooks.acme.com/conexus" }),
    eventTypes: z.array(WebhookEventTypeSchema).min(1),
    description: z.string().max(280).optional().openapi({ example: "Prod billing listener" }),
    active: z.boolean().default(true),
  })
  .openapi("CreateWebhookRequest");

// Read filters/paging live in query params (REST). `.openapi("RefName")` so the
// generator names the query model too.
export const ListWebhooksQuerySchema = z
  .object({
    eventType: WebhookEventTypeSchema.optional(),
    active: z
      .enum(["true", "false"])
      .transform(v => v === "true")
      .optional()
      .openapi({ type: "boolean", example: true }), // querystrings are strings -> coerce, annotate as boolean
    cursor: z.string().optional(),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
  })
  .openapi("ListWebhooksQuery");

// Path params model for any /{id} routes that follow (get/patch/delete).
export const WebhookParamsSchema = z
  .object({ id: z.string().uuid() })
  .openapi("WebhookParams");

// Types consumed by backend use cases, frontend, SDK, CLI, and MCP via the SAME package.
export type Webhook = z.infer<typeof WebhookSchema>;
export type WebhookCollection = z.infer<typeof WebhookCollectionSchema>;
export type CreateWebhookRequest = z.infer<typeof CreateWebhookRequestSchema>;
export type ListWebhooksQuery = z.infer<typeof ListWebhooksQuerySchema>;
```

```ts
// packages/api-contracts/src/index.ts
export * from "./errors";
export * from "./pagination";
export * from "./webhooks";
```

---

## 3. Route declarations — `createRoute` with every status code + `security`

Every endpoint is declared with `createRoute` and later mounted with `app.openapi(route, handler)`. Never `app.post(...)`/`app.get(...)` directly, or the endpoint vanishes from `/openapi.json` (`SKILL.md` §Core Principles; `openapi-generation.md` Common Mistakes). The `createRoute` call lists **every** status code the endpoint can emit so SDKs can model errors, and declares `security` (machine-readable auth) instead of free-form description text.

```ts
// src/infra/http/routes/webhooks.routes.ts
import { createRoute } from "@hono/zod-openapi";
import {
  CreateWebhookRequestSchema,
  ErrorResponseSchema,
  ListWebhooksQuerySchema,
  WebhookCollectionSchema,
  WebhookSchema,
} from "@conexus/api-contracts";

// POST /v1/webhooks — create. Returns the resource directly (REST: unwrapped), 201 + Location.
export const createWebhookRoute = createRoute({
  method: "post",
  path: "/v1/webhooks",
  tags: ["webhooks"],
  summary: "Create a webhook subscription",
  description:
    "Registers an HTTPS endpoint to receive events. The signingSecret is returned only in this response.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: CreateWebhookRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Webhook created",
      headers: {
        Location: {
          description: "URL of the created webhook",
          schema: { type: "string", example: "/v1/webhooks/0198f5f3-7c2a-7b11-9e4d-2b6f0a1c3d4e" },
        },
      },
      content: { "application/json": { schema: WebhookSchema } },
    },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: ErrorResponseSchema } } },
    409: { description: "URL already registered", content: { "application/json": { schema: ErrorResponseSchema } } },
    422: { description: "Domain validation failure (e.g. non-HTTPS URL)", content: { "application/json": { schema: ErrorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: ErrorResponseSchema } } },
    500: { description: "Internal error", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

// GET /v1/webhooks — list. Returns a structured, cursor-paginated collection directly.
export const listWebhooksRoute = createRoute({
  method: "get",
  path: "/v1/webhooks",
  tags: ["webhooks"],
  summary: "List webhook subscriptions",
  security: [{ bearerAuth: [] }],
  request: { query: ListWebhooksQuerySchema },
  responses: {
    200: { description: "Webhook collection", content: { "application/json": { schema: WebhookCollectionSchema } } },
    400: { description: "Invalid query parameters", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorResponseSchema } } },
    403: { description: "Forbidden", content: { "application/json": { schema: ErrorResponseSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: ErrorResponseSchema } } },
    500: { description: "Internal error", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});
```

Why each status is listed (status-code table, `SKILL.md` §Status Codes):

- `201` create / `200` list — success bodies.
- `400` — HTTP-boundary validation failure (caught by `createRoute`'s schema validation before the handler runs).
- `401` / `403` — missing/invalid auth vs authenticated-but-not-allowed.
- `409` — duplicate URL (state conflict) on create.
- `422` — domain validation distinct from HTTP validation (non-HTTPS URL, limit reached) on create.
- `429` — rate limit.
- `500` — unhandled.

A status only appears if the endpoint can actually emit it: list has no `409`/`422` because it neither creates nor enforces those invariants ("Query/body fields accepted but missing from request" / the inverse — declaring impossible codes — both make OpenAPI lie to clients).

---

## 4. Shared HTTP error helper (the only place errors become responses)

Typed application errors map to HTTP in exactly one helper. Controllers never inline `context.json({ error, details }, status)` (`SKILL.md` §Core Principles + §Error Envelope). The envelope is always `{ error: string, details: { code, requestId, ... } }` — `error` is a string, `code` is required SCREAMING_SNAKE_CASE, `requestId` is attached for traceability.

```ts
// src/infra/http/error-handling.ts
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { WebhookError } from "@/application/webhooks/errors";

type AppError = WebhookError; // union of all bounded-context error types

const STATUS_BY_CODE: Record<AppError["kind"], ContentfulStatusCode> = {
  WEBHOOK_URL_NOT_HTTPS: 422,
  WEBHOOK_ALREADY_EXISTS: 409,
  WEBHOOK_LIMIT_REACHED: 422,
  FORBIDDEN: 403,
};

export function mapApplicationErrorToResponse(context: Context, error: AppError) {
  const status = STATUS_BY_CODE[error.kind] ?? 500;
  const requestId = context.get("requestId") as string | undefined;

  return context.json(
    {
      error: error.message,
      details: {
        code: error.kind, // stable, machine-readable
        ...(requestId ? { requestId } : {}),
        ...("resourceId" in error && error.resourceId ? { resourceId: error.resourceId } : {}),
      },
    },
    status
  );
}
```

If a new error type appears, extend `STATUS_BY_CODE` here — never branch inline in a controller (`SKILL.md` §Core Principles).

---

## 5. Controllers — thin, self-registering adapters

Controllers mount their routes via `app.openapi(route, handler)`. `createRoute` already validates `body`/`query`/`param`, so there is no separate `zValidator` call (`SKILL.md` §Controller Pattern; `openapi-generation.md` Step 2). The success shape is the resource/collection **directly** (REST), the error path delegates to the shared helper.

```ts
// src/infra/http/controllers/webhooks.controller.ts
import type { OpenAPIHono } from "@hono/zod-openapi";
import { createWebhookRoute, listWebhooksRoute } from "../routes/webhooks.routes";
import { mapApplicationErrorToResponse } from "../error-handling";
import type { CreateWebhookUseCase } from "@/application/webhooks/create-webhook.use-case";
import type { ListWebhooksUseCase } from "@/application/webhooks/list-webhooks.use-case";

export class WebhooksController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly createUseCase: CreateWebhookUseCase,
    private readonly listUseCase: ListWebhooksUseCase
  ) {
    // POST /v1/webhooks
    this.app.openapi(createWebhookRoute, async context => {
      const body = context.req.valid("json");
      const credential = context.get("credential"); // set by auth middleware

      const result = await this.createUseCase.execute({
        workspaceId: credential.workspaceId, // scope from auth, not from input
        url: body.url,
        eventTypes: body.eventTypes,
        description: body.description,
        active: body.active,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);

      context.header("Location", `/v1/webhooks/${result.value.id}`);
      return context.json(result.value, 201); // resource returned directly
    });

    // GET /v1/webhooks
    this.app.openapi(listWebhooksRoute, async context => {
      const query = context.req.valid("query");
      const credential = context.get("credential");

      const result = await this.listUseCase.execute({
        workspaceId: credential.workspaceId,
        eventType: query.eventType,
        active: query.active,
        cursor: query.cursor,
        pageSize: query.pageSize,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json(result.value, 200); // structured collection returned directly
    });
  }
}
```

---

## 6. App bootstrap — `/openapi.json` + Scalar UI (one place)

The spec is a **generated build artifact** of the registered schemas/routes — never authored, never committed (`SKILL.md` §Core Principles; `openapi-generation.md` Step 3). The `bearerAuth` security scheme is registered once with `registerComponent`, then referenced per route via `security`. Scalar renders the same `/openapi.json` the generators consume — no separate doc artifact.

```ts
// src/infra/http/app.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { requestId } from "hono/request-id";
import { WebhooksController } from "./controllers/webhooks.controller";
import { authMiddleware } from "./middleware/auth";
import { CreateWebhookUseCase } from "@/application/webhooks/create-webhook.use-case";
import { ListWebhooksUseCase } from "@/application/webhooks/list-webhooks.use-case";
import { DrizzleWebhookRepository } from "@/infra/db/webhook.repository";
import { CryptoSecretGenerator } from "@/infra/crypto/secret-generator";

export function buildApp(): OpenAPIHono {
  // defaultHook surfaces createRoute validation failures as the SHARED error envelope (400).
  const app = new OpenAPIHono({
    defaultHook: (result, context) => {
      if (!result.success) {
        const requestId = context.get("requestId") as string | undefined;
        return context.json(
          {
            error: "Request validation failed.",
            details: {
              code: "VALIDATION_ERROR",
              ...(requestId ? { requestId } : {}),
              fieldErrors: result.error.flatten().fieldErrors,
            },
          },
          400
        );
      }
    },
  });

  app.use("*", requestId());

  // 1) Register the security scheme ONCE (machine-readable auth for codegen).
  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "session-token",
  });

  // 2) Auth middleware enforces in code what `security` declares in the spec.
  app.use("/v1/*", authMiddleware);

  // 3) Wire dependencies and self-register routes (Clean Architecture).
  const repo = new DrizzleWebhookRepository();
  new WebhooksController(
    app,
    new CreateWebhookUseCase(repo, new CryptoSecretGenerator()),
    new ListWebhooksUseCase(repo)
  );

  // 4) Generate & serve the spec from the registered schemas/routes.
  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: { title: "Conexus API", version: process.env.APP_VERSION ?? "0.0.0" },
    servers: [{ url: "https://api.conexus.com" }],
  });

  // 5) Interactive docs render from the SAME spec the clients consume.
  app.get("/reference", apiReference({ spec: { url: "/openapi.json" }, theme: "default", layout: "modern" }));

  return app;
}
```

```ts
// src/server.ts (Bun)
import { buildApp } from "./infra/http/app";
const app = buildApp();
export default { port: 3000, fetch: app.fetch };
```

This satisfies `openapi-generation.md`: the `$ref`s for `Webhook`, `WebhookCollection`, `WebhookEventType`, `CreateWebhookRequest`, `ListWebhooksQuery`, and `ErrorResponse` all appear in `components.schemas`; both routes appear under `paths` with all status codes and `security: [{ bearerAuth: [] }]`.

---

## 7. The generated spec (what codegen actually reads)

A trimmed view of `/openapi.json` produced at boot — no hand-authoring:

```jsonc
{
  "openapi": "3.1.0",
  "info": { "title": "Conexus API", "version": "1.4.2" },
  "components": {
    "securitySchemes": {
      "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "session-token" }
    },
    "schemas": {
      "WebhookEventType": { "type": "string", "enum": ["payment.succeeded", "payment.failed", "payout.created", "account.updated"] },
      "Webhook": { "type": "object", "properties": { "id": { "type": "string", "format": "uuid" }, "signingSecret": { "type": ["string", "null"] }, "...": {} }, "required": ["id", "url", "eventTypes", "active", "createdAt", "updatedAt"] },
      "WebhookCollection": { "type": "object", "properties": { "items": { "type": "array", "items": { "$ref": "#/components/schemas/Webhook" } }, "nextCursor": { "type": ["string", "null"] }, "hasMore": { "type": "boolean" } } },
      "CreateWebhookRequest": { "type": "object", "properties": { "...": {} }, "required": ["url", "eventTypes"] },
      "ListWebhooksQuery": { "type": "object" },
      "ErrorResponse": { "type": "object", "properties": { "error": { "type": "string" }, "details": { "type": "object", "properties": { "code": { "type": "string" } }, "required": ["code"] } } }
    }
  },
  "paths": {
    "/v1/webhooks": {
      "post": {
        "tags": ["webhooks"],
        "operationId": "createWebhook",
        "security": [{ "bearerAuth": [] }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreateWebhookRequest" } } } },
        "responses": {
          "201": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Webhook" } } } },
          "400": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } } } },
          "401": { "...": {} }, "403": {}, "409": {}, "422": {}, "429": {}, "500": {}
        }
      },
      "get": {
        "tags": ["webhooks"],
        "operationId": "listWebhooks",
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "eventType", "in": "query", "schema": { "$ref": "#/components/schemas/WebhookEventType" } },
          { "name": "active", "in": "query", "schema": { "type": "boolean" } },
          { "name": "cursor", "in": "query", "schema": { "type": "string" } },
          { "name": "pageSize", "in": "query", "schema": { "type": "integer", "minimum": 1, "maximum": 100, "default": 50 } }
        ],
        "responses": {
          "200": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/WebhookCollection" } } } },
          "400": {}, "401": {}, "403": {}, "429": {}, "500": {}
        }
      }
    }
  }
}
```

The three properties that make this spec **complete** for a generator: (1) named component schemas via `.openapi("RefName")` → reusable `$ref`s; (2) every status code listed → the generator can model the full success+error union; (3) `security` per route + a registered scheme → the generator emits auth-header plumbing.

---

## 8. How CLI / MCP / SDK generators consume the spec

This is the payoff of "Zod is the single source of truth." The backend contracts and every generated client derive from the **same** route/schema definitions, so they cannot drift (`openapi-generation.md` §"Client Generation").

**Point the generator at the live spec.** During codegen the server boots and the tool reads `http://localhost:3000/openapi.json` (or a CI-dumped copy). The spec is regenerated each boot — never a stale committed file.

1. **TypeScript SDK / frontend client** — `openapi-typescript`, `orval`, or `Kubb`:
   ```bash
   bun run dev &                       # serves the freshly generated /openapi.json
   npx openapi-typescript http://localhost:3000/openapi.json -o sdk/schema.d.ts
   # orval/Kubb additionally emit a typed client:
   #   await client.POST("/v1/webhooks", { body: { url, eventTypes, active: true } })
   #   const { data } = await client.GET("/v1/webhooks", { params: { query: { active: true } } })
   ```
   Because `Webhook`, `WebhookCollection`, and `CreateWebhookRequest` are named `$ref`s, the SDK gets stable exported types (`components["schemas"]["Webhook"]`) instead of inlined anonymous shapes. The `401/403/409/422` responses let the client type the error union, and `bearerAuth` makes the generated client require/inject the `Authorization: Bearer` header.

2. **CLI generator** — feeds the same spec to produce commands. Conventional REST verbs + plural resource map cleanly to commands:
   ```text
   acme webhooks create --url https://hooks.acme.com/conexus --event-type payment.succeeded
   acme webhooks list   --active true --page-size 50
   ```
   `operationId` (`createWebhook`, `listWebhooks`) names the subcommand; request body / query schemas become flags; `required` arrays drive required flags; `bearerAuth` becomes a global `--token` / `ACME_TOKEN` env var. (POST-only `/list`,`/create` action paths would have collapsed into noisy, non-idiomatic commands — another reason REST was chosen.)

3. **MCP server generator** — turns each operation into an MCP **tool**:
   - Each `operationId` → one MCP tool (`create_webhook`, `list_webhooks`).
   - The request schema (`CreateWebhookRequest` / `ListWebhooksQuery`) → the tool's JSON-Schema `inputSchema`, which the model fills.
   - The `200`/`201` response schema → the tool's structured output shape.
   - `bearerAuth` → the credential the MCP server attaches per call.
   The model sees `description`/`example` annotations from the Zod `.openapi()` metadata, which is why annotating examples on the contracts directly improves MCP/agent usability.

**The generation pipeline (end to end):**

```text
Zod (api-contracts)  →  .openapi("RefName")  →  createRoute({ ...all status codes, security })
                     →  app.openapi(route, handler)  →  /openapi.json (regenerated at boot)
                     →  Scalar UI  +  openapi-typescript / orval / Kubb (SDK)
                                    +  CLI generator (commands)
                                    +  MCP server generator (tools)
```

To keep the generated spec honest, a contract test boots the app, fetches `/openapi.json`, and diffs **schema names + response codes only** (not the full body, so examples aren't locked) against a committed snapshot — catching accidental endpoint/code removals that would silently break downstream generators (`openapi-generation.md` §Rules).

---

## 9. Tests (per `SKILL.md` §Testing Strategy)

- **Contracts** — unit test `CreateWebhookRequestSchema` (rejects non-HTTPS URL, empty `eventTypes`) and `ListWebhooksQuerySchema` (coerces `pageSize`, bounds 1–100, parses `active`).
- **Controllers** — integration test both routes: `201` + `Location` on create, `409` on duplicate URL, `422` on non-HTTPS, `400` on bad body/query, `401` without token, `403` cross-workspace, and that list never returns a non-null `signingSecret`.
- **OpenAPI** — boot the app, fetch `/openapi.json`, assert `paths./v1/webhooks` has `post` + `get`, all declared status codes are present, `components.schemas` contains the six refs, and each route carries `security: [{ bearerAuth: [] }]`.
- **E2E** — generate the TS client from the live spec and run create → list through it to prove the spec is genuinely codegen-consumable.

---

## 10. Checklist (`SKILL.md` §API Design Checklist) — self-verification

1. **One style, no mixing** — pure REST; no `/list`,`/create` action paths. ✅
2. **Contracts in shared package, `.openapi("RefName")`** — all six schemas annotated in `api-contracts`. ✅
3. **`createRoute` + `app.openapi`, all codes + `security`** — every status declared, `bearerAuth` per route. ✅
4. **Param placement matches style** — create body, list query, scope from credential (never input). ✅
5. **Response shape matches style** — resource (201) / structured collection (200) returned directly; errors `{ error, details: { code } }`. ✅
6. **Thin, self-registering controller delegating to use cases.** ✅
7. **Typed errors through the single shared HTTP helper.** ✅
8. **Auth machine-readable in OpenAPI and enforced in code** (`security` + `authMiddleware`). ✅
9. **`/openapi.json` regenerates at boot**, verified by fetching it in tests; never committed. ✅
10. **Tests cover success, validation, auth, authorization, conflict.** ✅
```