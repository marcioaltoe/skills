---
name: integration-contract-testing
description: Use when writing or reviewing tests for external API adapters, storage adapters, database integration boundaries, or service contracts. Covers fixture design, schema validation, negative contracts, fakes, recorded responses, and CI-safe verification. Do not use for simple pure unit tests with no boundary contract.
metadata:
  version: 0.1.0
  tags: [testing, integration, api, backend]
---

# Integration Contract Testing

Use this skill to prove that adapter boundaries match the contracts the application relies on.

## Core Rules

- Test the boundary contract, not the vendor implementation.
- Validate both successful and failed response shapes.
- Keep fixtures realistic, minimal, and sanitized.
- Prefer schema validation at the boundary and assert that invalid vendor data is rejected.
- Use fakes for application tests and focused integration tests for adapter behavior.
- Make CI deterministic. Networked tests need explicit opt-in, stable credentials, and clear skip behavior.

## Contract Test Layers

1. **Mapping tests**: external fixture to internal type.
2. **Error normalization tests**: vendor failure to application error.
3. **Adapter seam tests**: adapter sends the expected command/request and handles the response.
4. **Optional live smoke**: confirms credentials, endpoint, and one safe operation in controlled environments.

## Fixture Rules

- Store sanitized fixtures near the adapter tests.
- Name fixtures by behavior: `customer-success.json`, `customer-missing-required-field.json`.
- Include at least one malformed or incomplete response fixture.
- Avoid large golden files unless the full shape is the contract.
- Redact tokens, credentials, personal data, and proprietary payload details.

## Test Checklist

- Success response maps to the internal contract.
- Missing required field fails clearly.
- Unexpected enum/status is handled.
- Timeout or network failure maps to a retryable/unavailable error.
- Authentication/authorization failure is not retried as transient.
- Pagination stops correctly and preserves cursors/checkpoints.
- Observability fields such as request IDs are preserved where available.

## Fakes vs Mocks

Use behavior fakes when testing use cases:

```ts
class FakeCustomerGateway implements CustomerGateway {
  customers = new Map<string, Customer>();

  async getCustomer(id: string) {
    return this.customers.get(id);
  }
}
```

Use narrow mocks at SDK/HTTP seams only when testing the adapter itself.

## Common Mistakes

- Testing that a mock was called but not testing the resulting behavior.
- Only testing happy-path fixtures.
- Allowing raw vendor fields to leak into domain assertions.
- Making all tests depend on live external services.
- Leaving fixture data unsanitized.
