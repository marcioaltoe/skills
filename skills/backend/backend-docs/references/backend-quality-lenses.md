# Backend Quality Lenses

Use these lenses when the selected document needs architecture analysis, gap identification, or backend design explanation.

## Project Rules Lens

Check whether implementation and documentation follow local rules:

- Required architecture layers.
- Naming conventions.
- API style and response envelopes.
- Error handling.
- Auth and tenancy.
- Migration process.
- Test requirements.
- Docs placement and language.

Report rule violations with source rule path and code evidence.

## Architecture Lens

Map:

- Components and responsibilities.
- Layer boundaries.
- Dependency direction.
- Runtime flows.
- External systems.
- Cross-cutting concepts.
- Deployment and operational concerns.

Common issues:

- Layer bypasses.
- God modules or overloaded services.
- Mixed responsibilities.
- Missing ownership.
- Hidden external dependencies.
- Architecture decisions not captured in ADRs.

## DDD Lens

For strategic DDD:

- Identify business capabilities and candidate subdomains.
- Classify core, supporting, and generic subdomains.
- Look for ubiquitous language and term conflicts.
- Flag unclear bounded contexts and cross-domain leakage.

For tactical DDD:

- Look for anemic domain models.
- Prefer behavior with data.
- Prefer value objects over primitive obsession.
- Keep aggregate invariants inside aggregate methods.
- Treat domain services as a fallback when behavior spans aggregates.
- Avoid holding object references to other aggregates; reference by ID.

Report DDD issues as findings, not forced refactors.

## Coupling Lens

Classify problematic dependencies:

| Coupling   | Signal                                                        | Risk                          |
| ---------- | ------------------------------------------------------------- | ----------------------------- |
| Intrusive  | Reads another module's internals or database                  | Breaks on internal change     |
| Functional | Shared workflow, execution order, or duplicated business rule | Changes cascade               |
| Model      | Exposes internal domain model as public contract              | Consumers depend on internals |
| Contract   | Dedicated DTO, versioned interface, published schema          | Preferred for distant modules |

Also estimate distance and volatility:

- High distance plus strong coupling plus high volatility is high priority.
- Strong coupling inside a cohesive, local component may be acceptable.

## API Contract Lens

For each endpoint or action, capture:

- Method and path.
- Purpose and owner.
- Auth and tenancy requirements.
- Request body or params.
- Response body.
- Error responses and status codes.
- Validation source.
- Idempotency, side effects, and events.
- Generated OpenAPI or docs source if present.

For Hono + Zod OpenAPI projects, check:

- Routes are generated from schemas, not hand-written spec files.
- Every request and response schema has stable OpenAPI metadata when the project expects it.
- Every possible status code appears in route responses.
- Controllers stay thin and delegate to use cases.
- Errors use the project-standard envelope and shared mapper.

## Data and Migration Lens

Document:

- Tables, relationships, ownership, and sensitive fields.
- Query patterns and indexes relevant to the selected scope.
- Migration sequence and rollback path.
- Backfills and constraint tightening.
- Transaction boundaries.
- Data consistency and idempotency risks.

Common issues:

- Destructive migration without backfill or rollback path.
- Missing indexes for common filters or joins.
- Business invariants enforced only in controllers.
- Unbounded list queries.
- Data model leaking into public API contracts.

## Testing and Verification Lens

Check:

- Existing tests for the documented behavior.
- Lowest layer that verifies each invariant.
- Integration tests for routes, database, queues, webhooks, or external boundaries.
- Contract tests for generated API specs or external integrations.
- Negative cases and failure modes.

Treat missing tests as documentation risk when the doc claims behavior that tests do not protect.

## Security and Operations Lens

Check:

- AuthN/AuthZ boundaries.
- Tenant isolation.
- PII and secret handling.
- Webhook signature verification.
- Rate limits, abuse paths, and input validation.
- Logging, metrics, tracing, alerts, and dashboards.
- Feature flags and rollback.
- Runbooks for recurring failures.

Flag high-impact unknowns clearly.

## Finding Format

Use this structure for gap-analysis findings:

```markdown
### [Severity] Finding title

- **Type**: Project rule | Architecture | DDD | Coupling | API | Data | Testing | Security | Operations
- **Evidence**: `path/to/file.ts:42`
- **Observed**: What the code or docs show.
- **Impact**: Why it matters.
- **Recommendation**: The smallest useful next step.
- **Confidence**: High | Medium | Low
```
