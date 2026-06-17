---
name: external-api-adapters
description: Use when designing, writing, or reviewing adapters for external APIs, ERP systems, payment providers, storage providers, or third-party services. Covers boundary contracts, typed clients, retries, timeouts, pagination, error normalization, observability, and tests. Do not use for pure internal domain logic with no external service boundary.
metadata:
  version: 0.1.0
  tags: [backend, api, integration, adapters]
---

# External API Adapters

Use this skill when code crosses a process or vendor boundary.

## Core Rules

- Keep external APIs behind adapters. Domain and use case code should depend on ports, not SDKs or HTTP client details.
- Convert external DTOs into internal domain/application types at the boundary.
- Normalize external errors into a small set of application errors.
- Set explicit timeouts for every network call.
- Make retry behavior deliberate, bounded, and safe for the operation.
- Capture correlation IDs, request IDs, vendor IDs, and pagination cursors as structured evidence.
- Keep credentials and raw sensitive payloads out of logs, snapshots, and thrown messages.

## Adapter Shape

```ts
export interface ErpCustomerGateway {
  fetchCustomer(id: CustomerId): Promise<ExternalCustomerResult>;
}

export class HttpErpCustomerAdapter implements ErpCustomerGateway {
  async fetchCustomer(id: CustomerId): Promise<ExternalCustomerResult> {
    // HTTP or SDK details stay here.
  }
}
```

Prefer one adapter per external capability or bounded integration. Avoid large "vendor client" classes that mix unrelated operations.

## Boundary Checklist

- Input is validated before leaving the application.
- Output is parsed and validated before entering the application.
- Timeouts are configured and tested.
- Retry policy is documented by operation.
- Non-idempotent calls have idempotency keys or no automatic retry.
- Pagination and cursors have deterministic stop conditions.
- Rate limit responses are handled explicitly.
- Logs include operation, external system, request ID, and safe identifiers.
- The adapter has tests for success, validation failure, timeout, retryable failure, non-retryable failure, and malformed response.

## Retry Guidance

Retry only when the operation is idempotent or has an idempotency key. Do not retry validation failures, authentication failures, authorization failures, or permanent business-rule responses.

Use small bounded retries with jitter for transient network failures and 5xx responses. Surface repeated failure as a typed application error.

## Error Normalization

Map vendor-specific details to application errors:

```ts
type ExternalServiceError =
  | { kind: "unavailable"; retryAfterMs?: number; requestId?: string }
  | { kind: "unauthorized"; requestId?: string }
  | { kind: "not-found"; requestId?: string }
  | { kind: "invalid-response"; requestId?: string; reason: string };
```

The rest of the application should not branch on SDK exception names or raw HTTP status codes unless the adapter contract explicitly exposes them.

## Testing Guidance

- Unit test mapping and error normalization with focused fixtures.
- Use contract tests for real or recorded external response shapes.
- Keep fake clients behavior-based, not assertion-only mocks.
- Include negative fixtures for malformed, partial, and unexpected responses.
- Verify observability fields for failure paths when operations teams need them.

## Common Mistakes

- Passing external DTOs through the application unchanged.
- Retrying non-idempotent operations.
- Hiding partial failure behind empty arrays or `undefined`.
- Treating all 4xx or all 5xx responses the same.
- Adding SDK imports throughout use case or domain code.
