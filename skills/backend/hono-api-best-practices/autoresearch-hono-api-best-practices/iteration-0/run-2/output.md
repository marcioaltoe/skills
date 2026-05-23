# Catalog · Products API Design (POST-only, Hono + Zod)

## 1. API Style Confirmation

**Style: POST-only action-based.** This is locked per the request ("Usamos POST-only action paths") and matches `references/style-post-only.md`. Per the skill, the two conventions are mutually exclusive — every endpoint below is `POST`, takes a JSON body only (no query string, no URL params), and returns the `{ data, message }` success envelope or the shared `{ error, details }` error envelope. No REST verbs, no `/{id}` paths, no `?filter=` query strings appear anywhere.

- **Context**: `catalog`
- **Entity**: `products` (plural in paths)
- **Actions**: `create | get | list | update | delete`

### Endpoint map

| Action | Path | Body | Success status |
| --- | --- | --- | --- |
| Create | `POST /catalog/products/create` | `{ ...payload }` | `201` |
| Get | `POST /catalog/products/get` | `{ id }` | `200` |
| List | `POST /catalog/products/list` | `{ page, pageSize, filters }` | `200` |
| Update | `POST /catalog/products/update` | `{ id, ...patch }` | `200` |
| Delete | `POST /catalog/products/delete` | `{ id }` | `200` |

`organizationId` / `workspaceId` are **never** accepted in the body — they are derived from the authenticated session and injected by the controller before calling the use case.

Note on delete: the skill's status table lists `204 No Content` for deletes, but the POST-only style mandates that *every* success response uses the exact `{ data, message }` envelope (a body). A `204` carries no body and would violate the envelope rule. We therefore return `200` with `{ data: { id }, message: "Success" }`. This keeps the surface uniform and machine-parseable, which the POST-only reference prioritizes ("Every success response uses the exact `{ data, message }` envelope — no variants").

---

## 2. Zod Contract Schemas (`api-contracts`)

Contracts live in the shared `api-contracts` package so backend, frontend, SDKs, and tests derive types from one source. Zod is the single source of truth; every reused schema calls `.openapi("RefName")` so it lands in `components.schemas`. Types are derived with `z.infer`, never hand-written.

