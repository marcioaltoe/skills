# Discovery Workflow

Run this workflow before writing frontend documentation.

## 1. Establish the Documentation Contract

Record:

- Requested document type.
- Frontend scope: whole app, route group, domain system, component set, design-system area, state layer, form flow, table/grid, or integration.
- Reader: new frontend developer, current maintainer, designer, tech lead, reviewer, QA, accessibility reviewer, or product operator.
- Output location and language.
- Whether the doc describes current state, proposed state, or gaps.

Ask a clarifying question only when the missing choice changes the document substantially. The most important missing choice is document type.

## 2. Find Project Rules

Search for:

- `AGENTS.md`
- `CLAUDE.md`
- `DESIGN.md`
- `.cursor/rules/`
- `.windsurf/rules/`
- `.cursorrules`
- `CONTRIBUTING.md`
- `docs/architecture/`, `docs/frontend/`, `docs/design/`, `docs/qa/`
- Storybook docs and design-system docs

Extract rules that affect:

- Frontend architecture and feature organization.
- Route and data-fetching style.
- Design-system tokens, components, typography, spacing, color, dark mode, and accessibility.
- Naming, file organization, barrels, generated files, and import boundaries.
- Testing and verification.
- Documentation placement and language.

## 3. Inventory Frontend Entry Points

Find the shortest path from app boot to user behavior:

- App root, router setup, providers, global styles, and route tree generation.
- Route files, layout routes, guards, loaders, search params, pending/error/not-found components.
- Domain systems, adapters, query keys/options, hooks, mutations, stores, contexts, forms, schemas, and public barrels.
- Components, primitives, variants, stories, tests, accessibility behavior, and design tokens.
- External clients, analytics, feature flags, real-time connections, and backend API integrations.

For each important element, capture path, responsibility, and the one or two relationships that matter.

## 4. Trace Representative Flows

Choose flows based on the selected document:

- Architecture/design: app bootstrap, one route/data flow, one component composition path, and one cross-cutting concern.
- Onboarding: setup, first route, first system change, first component change, first test/story path.
- Gap analysis: flows with highest risk, duplicated state, unclear ownership, brittle UI states, missing accessibility, or weak tests.
- Route/data contracts: route -> loader/search -> query options -> adapter -> mutation/invalidation -> UI states.
- Component system map: primitives -> composed components -> feature components -> states -> stories/tests.

Record evidence as file paths and line numbers when possible.

## 5. Separate Fact From Inference

Use these labels:

- Observed: directly supported by code, docs, tests, Storybook, screenshots, or command output.
- Inference: likely conclusion based on code structure, naming, or repeated patterns.
- Unknown: not found or not enough evidence.
- Recommendation: proposed next action based on observed evidence.

Do not present an inference as a fact.

## 6. Keep a Gap Log While Reading

Track gaps as you go:

| Gap                      | Evidence                                              | Impact                      | Suggested next step            |
| ------------------------ | ----------------------------------------------------- | --------------------------- | ------------------------------ |
| Missing empty state docs | Component handles error but no empty state is present | Users may see blank screens | Add state matrix row and story |

Only include gaps relevant to the selected document. Save broader findings for a follow-up list.
