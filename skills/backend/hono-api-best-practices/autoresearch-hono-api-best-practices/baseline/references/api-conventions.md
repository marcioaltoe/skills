# API Conventions (both styles)

Shared conventions that apply to REST and POST-only alike. `SKILL.md` points here — read it when shaping contracts, credentials, authorization, or field formats.

## Credential model — scopes + access boundary

Every credential (API key, session token, MCP token) carries two orthogonal authorizations, and both must be enforced in code and declared machine-readably via OpenAPI `security`:

- **`scopes`** — *what* the credential may do, as `resource:action` (e.g. `transactions:read`, `webhooks:write`).
- **`accessBoundary`** — *where* it may act: a specific set of resource ids (`{ type: "projects", ids: [...] }`) or the whole tenant (`{ type: "all_tenant" }`).

Rules:

- Never infer broad access. A credential reaches the whole tenant only with an explicit `all_tenant`-style boundary — not because several resources happen to share a tenant.
- MCP tokens are a separate credential type from API keys, each with its own scopes and boundary. This is what lets the same `/openapi.json` drive an MCP server where each operation becomes a tool gated by the caller's scopes.
- Creation, rotation, and revocation of credentials should be auditable.

## Authorization: 403 vs 404, and scope narrowing

- A tenant-scoped resource that does not exist within the credential's scope → `404 Not Found`.
- A resource that exists but the credential's boundary does not allow → `403 Forbidden`.
- Query filters may **narrow** the credential's access boundary, never **expand** it. A filter that references a resource outside the boundary → `403`.
- Do not require a scope filter on every collection endpoint; the credential boundary defines the effective scope, and cursor/limit controls volume.

## Field & format conventions

- **camelCase** for JSON fields and query params across the public contract.
- **Money** as a decimal string plus an ISO 4217 currency code (`{ "amount": "-1234.56", "currency": "BRL" }`); never a JSON float. Make the sign explicit, and add an explicit `direction` (`credit` | `debit`) when it would otherwise be ambiguous.
- **Instants** use ISO 8601 with timezone (`createdAt`, `expiresAt`); **business dates** use `YYYY-MM-DD`.
- **Temporal filters name their dimension** — `createdFrom`/`createdTo`, `dateFrom`/`dateTo`, `expiresBefore` — never an ambiguous generic `from`/`to`.
- A known field with no value from the source is `null`; a field not applicable to a resource type is omitted from that schema rather than set to a sentinel.

## Asynchronous operations

Long-running operations return `202 Accepted` with a **status resource** (a job/request) that has an explicit state enum, polled via `GET`:

```text
POST /v1/exports        -> 202 + { id, status: "queued" }
GET  /v1/exports/{id}   -> { id, status: "queued" | "processing" | "completed" | "failed", ... }
```

Model the operation as a resource, not an RPC action (same rule as the style guides). The status enum is part of the contract — a Zod enum with `.openapi("RefName")` so it appears in the generated spec.