```ts
// packages/api-contracts/src/catalog/products.ts
import { z } from "@hono/zod-openapi";

/* ---------------------------------------------------------------------------
 * Domain resource
 * ------------------------------------------------------------------------ */

export const ProductStatusSchema = z
  .enum(["draft", "active", "archived"])
  .openapi("ProductStatus");

export const ProductSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "0198f5f3-2c1a-7b44-9f3e-2a1b6c5d4e3f" }),
    sku: z.string().min(1).openapi({ example: "SKU-1042" }),
    name: z.string().min(1).openapi({ example: "Cafeteira Italiana 6 xícaras" }),
    description: z.string().max(2000).nullable().openapi({ example: "Aço inox, indução." }),
    status: ProductStatusSchema,
    priceCents: z.number().int().nonnegative().openapi({ example: 12990 }),
    currency: z.string().length(3).openapi({ example: "BRL" }),
    categoryId: z.string().uuid().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Product");

export type Product = z.infer<typeof ProductSchema>;

/* ---------------------------------------------------------------------------
 * Shared paginated collection (inside the data envelope)
 * ------------------------------------------------------------------------ */

export const ProductListItemsSchema = z
  .object({
    items: z.array(ProductSchema),
    total: z.number().int().nonnegative().openapi({ example: 1 }),
    page: z.number().int().positive().openapi({ example: 1 }),
    pageSize: z.number().int().positive().openapi({ example: 20 }),
  })
  .openapi("ProductListItems");

/* ---------------------------------------------------------------------------
 * create
 * ------------------------------------------------------------------------ */

export const CreateProductRequestSchema = z
  .object({
    sku: z.string().min(1),
    name: z.string().min(1),
    description: z.string().max(2000).nullable().default(null),
    status: ProductStatusSchema.default("draft"),
    priceCents: z.number().int().nonnegative(),
    currency: z.string().length(3).default("BRL"),
    categoryId: z.string().uuid().nullable().default(null),
  })
  .openapi("CreateProductRequest");

export const CreateProductResponseSchema = z
  .object({ data: ProductSchema, message: z.string() })
  .openapi("CreateProductResponse");

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

/* ---------------------------------------------------------------------------
 * get
 * ------------------------------------------------------------------------ */

export const GetProductRequestSchema = z
  .object({ id: z.string().uuid() })
  .openapi("GetProductRequest");

export const GetProductResponseSchema = z
  .object({ data: ProductSchema, message: z.string() })
  .openapi("GetProductResponse");

export type GetProductRequest = z.infer<typeof GetProductRequestSchema>;

/* ---------------------------------------------------------------------------
 * list
 * ------------------------------------------------------------------------ */

export const ListProductsFiltersSchema = z
  .object({
    status: ProductStatusSchema.optional(),
    categoryId: z.string().uuid().optional(),
    search: z.string().min(1).optional(),
    createdFrom: z.string().datetime().optional(),
    createdTo: z.string().datetime().optional(),
  })
  .openapi("ListProductsFilters");

export const ListProductsRequestSchema = z
  .object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(20),
    filters: ListProductsFiltersSchema.default({}),
  })
  .openapi("ListProductsRequest");

export const ListProductsResponseSchema = z
  .object({ data: ProductListItemsSchema, message: z.string() })
  .openapi("ListProductsResponse");

export type ListProductsRequest = z.infer<typeof ListProductsRequestSchema>;

/* ---------------------------------------------------------------------------
 * update  ({ id, ...patch } — all patch fields optional)
 * ------------------------------------------------------------------------ */

export const UpdateProductRequestSchema = z
  .object({
    id: z.string().uuid(),
    sku: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().max(2000).nullable().optional(),
    status: ProductStatusSchema.optional(),
    priceCents: z.number().int().nonnegative().optional(),
    currency: z.string().length(3).optional(),
    categoryId: z.string().uuid().nullable().optional(),
  })
  .openapi("UpdateProductRequest");

export const UpdateProductResponseSchema = z
  .object({ data: ProductSchema, message: z.string() })
  .openapi("UpdateProductResponse");

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;

/* ---------------------------------------------------------------------------
 * delete  (returns the deleted id inside the envelope — no 204)
 * ------------------------------------------------------------------------ */

export const DeleteProductRequestSchema = z
  .object({ id: z.string().uuid() })
  .openapi("DeleteProductRequest");

export const DeleteProductResponseSchema = z
  .object({
    data: z.object({ id: z.string().uuid() }),
    message: z.string(),
  })
  .openapi("DeleteProductResponse");

export type DeleteProductRequest = z.infer<typeof DeleteProductRequestSchema>;
```

The shared error schema (already defined once in `api-contracts`, reused by every endpoint and both styles):

```ts
// packages/api-contracts/src/shared/error.ts
import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z
      .object({
        code: z.string(),
        requestId: z.string().optional(), // required in production
      })
      .catchall(z.unknown()), // fieldErrors, resourceId, retryAfter, ...
  })
  .openapi("ErrorResponse");
```

---

## 3. `createRoute` Declarations

Every action is declared with `createRoute` so it appears in `/openapi.json`. Each route lists **every** status code it can emit, declares `security`, and uses the shared `ErrorResponseSchema` for error bodies. `tags` group the actions in Scalar UI. Method is `post` everywhere; path carries the action; the body holds all input.

