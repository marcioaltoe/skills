---
name: backend-docs
description: Creates selected backend Markdown documentation from code evidence, including architecture/design docs, bounded context maps, developer onboarding, API contracts, and gap analysis for code smells, project-rule violations, DDD issues, coupling, and improvement opportunities. Use when the user asks to document a backend, map backend architecture or domains, onboard backend developers, audit backend documentation gaps, or produce objective backend docs. Do NOT use for frontend docs, generic README writing, or implementing backend changes.
argument-hint: "--mode <architecture|onboarding|gap-analysis|api-contracts|bounded-context> --backendPath <path-or-scope> [--outputPath <doc.md>]"
metadata:
  category: backend
  tags: [documentation, architecture, onboarding, ddd, api]
  version: 0.1.0
  author: marcioaltoe
  internal: false
---

# Backend Documentation

Create objective Markdown documentation for backend systems from code evidence. Generate only the document type the user selects; do not create a full documentation set unless explicitly requested.

## Document Selection

If the user does not specify the document type, ask them to choose one or more:

| User need                                  | Template                            |
| ------------------------------------------ | ----------------------------------- |
| Architecture and backend design            | `templates/architecture-design.md`  |
| Developer onboarding                       | `templates/developer-onboarding.md` |
| Gap analysis and improvement opportunities | `templates/gap-analysis.md`         |
| API contracts and endpoint behavior        | `templates/api-contracts.md`        |
| Bounded context map and DDD documentation  | `templates/bounded-context-map.md`  |

If the user asks for "backend docs" without a target path, create the selected file under `docs/backend/` using the template name as the filename. If the repository has a stronger docs convention, follow that convention instead.

Argument rules:

- Treat `--mode` as the selected document type.
- Treat `--backendPath` as the backend path, module, bounded context, route group, or scope to inspect.
- Treat `--outputPath` as the requested Markdown destination.
- If `--mode` is missing, infer the document type from the user's wording or ask them to choose.

Selection rules:

- Choose `bounded-context-map.md` when the request mentions bounded context, domain map, subdomain, ubiquitous language, context boundary, DDD mapping, or documentation recommendations for a domain area.
- Choose `gap-analysis.md` when the main outcome is risks, smells, violations, or improvement opportunities, even if DDD is one of the lenses.
- Choose `architecture-design.md` when the main outcome is how the backend is structured or why it is designed that way.
- Ask a clarifying question only when two document types would produce materially different outputs and the prompt does not imply a stronger reader need.

## Workflow

### Step 1: Confirm Scope

Identify the target backend, module, service, bounded context, or route group. If the request is broad, document only the highest-value slice first and note what remains out of scope.

Capture:

- Document type and target reader.
- Target path or docs convention.
- Backend stack and runtime if discoverable.
- Whether the document should describe current state, proposed design, or both.

### Step 2: Discover Rules and Existing Docs

Read `references/discovery-workflow.md`, then inspect project rules before reading implementation details.

Prioritize:

1. Project instructions: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.windsurf/rules/`, `CONTRIBUTING.md`.
2. Existing docs: `docs/`, ADRs, RFCs, architecture notes, onboarding docs.
3. Code contracts: route definitions, schemas, generated OpenAPI setup, database schemas, migrations, jobs, queues, integrations, tests.

If project rules conflict with this skill, project rules win.

### Step 3: Gather Evidence From Code

Trace the backend from entry points to behavior. Use file references rather than pasting large code blocks.

Look for:

- App bootstrapping, dependency injection, routing, middleware, auth, and tenancy.
- Controllers, handlers, use cases, services, domain models, repositories, data access, and external clients.
- API request and response schemas, error shapes, status codes, generated documentation, and client contracts.
- Database tables, relationships, migrations, transactions, backfills, and unsafe migration patterns.
- Background jobs, webhooks, queues, event flows, scheduled tasks, retries, idempotency, and failure handling.
- Tests, observability, runbooks, feature flags, rollback paths, and operational risks.

Document facts as "Observed" and label conclusions as "Inference" when they are not directly stated in code or docs.

### Step 4: Load Only Relevant References

Use progressive disclosure:

- For documentation structure and brevity, read `references/documentation-principles.md`.
- For backend evidence collection and source-skill routing, read `references/source-skill-map.md`.
- For architecture, API, DDD, coupling, data, and quality checks, read `references/backend-quality-lenses.md`.
- For Hono, Zod/OpenAPI, Drizzle, schema validation, generated API docs, or migration evidence, read `references/framework-contract-notes.md`.
- For the selected document shape, read only the matching template in `templates/`.

### Step 5: Write the Markdown Document

Use the selected template as the structure. Keep the document compact and useful to the target reader.

Each generated document should:

- Start with scope, audience, and last-reviewed date.
- Cite concrete code or docs evidence with file paths and line numbers when available.
- Separate current state from recommendations.
- Prefer tables for inventories, risks, APIs, gaps, and next actions.
- Include diagrams only when they clarify relationships or runtime flow.
- Mark unknowns and assumptions instead of inventing missing details.
- End with a short maintenance note explaining when the document should be updated.

### Step 6: Validate Before Finishing

Before final response:

- Re-read the generated or edited document.
- Check that the selected template was followed.
- Check that every non-obvious claim has evidence or is labeled as inference.
- Check that no unrelated templates were generated.
- Check links and file paths.
- If validation commands exist for docs formatting or markdown linting, run the project-preferred command.

## Output Rules

- Write in the user's language unless the repository has a documented docs language.
- Use concise technical prose. Avoid promotional language and generic claims.
- Do not duplicate large source code blocks. Link to source paths instead.
- Do not silently create ADRs, RFCs, or TDDs unless the user selected that form or the repository convention requires it.
- Do not implement backend changes while documenting. If gaps are found, record them as recommendations.

## Examples

### Architecture and Design

User says: "Document the backend architecture for the billing service."

Action: Select `templates/architecture-design.md`, inspect project rules and billing code, map components and runtime flows, then write one Markdown document with current architecture, decisions, risks, and improvement opportunities.

### Onboarding

User says: "Create onboarding docs so a new backend dev can understand this API."

Action: Select `templates/developer-onboarding.md`, identify setup commands and core flows from project docs and code, then write a practical guide that gets the reader from local setup to safe first contribution.

### Gap Analysis

User says: "Find backend documentation gaps and architecture smells in this module."

Action: Select `templates/gap-analysis.md`, apply project rules plus DDD, coupling, API, data, and testing lenses, then produce prioritized findings with evidence, severity, and next actions.

### Bounded Context Map

User says: "Map the auth bounded context and recommend backend docs we should add."

Action: Select `templates/bounded-context-map.md`, apply the domain-analysis, tactical-DDD, coupling, API, data, and project-rule lenses, then produce one context map with boundaries, relationships, model ownership, risks, unknowns, and documentation recommendations.
