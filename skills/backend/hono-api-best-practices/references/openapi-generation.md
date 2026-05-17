# OpenAPI Generation from Zod Schemas

Detailed companion to the SKILL.md §OpenAPI Spec Generated From Zod section. Read this when implementing or reviewing any endpoint that must appear in `/openapi.json`.

## The generation flow

```text
Zod schema (api-contracts)  →  .openapi() metadata  →  createRoute()  →  /openapi.json  →  Scalar UI  +  typed clients
```

There is NO hand-maintained `openapi.yaml` or `openapi.json` file in the repo. The spec exists only at runtime, served by the Hono app.

## Step 1 — Annotate Zod schemas with OpenAPI metadata

Extend Zod with `zod-openapi` and attach `.openapi()` metadata at the point of schema definition, inside the shared contracts package. The `ref` name is what appears in `components.schemas` of the generated spec.

```ts
// packages/api-contracts/src/visio/companies.ts
import { z } from "@hono/zod-openapi"; // re-exports zod with .openapi() extension

export const CompanySchema = z
  .object({
    id: z.string().uuid().openapi({ example: "01HZ...UUID" }),
    name: z.string().min(1).openapi({ example: "Loja 1" }),
    externalCode: z.string().min(1).openapi({ example: "1" }),
    isActive: z.boolean().openapi({ example: true }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Company"); // ref: #/components/schemas/Company

export const CreateCompanyRequestSchema = z
  .object({
    name: z.string().min(1),
    externalCode: z.string().min(1),
    isActive: z.boolean().default(true),
  })
  .openapi("CreateCompanyRequest");

export const CreateCompanyResponseSchema = z
  .object({
    data: CompanySchema,
    message: z.string(),
  })
  .openapi("CreateCompanyResponse");

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z.object({ code: z.string() }).catchall(z.unknown()),
  })
  .openapi("ErrorResponse");
```

## Step 2 — Register routes with `createRoute`

Every endpoint is declared with `createRoute` so the generator knows its method, path, request body schema, and every response status code + schema. The controller mounts the route on an `OpenAPIHono` instance — no separate spec file, no drift.

```ts
// src/contexts/visio/infra/http/routes/create-company.route.ts
import { createRoute } from "@hono/zod-openapi";
import {
  CreateCompanyRequestSchema,
  CreateCompanyResponseSchema,
  ErrorResponseSchema,
} from "api-contracts";

export const createCompanyRoute = createRoute({
  method: "post",
  path: "/visio/companies/create",
  tags: ["visio.companies"],
  summary: "Create a company",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: CreateCompanyRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Company created",
      content: { "application/json": { schema: CreateCompanyResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Unauthenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
```

The controller wires the route to the use case via `app.openapi(route, handler)`, which ALSO runs Zod validation on the request body. No separate `zValidator` call is needed when `createRoute` is used.

```ts
// src/contexts/visio/infra/http/controllers/company.controller.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { createCompanyRoute } from "../routes/create-company.route";

export class CompanyController {
  constructor(
    private readonly app: OpenAPIHono,
    private readonly createCompanyUseCase: CreateCompanyUseCase
  ) {
    this.app.openapi(createCompanyRoute, async context => {
      const body = context.req.valid("json");
      const session = context.get("session");
      const result = await this.createCompanyUseCase.execute({
        ...body,
        organizationId: session.organizationId,
      });
      if (!result.ok) return mapApplicationErrorToResponse(context, result.error);
      return context.json({ data: result.value, message: "Success" }, 201);
    });
  }
}
```

## Step 3 — Expose `/openapi.json` and Scalar UI

One place in the app bootstrap wires the generated spec and the UI. Nothing else references them.

```ts
// src/app.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";

const app = new OpenAPIHono();

// Shared security scheme — referenced by `createRoute({ security: [{ bearerAuth: [] }] })`.
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "session-token",
});

// Generated spec — served as raw JSON, consumed by Scalar, SDK generators, contract tests.
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Axis API",
    version: process.env.APP_VERSION ?? "0.0.0",
  },
  servers: [{ url: "https://api.gesttione.com" }],
});

// Interactive docs — reads the exact same `/openapi.json` the clients will consume.
app.get(
  "/reference",
  apiReference({
    spec: { url: "/openapi.json" },
    theme: "default",
    layout: "modern",
  })
);
```

## Rules for keeping `openapi.json` accurate

- **Every new endpoint MUST be declared with `createRoute`.** A controller that calls `app.post(...)` directly will not appear in `openapi.json` — this is a bug, not a shortcut.
- **Every response the endpoint can emit MUST be listed in `responses`.** Missing `400`/`401`/`403`/`409`/`500` entries means the generated spec lies to clients. Use `ErrorResponseSchema` as the shared error body.
- **Every schema reused across endpoints MUST call `.openapi("RefName")`.** This produces stable `$ref`s in `components.schemas` instead of inlined duplicates.
- **Auth requirements MUST be declared via `security`.** Register the scheme once (`registerComponent`), then reference it per route. Do not document auth in free-form `description` text.
- **Do not commit generated specs to git.** The spec is regenerated on every boot. A checked-in `openapi.json` becomes stale the moment a schema changes.
- **Contract tests assert against `/openapi.json`.** CI boots the server, fetches the spec, and diffs it against the committed snapshot of the _schema names and response codes_ — not the full body. This catches accidental removals without locking examples.

## Client generation (optional but preferred)

When frontends consume the API through a generated client (e.g. `openapi-typescript`, `orval`, `Kubb`), point the generator at the live `/openapi.json` during codegen. The contracts package supplies the Zod types for the backend; the generator supplies the matching client types for the frontend — both derive from the same source.

## Common mistakes to reject in review

| Mistake                                                              | Why it breaks generation                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `app.post("/foo", handler)` instead of `app.openapi(route, handler)` | Endpoint vanishes from `/openapi.json`                      |
| Response schema inlined instead of `.openapi("Ref")`                 | Duplicated shape in spec; diff noise; slower codegen        |
| Only `200` declared in `responses`                                   | Client SDKs cannot handle 4xx without `ErrorResponseSchema` |
| Checking `openapi.json` into git                                     | Becomes stale immediately; diverges silently                |
| `security: []` or missing                                            | Generated SDKs omit auth headers                            |
| Free-form `description: "Requires auth"` instead of `security`       | Machine-readable auth lost; tooling can't enforce it        |