```ts
// src/contexts/catalog/infra/http/routes/products.routes.ts
import { createRoute } from "@hono/zod-openapi";
import {
  CreateProductRequestSchema,
  CreateProductResponseSchema,
  GetProductRequestSchema,
  GetProductResponseSchema,
  ListProductsRequestSchema,
  ListProductsResponseSchema,
  UpdateProductRequestSchema,
  UpdateProductResponseSchema,
  DeleteProductRequestSchema,
  DeleteProductResponseSchema,
  ErrorResponseSchema,
} from "api-contracts";

const TAGS = ["catalog.products"];
const SECURITY = [{ bearerAuth: [] }];

const json = <S>(schema: S) => ({ content: { "application/json": { schema } } });

/* ----------------------------- create ----------------------------------- */
export const createProductRoute = createRoute({
  method: "post",
  path: "/catalog/products/create",
  tags: TAGS,
  summary: "Create a product",
  security: SECURITY,
  request: {
    body: { required: true, ...json(CreateProductRequestSchema) },
  },
  responses: {
    201: { description: "Product created", ...json(CreateProductResponseSchema) },
    400: { description: "Validation error", ...json(ErrorResponseSchema) },
    401: { description: "Unauthenticated", ...json(ErrorResponseSchema) },
    403: { description: "Forbidden", ...json(ErrorResponseSchema) },
    409: { description: "SKU already exists", ...json(ErrorResponseSchema) },
    422: { description: "Domain validation failed", ...json(ErrorResponseSchema) },
    500: { description: "Internal error", ...json(ErrorResponseSchema) },
  },
});

/* ------------------------------- get ------------------------------------- */
export const getProductRoute = createRoute({
  method: "post",
  path: "/catalog/products/get",
  tags: TAGS,
  summary: "Get a product by id",
  security: SECURITY,
  request: {
    body: { required: true, ...json(GetProductRequestSchema) },
  },
  responses: {
    200: { description: "Product found", ...json(GetProductResponseSchema) },
    400: { description: "Validation error", ...json(ErrorResponseSchema) },
    401: { description: "Unauthenticated", ...json(ErrorResponseSchema) },
    403: { description: "Forbidden", ...json(ErrorResponseSchema) },
    404: { description: "Product not found", ...json(ErrorResponseSchema) },
    500: { description: "Internal error", ...json(ErrorResponseSchema) },
  },
});

/* ------------------------------- list ------------------------------------ */
export const listProductsRoute = createRoute({
  method: "post",
  path: "/catalog/products/list",
  tags: TAGS,
  summary: "List products (paginated, filtered)",
  security: SECURITY,
  request: {
    body: { required: true, ...json(ListProductsRequestSchema) },
  },
  responses: {
    200: { description: "Paginated products", ...json(ListProductsResponseSchema) },
    400: { description: "Validation error", ...json(ErrorResponseSchema) },
    401: { description: "Unauthenticated", ...json(ErrorResponseSchema) },
    403: { description: "Forbidden", ...json(ErrorResponseSchema) },
    500: { description: "Internal error", ...json(ErrorResponseSchema) },
  },
});

/* ------------------------------ update ----------------------------------- */
export const updateProductRoute = createRoute({
  method: "post",
  path: "/catalog/products/update",
  tags: TAGS,
  summary: "Update a product",
  security: SECURITY,
  request: {
    body: { required: true, ...json(UpdateProductRequestSchema) },
  },
  responses: {
    200: { description: "Product updated", ...json(UpdateProductResponseSchema) },
    400: { description: "Validation error", ...json(ErrorResponseSchema) },
    401: { description: "Unauthenticated", ...json(ErrorResponseSchema) },
    403: { description: "Forbidden", ...json(ErrorResponseSchema) },
    404: { description: "Product not found", ...json(ErrorResponseSchema) },
    409: { description: "SKU conflict", ...json(ErrorResponseSchema) },
    422: { description: "Domain validation failed", ...json(ErrorResponseSchema) },
    500: { description: "Internal error", ...json(ErrorResponseSchema) },
  },
});

/* ------------------------------ delete ----------------------------------- */
export const deleteProductRoute = createRoute({
  method: "post",
  path: "/catalog/products/delete",
  tags: TAGS,
  summary: "Delete a product",
  security: SECURITY,
  request: {
    body: { required: true, ...json(DeleteProductRequestSchema) },
  },
  responses: {
    200: { description: "Product deleted", ...json(DeleteProductResponseSchema) },
    400: { description: "Validation error", ...json(ErrorResponseSchema) },
    401: { description: "Unauthenticated", ...json(ErrorResponseSchema) },
    403: { description: "Forbidden", ...json(ErrorResponseSchema) },
    404: { description: "Product not found", ...json(ErrorResponseSchema) },
    409: { description: "Product in use, cannot delete", ...json(ErrorResponseSchema) },
    500: { description: "Internal error", ...json(ErrorResponseSchema) },
  },
});
```

