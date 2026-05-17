# Framework Contract Notes

Use this reference only when the selected document involves Hono, Zod/OpenAPI, Drizzle ORM, generated API docs, schema validation, or migration behavior.

These notes are distilled from Context7 lookups for Hono, Zod, and Drizzle plus the documentation principles in `documentation-principles.md`. Verify against local code first; external docs explain expected framework behavior, but repository code is the source of truth for the document.

## Hono + Zod OpenAPI

For Hono projects that use `@hono/zod-openapi`, collect evidence for:

| Concern            | What to verify                                                                                                   | Typical evidence      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------- |
| Route registration | Routes are declared with `createRoute` and registered with `app.openapi` when OpenAPI output is expected.        | Route/controller file |
| Generated spec     | The app exposes OpenAPI through `app.doc` or equivalent setup.                                                   | App bootstrap file    |
| API reference UI   | Scalar or another reference UI points at the generated spec when present.                                        | App bootstrap file    |
| Security           | `security` appears in route definitions and matching security schemes are registered.                            | Route + app bootstrap |
| Responses          | Documented status codes in `responses` match success and known error paths.                                      | Route + error mapper  |
| Controller role    | Controllers validate/unwrap requests, call use cases, and return envelopes; they should not hide business rules. | Controller + use case |

Useful documentation outputs:

- API contracts: endpoint inventory, request/response schemas, auth, status codes, error envelope, generated spec source, side effects.
- Architecture/design: route registration path, generated docs path, error handler, and controller-to-use-case flow.
- Gap analysis: missing status codes, handwritten specs diverging from schemas, route security not aligned with app security schemes, or controllers doing domain work.

## Zod Schemas

For Zod-backed contracts, collect evidence for:

| Concern            | What to verify                                                                                       | Typical evidence                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Runtime validation | Request parsing uses schemas through route middleware or explicit `parse` / `safeParse`.             | Route/controller or validation middleware             |
| Type ownership     | TypeScript types are inferred from schemas where practical instead of manually duplicating DTOs.     | Contract package or use case types                    |
| OpenAPI metadata   | Schemas include `.openapi()` metadata when generated docs depend on it.                              | Contract schema file                                  |
| Error behavior     | Validation failures map into the project-standard error response.                                    | Validation middleware, route handler, or error mapper |
| Unknown fields     | Strictness, passthrough, coercion, transforms, and defaults are documented when they affect clients. | Schema file                                           |

Useful documentation outputs:

- API contracts: list schemas by endpoint and state where request validation and response typing come from.
- Gap analysis: duplicated DTOs, schemas without OpenAPI metadata, validation errors not documented, or inferred types not used where they should protect contracts.

## Drizzle ORM and Migrations

For Drizzle-backed persistence, collect evidence for:

| Concern            | What to verify                                                                                                            | Typical evidence                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Schema ownership   | Tables, columns, constraints, and relations are declared in schema files.                                                 | `schema.ts`, relation files     |
| Query path         | Use cases/services/repositories call Drizzle queries through the expected data-access boundary.                           | Use case, repository, db module |
| Transactions       | Multi-write invariants use transactions when partial writes would be unsafe.                                              | Data-access code                |
| Migrations         | Migrations match current schema expectations and include rollout/rollback/backfill notes when project rules require them. | Migration SQL/metadata/docs     |
| Destructive change | Dropping/renaming columns, tightening constraints, or changing nullability has a documented backfill and rollback path.   | Migration file + docs           |
| Data contract      | Public API responses do not expose accidental database internals unless the project intentionally uses that model.        | Schema + response schema        |

Useful documentation outputs:

- Architecture/design: owned tables, persistence path, transaction boundaries, and migration risks.
- Onboarding: where schema lives, how to run migrations/tests, and what first database changes are safe.
- Gap analysis: schema/migration drift, unsafe migration, missing transaction, missing index for common query, or database model leaking into API contracts.

## How to Write Findings From Framework Evidence

Use this shape when a framework concern becomes a finding:

```markdown
### [Severity] [Finding title]

- **Type**: API | Data | Testing | Project rule
- **Evidence**: `path/to/file.ts:42`, `path/to/migration.sql:1`
- **Observed**: [What the local code shows.]
- **Framework expectation**: [Short Hono/Zod/Drizzle behavior relevant to the issue.]
- **Impact**: [Why the reader should care.]
- **Recommendation**: [Smallest useful next step.]
- **Confidence**: High | Medium | Low
```

Keep the framework expectation short. Do not turn backend documentation into framework tutorials.
