# Discovery Workflow

Run this workflow before writing backend documentation.

## 1. Establish the Documentation Contract

Record:

- Requested document type.
- Backend scope: whole service, module, route group, bounded context, job, integration, or database area.
- Reader: new backend developer, current maintainer, tech lead, reviewer, stakeholder, or operator.
- Output location and language.
- Whether the doc describes current state, proposed state, or gaps.

Ask a clarifying question only when the missing choice changes the document substantially. The most important missing choice is document type.

## 2. Find Project Rules

Search for:

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/`
- `.windsurf/rules/`
- `.cursorrules`
- `CONTRIBUTING.md`
- `docs/adr/`, `docs/decisions/`, `adr/`
- `docs/architecture/`, `docs/backend/`, `docs/api/`

Extract rules that affect:

- Architecture layers and boundaries.
- API style.
- Database and migration safety.
- Naming and file organization.
- Testing and verification.
- Documentation placement and language.

## 3. Inventory Backend Entry Points

Find the shortest path from boot to behavior:

- App entry: `main`, `index`, `app`, `server`, worker bootstrap, CLI bootstrap.
- Routes/controllers/resolvers.
- Middleware: auth, tenancy, validation, error handling, logging.
- Use cases/services/handlers.
- Domain models/entities/value objects/aggregates.
- Repositories/data access/schema/migrations.
- Background jobs, queues, webhooks, schedulers, events.
- External clients and integrations.

For each important element, capture path, responsibility, and the one or two relationships that matter.

## 4. Trace Representative Flows

Choose flows based on the selected document:

- Architecture/design: one happy path, one failure path, one async or integration path if present.
- Onboarding: local setup, test path, first safe change path, and one core request path.
- Gap analysis: flows with highest risk, largest modules, duplicated logic, unclear ownership, or brittle tests.
- API contracts: route registration, schemas, status codes, auth, error mapping, and generated docs.

Record evidence as file paths and line numbers when possible.

## 5. Separate Fact From Inference

Use these labels:

- Observed: directly supported by code, docs, tests, or command output.
- Inference: likely conclusion based on code structure, naming, or repeated patterns.
- Unknown: not found or not enough evidence.
- Recommendation: proposed next action based on observed evidence.

Do not present an inference as a fact.

## 6. Keep a Gap Log While Reading

Track gaps as you go:

| Gap                         | Evidence                                        | Impact           | Suggested next step        |
| --------------------------- | ----------------------------------------------- | ---------------- | -------------------------- |
| Missing endpoint error docs | Route lists 409 but docs omit conflict behavior | Client ambiguity | Add API contract table row |

Only include gaps relevant to the selected document. Save broader findings for a follow-up list.