---

## 4. Controller Wiring (thin, self-registering)

The controller is a thin adapter over application use cases. It self-registers each route with `app.openapi(route, handler)`, reads validated input with `context.req.valid("json")` (no separate `zValidator`), injects session-derived scope, calls the use case, and maps the result. On success it returns the `{ data, message }` envelope; on failure it routes the typed error through the single shared `mapApplicationErrorToResponse` helper — never inline error JSON.

```ts
// src/contexts/catalog/infra/http/controllers/products.controller.ts
import type { OpenAPIHono } from "@hono/zod-openapi";
import { mapApplicationErrorToResponse } from "@/infra/http/error-handling";
import {
  createProductRoute,
  getProductRoute,
  listProductsRoute,
  updateProductRoute,
  deleteProductRoute,
} from "../routes/products.routes";
import type {
  CreateProductUseCase,
  GetProductUseCase,
  ListProductsUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from "@/contexts/catalog/application/use-cases";

export class ProductsController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly createProduct: CreateProductUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {
    this.registerCreate();
    this.registerGet();
    this.registerList();
    this.registerUpdate();
    this.registerDelete();
  }

  private registerCreate(): void {
    this.app.openapi(createProductRoute, async (context) => {
      const body = context.req.valid("json");
      const session = context.get("session"); // scope from auth, not from body

      const result = await this.createProduct.execute({
        ...body,
        organizationId: session.organizationId,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json({ data: result.value, message: "Success" }, 201);
    });
  }

  private registerGet(): void {
    this.app.openapi(getProductRoute, async (context) => {
      const { id } = context.req.valid("json");
      const session = context.get("session");

      const result = await this.getProduct.execute({
        id,
        organizationId: session.organizationId,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json({ data: result.value, message: "Success" }, 200);
    });
  }

  private registerList(): void {
    this.app.openapi(listProductsRoute, async (context) => {
      const { page, pageSize, filters } = context.req.valid("json");
      const session = context.get("session");

      const result = await this.listProducts.execute({
        page,
        pageSize,
        filters,
        organizationId: session.organizationId,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);

      // result.value is the paginated DTO: { items, total, page, pageSize }
      return context.json({ data: result.value, message: "Success" }, 200);
    });
  }

  private registerUpdate(): void {
    this.app.openapi(updateProductRoute, async (context) => {
      const { id, ...patch } = context.req.valid("json");
      const session = context.get("session");

      const result = await this.updateProduct.execute({
        id,
        patch,
        organizationId: session.organizationId,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json({ data: result.value, message: "Success" }, 200);
    });
  }

  private registerDelete(): void {
    this.app.openapi(deleteProductRoute, async (context) => {
      const { id } = context.req.valid("json");
      const session = context.get("session");

      const result = await this.deleteProduct.execute({
        id,
        organizationId: session.organizationId,
      });

      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json({ data: { id }, message: "Success" }, 200);
    });
  }
}
```

The shared error helper (defined once in infra; controllers never branch on error type inline). If a new typed error is introduced, extend this helper rather than inlining a response in a controller:

