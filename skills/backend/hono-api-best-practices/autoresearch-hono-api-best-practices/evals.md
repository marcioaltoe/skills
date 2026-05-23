# Eval Suite — hono-api-best-practices

Max score = 5 evals × 5 runs = 25 per experiment.

## Test Inputs

1. **rest-greenfield** — "Backend Bun+Hono com pacote `api-contracts`. Desenhe os endpoints para listar e criar `invoices`."
2. **post-only-crud** — "Usamos POST-only action paths. Desenhe create/get/list/update/delete de `products` no contexto `catalog`."
3. **audit-ambiguous** — "Auditar rota existente `app.get('/v1/orders/:id', handler)` que retorna `{ data: order }`. É compliant?"
4. **state-transition** — "Adicione um endpoint para cancelar uma assinatura. O repo já tem rotas com `createRoute` `method:'post'` e paths tipo `/billing/subscriptions/cancel`."
5. **codegen-docs** — "Precisamos que `/openapi.json` seja consumível por um gerador de MCP/CLI. Desenhe `webhooks` create + list mostrando contratos e rotas para que a spec gerada seja completa."

## Evals (binary)

### EVAL 1: Style discipline
Question: Did the output pick exactly ONE style (REST or POST-only) appropriate to the prompt and apply it consistently?
Pass: One style chosen; all paths/methods consistent with it (REST = verbs + resource paths; POST-only = all POST + action paths). For audit/ambiguous inputs, the output correctly identifies/infers the style.
Fail: Mixes REST verbs with POST-only action paths, or designs in the wrong style for an input that signals a style, or never commits to a style.

### EVAL 2: Request validation (Zod)
Question: Does every endpoint validate request input with Zod through `createRoute` (params/query/body schemas)?
Pass: Each endpoint declares a Zod `request` schema (body and/or query/params) and the controller reads via `context.req.valid(...)`. No inline `await c.req.json()` without schema validation.
Fail: Any endpoint parses request input without a Zod schema, or relies on untyped `req.json()`.

### EVAL 3: Response validation (Zod)
Question: Does every response status code (success + errors) declare a Zod schema in `responses`, and does the output address that responses conform to those schemas (not just request)?
Pass: Every status code in `responses` has a `content` schema (except bodyless 204), success uses a typed response schema, and the output mentions verifying/enforcing the response shape (e.g. response schema in contracts + contract/integration test asserting it).
Fail: `responses` lists only `200`, omits schemas, or response shape is left untyped/unmentioned.

### EVAL 4: OpenAPI codegen readiness
Question: Are reused schemas annotated with `.openapi("RefName")` and all status codes listed, so the generated `openapi.json` is complete enough for CLI/MCP/SDK codegen?
Pass: Every reused schema calls `.openapi("RefName")`; every endpoint uses `createRoute` + `app.openapi`; all emittable status codes listed; `security` declared. Output ties this to consumability by codegen tools (MCP/CLI/SDK).
Fail: Inline schemas without refs, missing status codes, missing `security`, or no mention of codegen consumability.

### EVAL 5: Error envelope
Question: Do error responses use `{ error, details: { code, ... } }` with `code` required inside `details`?
Pass: Error body is `{ error: string, details: { code: SCREAMING_SNAKE_CASE, ... } }`; code lives inside details; routed through the shared error helper.
Fail: `code` at top level, `{ error: { code, message } }` nesting, free-form error strings, or inline error responses.