```ts
// src/infra/http/error-handling.ts
import type { Context } from "hono";
import {
  ProductNotFoundError,
  ProductSkuConflictError,
  ProductInUseError,
  ForbiddenError,
  DomainValidationError,
} from "@/contexts/catalog/domain/errors";

export function mapApplicationErrorToResponse(context: Context, error: unknown) {
  const requestId = context.get("requestId");

  if (error instanceof ProductNotFoundError) {
    return context.json(
      { error: "Product not found", details: { code: "PRODUCT_NOT_FOUND", requestId } },
      404,
    );
  }
  if (error instanceof ProductSkuConflictError) {
    return context.json(
      { error: "A product with this SKU already exists", details: { code: "PRODUCT_SKU_CONFLICT", requestId } },
      409,
    );
  }
  if (error instanceof ProductInUseError) {
    return context.json(
      { error: "Product is referenced and cannot be deleted", details: { code: "PRODUCT_IN_USE", requestId } },
      409,
    );
  }
  if (error instanceof ForbiddenError) {
    return context.json(
      { error: "You are not allowed to perform this action", details: { code: "FORBIDDEN", requestId } },
      403,
    );
  }
  if (error instanceof DomainValidationError) {
    return context.json(
      {
        error: "Domain validation failed",
        details: { code: "DOMAIN_VALIDATION_FAILED", requestId, fieldErrors: error.fieldErrors },
      },
      422,
    );
  }

  return context.json(
    { error: "Internal server error", details: { code: "INTERNAL_ERROR", requestId } },
    500,
  );
}
```

---

## 5. Response Envelope & Status Codes

### Success envelope (POST-only — exact, no variants)

Single resource (`create`, `get`, `update`):

```json
{
  "data": {
    "id": "0198f5f3-2c1a-7b44-9f3e-2a1b6c5d4e3f",
    "sku": "SKU-1042",
    "name": "Cafeteira Italiana 6 xícaras",
    "description": "Aço inox, indução.",
    "status": "active",
    "priceCents": 12990,
    "currency": "BRL",
    "categoryId": null,
    "createdAt": "2026-05-23T12:00:00.000Z",
    "updatedAt": "2026-05-23T12:00:00.000Z"
  },
  "message": "Success"
}
```

Collection (`list`) — the paginated shape lives **inside** `data`, never at top level:

```json
{
  "data": {
    "items": [{ "id": "0198f5f3-...", "sku": "SKU-1042", "name": "Cafeteira Italiana 6 xícaras", "status": "active", "priceCents": 12990, "currency": "BRL" }],
    "total": 1,
    "page": 1,
    "pageSize": 20
  },
  "message": "Success"
}
```

Delete:

```json
{ "data": { "id": "0198f5f3-2c1a-7b44-9f3e-2a1b6c5d4e3f" }, "message": "Success" }
```

### Error envelope (shared by both styles)

```json
{
  "error": "A product with this SKU already exists",
  "details": { "code": "PRODUCT_SKU_CONFLICT", "requestId": "req_01HZ..." }
}
```

`error` is always a human-readable string (never an object, never holds the code). `details.code` is always present in `SCREAMING_SNAKE_CASE`. `details.requestId` is required in production. Extra context (`fieldErrors`, `resourceId`, `retryAfter`) goes inside `details`.

### Status codes per action

| Action | Success | Errors used |
| --- | --- | --- |
| create | `201` | `400` validation · `401` unauth · `403` forbidden · `409` SKU conflict · `422` domain · `500` |
| get | `200` | `400` · `401` · `403` · `404` not found · `500` |
| list | `200` | `400` · `401` · `403` · `500` |
| update | `200` | `400` · `401` · `403` · `404` · `409` SKU conflict · `422` domain · `500` |
| delete | `200` | `400` · `401` · `403` · `404` · `409` in-use · `500` |

`400` = HTTP-boundary validation (Zod). `422` = domain validation distinct from HTTP validation. `409` = duplicates / state conflicts / invariant violations. Delete intentionally uses `200` + envelope rather than the table's `204`, because POST-only mandates a body in every success response.

---

## 6. OpenAPI Generation & Bootstrap

`/openapi.json` is generated from the registered Zod schemas and routes — never authored, never committed. The `bearerAuth` scheme is registered once at bootstrap; each route references it via `security`.

```ts
// src/app.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { ProductsController } from "@/contexts/catalog/infra/http/controllers/products.controller";
import { sessionAuth } from "@/infra/http/middleware/session-auth";
import { container } from "@/infra/di/container";

const app = new OpenAPIHono();

// Auth declared once, machine-readable — never in free-form description text.
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "session-token",
});

// Enforce auth in code for the catalog surface (matches the OpenAPI `security`).
app.use("/catalog/*", sessionAuth());

// Self-registering controller mounts all five product routes.
new ProductsController(
  app,
  container.createProductUseCase,
  container.getProductUseCase,
  container.listProductsUseCase,
  container.updateProductUseCase,
  container.deleteProductUseCase,
);

// Generated spec + Scalar UI — the only place that references them.
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "Catalog API", version: process.env.APP_VERSION ?? "0.0.0" },
  servers: [{ url: "https://api.example.com" }],
});

app.get("/reference", apiReference({ spec: { url: "/openapi.json" }, theme: "default", layout: "modern" }));

export { app };
```

Generated client tooling (`openapi-typescript`, `orval`, `Kubb`) points at the live `/openapi.json` so frontend/SDK/CLI/MCP consumers share the same contract source as the backend.

---

## 7. Testing Strategy

**Contracts (unit).** Test each Zod schema with valid and invalid payloads:
- `CreateProductRequestSchema` rejects empty `sku`/`name`, negative `priceCents`, `currency` not length 3; applies defaults (`status: "draft"`, `currency: "BRL"`).
- `ListProductsRequestSchema` applies `page=1`, `pageSize=20` defaults and rejects `pageSize > 100`.
- `UpdateProductRequestSchema` requires `id` and allows an otherwise-empty patch.
- `ErrorResponseSchema` requires `details.code`.

**Controllers (integration).** Boot the Hono app and exercise each route for: success status + exact `{ data, message }` envelope; `400` on malformed body; `401` without a token; `403` for a session lacking permission; `404` for unknown `id`; `409` for SKU conflict (create/update) and in-use (delete); `422` for domain validation. Assert the error body matches `{ error, details: { code } }`.

**OpenAPI (contract).** Boot the server, fetch `/openapi.json`, and assert:
- All five paths exist, each with `method: post`.
- `components.schemas` contains `Product`, `ProductStatus`, `ProductListItems`, the five `*RequestSchema`/`*ResponseSchema` refs, and `ErrorResponse`.
- Each route declares its full set of response codes and `security: [{ bearerAuth: [] }]`.
- Diff against a committed snapshot of **schema names and response codes only** (not full bodies/examples) to catch accidental removals without locking examples.

**E2E.** Drive the full lifecycle through the public API or a generated client: `create` -> `get` -> `list` (verify the new item appears in `data.items` and `total`) -> `update` -> `get` (verify patch) -> `delete` -> `get` (expect `404`).

---

## 8. API Design Checklist (verification)

1. **Single style, no mixing** — every endpoint is `POST /catalog/products/<action>`, JSON body only. ✓
2. **Contracts in shared package, `.openapi("RefName")`** on every reused schema. ✓
3. **`createRoute` + `app.openapi`**, every success and error status code declared, plus `security`. ✓
4. **Parameter placement** — JSON body only; no path/query params. ✓
5. **Response shape** — `{ data, message }` on success (collection nested in `data`); `{ error, details: { code } }` on error. ✓
6. **Thin, self-registering controller** delegating to use cases. ✓
7. **Typed errors via the single shared helper** — no inline error JSON. ✓
8. **Auth machine-readable** (`security` + `registerComponent`) and enforced in code (`sessionAuth` middleware). ✓
9. **`/openapi.json` regenerated at boot**, verified by fetching the spec in tests; never committed. ✓
10. **Tests cover** success, validation failure, auth failure, authorization failure, and domain/conflict cases. ✓

### POST-only-specific guards
- Plural entity in paths (`/catalog/products/...`). ✓
- No non-`POST` verbs anywhere. ✓
- Paths represent the public product resource, not the DB schema. ✓
- Exact `{ data, message }` envelope, no variants, no top-level resource. ✓
- `organizationId`/`workspaceId` derived from session, never accepted in body. ✓
- Breaking response changes would require a new action path or versioned contract. ✓
