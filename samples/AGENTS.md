# General Agent Instructions

## HIGH PRIORITY (read first — every task)

- **ALWAYS READ** `DESIGN.md` before writing any UI code — it is the single source of truth for colors, typography, spacing, component patterns, and visual guidelines. Ignoring it produces inconsistent UI
- **IF YOU DON'T CHECK SKILLS** your task will be invalidated. Use the relevant skill for the technology being touched (see Skills Enforcement below).
- **YOU CAN ONLY** finish a task if the project's verification command passes at 100%. For SaaS this is usually `make verify`. No exceptions — failing any required command means the task is **NOT COMPLETE**
- **For Bun/TypeScript projects**, `bun run lint` treats warnings as errors. Zero warnings allowed — any oxlint warning is a blocking failure, not something to ignore.
- **ALWAYS USE** `oxlint-oxfmt` before changing lint/format configuration or resolving Oxlint/Oxfmt failures.
- **ALWAYS** check dependent file APIs before writing tests to avoid writing wrong code.
- **ALWAYS USE** `coding-guidelines`, `clean-code`, and `solid` as code generation references before writing or modifying production code. Apply them together with the domain-specific skill for the technology being touched.
- **NEVER** use workarounds, especially in tests — always use the `no-workarounds` skill for any fix/debug task and `testing-boss` for tests.
- **ALWAYS** use the `no-workarounds` and `systematic-debugging` skills when fixing bugs or complex issues.
- **YOU MUST** use Context7 MCP (`context7` skill) or Exa MCP (`exa-web-search` skill) when researching external libraries/frameworks before implementing integrations — 3-7 searches with Exa for better results.
- **NEVER** use Context7 or Exa to search local project code — for local code, use Grep/Glob instead.
- **For Bun/Node workspaces**, never install dependencies by hand in `package.json` without verifying the package exists and checking its latest version — always use `bun add` (run from the workspace package that needs the dep, not root).

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repo uses the default five-role triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: root `CONTEXT.md` plus ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Project agent profile

Use this profile for Bun/TypeScript SaaS projects with React, Hono, Drizzle, Zod, Tailwind, shadcn, TanStack, and product-facing workflows. Global safety, workflow, commit, PR, and evidence rules always apply.

### SaaS agent

- Install setup: `saas`
- Primary workflow: `grill-with-docs` -> `to-prd` -> `to-issues` -> `implement` -> `review` -> `evidence-gate`
- Core engineering skills: `coding-guidelines`, `clean-code`, `solid`, `no-workarounds`, `testing-boss`, `conventional-commits`
- Backend skills: `hono-api-best-practices`, `hono`, `drizzle-orm`, `zod`, `logtape`, `external-api-adapters`, `integration-contract-testing`, `observability-audit`
- Frontend skills: `react`, `feature-systems-pattern`, `tanstack-query`, `tanstack-router`, `baseline-ui`, `shadcn`, `tailwindcss`, `ui-ux-pro-max`, `frontend-design`, `interface-design`
- Verification: run the repo's full verification command, usually `make verify`, before completion.

## MANDATORY REQUIREMENTS

- **MANDATORY**: Apply the SaaS agent profile above before interpreting technology-specific mandates.
- **MUST** run the project's verification command before completing ANY subtask. SaaS usually uses `make verify` or `bun run lint && bun run typecheck && bun run test`. All commands must exit with **zero errors and zero warnings**. If any command fails, fix the issues and re-run until all pass
- **MANDATORY**: Use the relevant UI quality skills before frontend design or UI engineering work: `ui-ux-pro-max` for broad UI/UX decisions, `frontend-design` for visual direction, `interface-design` for app/dashboard interfaces, `baseline-ui` for Tailwind/component quality, and `interaction-design` for motion or microinteractions.
- **ALWAYS USE** the `react` skill before writing any React component
- **ALWAYS USE** the `tanstack-router` skill before working with routing
- **ALWAYS USE** the `tanstack-query` skill before working with data fetching
- **ALL frontend code** (components, pages, hooks, queries, mutations) **REQUIRES** the `feature-systems-pattern` skill.
- **NEW frontend features** must live under `packages/frontend/src/systems/<domain>/`. Required: `components/`, `lib/`, and an `index.ts` barrel. Optional (add when needed, not pre-empty): `hooks/`, `adapters/`, `contexts/`, `stores/`. Surface-scoped CSS (e.g. `<domain>.css`) lives at the system root and is imported from `index.ts`.
- **Shared** shadcn-base UI primitives go in `packages/frontend/src/components/ui/`; feature-specific UI must be in the corresponding `systems/<domain>/`.
- **Legacy** `features/<domain>/` directories must be migrated to `systems/<domain>/` when modified.
- **Do NOT** add components, pages, hooks, queries, or mutations outside of `systems/` or `components/ui/`. Submissions violating this will be rejected in review.
- **MANDATORY**: Use the `hono-api-best-practices` skill before creating, modifying, or reviewing any HTTP endpoint. All backend endpoints must:
  - Use **standard REST HTTP methods**: `GET` for reads, `POST` for creation, `PATCH` for partial updates, `PUT` for full replacement only when justified, and `DELETE` for deletion/revocation/disconnection
  - Use plural `kebab-case` resource paths with path parameters for resource identity and query parameters for filtering, pagination, sorting, and cursor reads
  - Use JSON request bodies for `POST`, `PATCH`, and `PUT`
  - Define strict Zod contracts via `createRoute` and wire with `httpServer.openapi(...)`
  - Refer to the canonical REST rules in `hono-api-best-practices` skill and backend guidelines before proceeding
- **ALWAYS USE** the `drizzle-orm` skill before working with database code, including schema, queries, PostgreSQL-specific patterns, and migrations
- **ALWAYS USE** backend skill mappings for backend work: `drizzle-orm` (database, ORM patterns, and migration safety)
- **ALWAYS FOLLOW** shadcn filename pattern with kebab-case for all React-related files
- **Skipping any verification check will result in IMMEDIATE TASK REJECTION**

## Skills Enforcement

When working on this project, **always use the relevant skills** for the technology being touched:

### React & Frontend

- **Frontend design, UI/UX, and interface development**: Use `ui-ux-pro-max`, `frontend-design`, `interface-design`, `baseline-ui`, and `interaction-design` according to the surface being changed
- **React components/hooks/state**: Use `react` skill
- **Routing/navigation**: Use `tanstack-router` skills
- **Data fetching/caching/mutations**: Use `tanstack-query` skills
- **Data tables (grids, column APIs)**: Use `tanstack-table` skill
- **State management (Zustand)**: Use `zustand` skill
- **UI components (shadcn/ui, Radix)**: Use `shadcn` skill
- **Building new components**: Always use the `building-components` skill, and also use the `react-composition-patterns` skill when creating reusable components.
- **React performance patterns**: Use `react-best-practices` skill
- **Component composition/architecture**: Use `react-composition-patterns` skill
- **All frontend code (components, pages, hooks, queries, mutations) — MANDATORY**: Use `feature-systems-pattern` skill and place feature code under `systems/<domain>/`
- **Advanced TypeScript patterns**: Use `typescript-advanced` skill
- **Testing (Vitest)**: Use `vitest` + `testing-boss` skill

### Backend & Database

- **HTTP endpoints (all new, changed, or audited routes)**: You MUST use the `hono-api-best-practices` skill — strictly required for any endpoint work
- **Hono (routes, middleware, plugins)**: Use `hono` skill
- **Database/schema/queries**: Use `drizzle-orm` skill
- **Drizzle ORM patterns**: Use `drizzle-orm` skill
- **Drizzle migrations**: Use `drizzle-orm` skill
- **Validation (Zod schemas)**: Use `zod` skill
- **Logging (LogTape)**: Use `logtape` before adding, changing, or reviewing structured logging.
- **Object storage (AWS S3)**: Use `aws-s3` before working with `@aws-sdk/client-s3`, S3 object keys, streams, metadata, or presigned URLs.
- **External API adapters**: Use `external-api-adapters` for ERP adapters, third-party APIs, provider SDKs, retries, timeouts, and error normalization.
- **Data sync workflows**: Use `data-sync-workflows` for sync jobs, incremental imports, checkpoints, backfills, reconciliation, or scheduled ingestion.
- **Linear work tracking**: Use `linear` before reading, creating, updating, or commenting on Linear issues, projects, documents, initiatives, or evidence.
- **Paperclip orchestration**: Use `paperclip` before checking agent assignments, updating Paperclip tasks, posting orchestration status, or working inside Paperclip heartbeats.
- **Roundfix repair loop**: Use `roundfix` before resolving CodeRabbit PR review findings through Roundfix.
- **Utility functions and reusable helpers**: Use `typescript-advanced` for typed utility APIs and `coding-guidelines` for implementation discipline.
- **Payments (Stripe integration)**: Use `stripe-integration` + `stripe-api-selection` skills
- **Stripe subscriptions**: Use `stripe-subscriptions` skill
- **Stripe webhooks**: Use `stripe-webhooks` skill
- **Mastra framework (AI agents/workflows)**: Use `mastra` skill
- **Inngest (background jobs/workflows)**: Use `inngest` skill
- **Centrifugo (real-time messaging/WebSocket)**: Use `centrifugo` skill

### Design & UI/UX

- **Frontend design/styling**: Use `ui-ux-pro-max`, `frontend-design`, and `baseline-ui` skills
- **Figma (programmatic design, MCP)**: Use `figma-design` skill
- **Interface design (dashboards, admin panels)**: Use `ui-ux-pro-max` and `interface-design` skills
- **UI review/accessibility audit**: Use `web-design-guidelines`, `wcag-audit-patterns`, `fixing-accessibility`, and `baseline-ui` skills; add `fixing-metadata` for metadata/SEO issues and `fixing-motion-performance` for animation or transition issues.

### Process & Quality

- **Before any creative/feature work**: Use `brainstorming` skill
- **Discovery grill with docs**: Use `grill-with-docs` when shaping a feature, product decision, refactor, or architecture decision that should update `CONTEXT.md` or ADRs; it uses `grilling` with `domain-modeling`.
- **Discovery grill without docs**: Use `grill-me` for quick plan validation, productivity checks, or decision stress-tests that should not write domain docs.
- **Code generation and production code changes**: Use `coding-guidelines`, `clean-code`, and `solid` as baseline references before writing or modifying code. Then add the relevant domain skills for the stack being touched.
- **Executing implementation plans**: Use `executing-plans` skill
- **Debugging/fixing bugs**: Use `no-workarounds` + `systematic-debugging` skills (enforce root-cause fixes)
- **Writing/changing tests**: Use `testing-boss` (prevents mock-testing-mocks and production pollution)
- **Integration contract tests**: Use `integration-contract-testing` for external adapters, storage adapters, service contracts, fixtures, and schema-backed boundary tests.
- **Observability review**: Use `observability-audit` before delivery for backend workflows, sync jobs, external integrations, and production-sensitive changes.
- **Before claiming task is complete**: Use `evidence-gate` skill
- **Hard bugs / performance regressions**: Use `diagnose` (reproduce → minimise → hypothesise → instrument → fix) on top of `systematic-debugging`
- **PRDs, tech specs, ADRs, PR descriptions**: Use `tech-writer` skill; use `to-prd` to publish a PRD to the issue tracker
- **Breaking plans into issues / issue triage**: Use `to-issues` + `triage` skills (they drive the `.scratch/` issue tracker and triage labels)
- **Explaining work to non-technical stakeholders** (announcements, business cases, incident explainers): Use `business-storyteller` skill
- **Handing off a session to another agent**: Use `handoff` skill
- **GitHub PR preparation**: Use `github-pr-workflow` before opening, updating, or preparing a PR for review.
- **Code review / quality check**: Use `no-workarounds` plus the relevant domain skill. Use `refactoring-analysis` for structural review.
- **Architectural analysis/dead code**: Use `architectural-analysis` skill
- **Refactoring and restructuring code**: Use the `refactoring-analysis` skill
- **Git rebase/conflicts**: Use `git-rebase` skill
- **Browser automation**: Use `agent-browser` skill
- **AI SDK examples**: Use `ai-sdk` skill
- **Prompt generation for LLMs**: Use `to-prompt` skill
- **Discover/install skills**: Use `find-skills` skill

## Commands

```bash
# Bootstrap
make bootstrap            # Install deps, start docker, migrate + seed DB

# Quality & Testing (SaaS profile; run before committing)
make verify               # Full pipeline: fmt → lint-fix → typecheck → test
make test                 # Run all tests (Vitest via Turbo)
make test-frontend        # Run tests filtered to unified frontend
make test-backend         # Run tests filtered to backend

# Git & CI
make commit               # Run verify, stage all changes, then opencommit

# Dependencies & Cleanup
make reset                # Clean workspace (interactive) and optionally reinstall
make update               # Interactive dependency update (taze)

# Database
make db-reset             # Drop and recreate the local database (main + test)

# Agent Skills
make skills-link          # Recreate .claude/skills symlinks from .agents/skills
make skills-update        # Install missing skills and update existing to latest

# Shadcn
make shadcn               # Run shadcn generator inside frontend package

# Code Analysis
make knip                 # Run Knip analysis
make knip-full            # Run exhaustive Knip analysis
make knip-exports         # Run Knip export-focused analysis

# Help
make help                 # List all targets
```

## CRITICAL: Git Commands Restriction

- **ABSOLUTELY FORBIDDEN**: **NEVER** run `git restore`, `git checkout`, `git reset`, `git clean`, `git rm`, or any other git commands that modify or discard working directory changes **WITHOUT EXPLICIT USER PERMISSION**
- **DATA LOSS RISK**: These commands can **PERMANENTLY LOSE CODE CHANGES** and cannot be easily recovered
- **REQUIRED ACTION**: If you need to revert or discard changes, **YOU MUST ASK THE USER FIRST** and wait for explicit permission before executing any destructive git command
- **VIOLATION CONSEQUENCE**: Running destructive git commands without explicit permission will result in **IMMEDIATE TASK REJECTION** and potential **IRREVERSIBLE DATA LOSS**

## Code Search and Discovery

- **TOOL HIERARCHY**: Use tools in this order:
  1. **Grep** / **Glob** — preferred for local project code (exact string matching, file patterns)
  2. **Context7** — for external libraries and frameworks documentation (structured docs)
  3. **Exa** (`exa-web-search` skill) — for web research, latest news, code examples, and up-to-date information
- **WHEN TO USE Context7**: Only when you need to understand an external library's API or patterns and Grep/Glob cannot help. Use multiple times before implementing integrations.
- **WHEN TO USE Exa**: For broader web research, latest library versions, blog posts, tutorials, best practices, and any information beyond Context7's scope. Exa is available via the `exa-web-search` skill. **Always perform 3-7 searches** with different queries to get comprehensive results. Available tools:
  - `web_search_exa` — general web search for current info, news, facts
  - `get_code_context_exa` — find code examples and docs from GitHub, Stack Overflow
  - `company_research_exa` — research companies for business info and news
- **FORBIDDEN**: Never use Context7 or Exa for local project code — they cannot understand your local codebase.

## Design System

The project's visual design system is documented in [`DESIGN.md`](./DESIGN.md) at the root of the repository. It follows the [Google Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/overview/)

**MUST READ** `DESIGN.md` before creating or modifying any frontend component, page, or layout. All colors, typography, spacing, and component patterns must follow the design system.

## Architecture (overview)

**Tax POC** is a DDD monorepo orchestrated by Turborepo and managed with Bun. The backend is a Hono API with Drizzle and Inngest; the frontend is a React single-page application with local UI primitives and feature systems. The PoC ships **without authentication** — kept minimal for DX; add it deliberately when a protected surface lands.

```
packages/
├── backend/                            # Hono HTTP API + Drizzle + Inngest functions
└── frontend/                           # React 19 SPA + systems + local UI
```

Path alias: `@/*` → `./src/*` per package.

### Path Aliases

- `@/*` maps to `./src/*` in each package (tsconfig paths)

### Frontend (`packages/frontend`)

React 19 single-page application with **code-based** TanStack Router (`src/router.tsx`).

```
src/
├── systems/<domain>/    # Feature domains — mandatory home for all new feature code
│   ├── components/      #   Feature-specific UI (required)
│   ├── lib/             #   Domain-local utilities: queries, schemas, format (required)
│   ├── hooks/           #   React hooks (optional)
│   ├── adapters/        #   HTTP/storage gateways (optional)
│   ├── contexts/        #   React contexts (optional)
│   ├── stores/          #   Zustand stores (optional, framework-agnostic state)
│   ├── <surface>.css    #   Surface-scoped CSS at the system root, imported from index.ts
│   └── index.ts         #   Barrel export (required)
├── components/ui/       # shadcn-base primitives only (bunx shadcn@latest add ...)
├── icons/               # SVG icon components
├── lib/                 # Cross-cutting client utilities (shared across multiple systems)
├── test/                # Test helpers / setup
├── app.tsx              # Providers (QueryClient, Router, Toaster)
├── main.tsx             # createRoot entrypoint
├── router.tsx           # Code-based TanStack Router (createRoute / createRouter)
└── globals.css          # Tailwind v4 and project styles
```

### Backend (`packages/backend`)

Hono API server following **Clean Architecture**.

```
src/
├── domain/              # Domain layer — entities, value objects; zero infra deps
├── application/         # Use cases + ports
├── infra/               # Adapters, HTTP controllers, DB (Drizzle), Inngest runtime
├── __tests__/           # Backend tests
├── composition-root.ts  # Use case wiring
└── main.ts              # Server startup
```

### Data Flow

- **Client**: TanStack Query (server state) + Zustand (client state)
- **Server**: HTTP/Inngest adapter → application service/use case → domain model/ports → infra repository/adapter
- **Database**: PostgreSQL 18 via Drizzle ORM
- **Auth**: Better Auth

### Dependency Rules

- Keep the root `package.json` lean: monorepo-level tooling only.
- Runtime dependencies belong to the workspace that imports them.
- Do not rely on root-hoisted packages to satisfy workspace imports.
- When cleaning Bun/Node dependencies, re-run workspace-specific checks before `make verify`.

### TypeScript Layout

- Workspace `tsconfig.json` files are self-contained and are the source of truth for each app/package.
- Root `tsconfig.json` only covers repo-level tooling such as shared Vitest config.

### Testing Layout

- Integration tests: `tests/integration/` at workspace level.
- E2E tests: `tests/e2e/` at workspace level.
- Naming: `<source-file>.test.ts` or `<source-file>.spec.ts`.
- Use **AAA**: Arrange → Act → Assert.
- Assert observable behavior, not private implementation details.
- Do not add test-only production hooks, branches, or helper methods.
- Do not test mock behavior instead of system behavior.
- Reset shared state in `beforeEach` / `afterEach`.
- Flaky tests are blocking failures, not acceptable debt.

### Project Coding Style

- 2-space indent; semicolons; double quotes.
- Formatting via **Oxfmt**.
- Prefer named exports for components and utilities.
- **Singular directories**: feature modules (e.g., `dashboard/`).
- **Plural directories**: collections (e.g., `users/`, `products/`).

## Frontend Architecture Rules

### Design System

- All UI work **MUST** follow the design system documented in [`DESIGN.md`](./DESIGN.md)
- Colors **MUST** use CSS custom property tokens (`var(--primary)`, `var(--background)`, etc.) — never hardcoded hex values
- Typography **MUST** use `font-sans` (Geist) for all UI — headings and body — and `font-mono` (Geist Mono, plus the `.font-mono-numbers` utility for tabular numerals) for numbers, metrics, currency, table cells, and code. `font-serif` (Lora) is editorial-only; never UI chrome.
- Spacing **MUST** snap to the design token scale (Tailwind v4 derives the full ramp from `--spacing: 0.26rem` — see DESIGN.md §3.6). Use `p-1` … `p-16`, `gap-*`, `m-*`; no magic numbers.
- Component variants **MUST** use CVA (class-variance-authority) + `cn()` utility
- **Type scale**: pick from the seven-step ramp in DESIGN.md §3.5 (Display / H1 / H2 / H3 / Body / Body large / Label-meta). Never one-off `text-[13px]`.
- **Multi-product scoping**: Visio / Tax / Factory accents live in `--visio` / `--tax` / `--factory`. Inside a `[data-product]` shell use `bg-product` / `bg-product-surface` / `text-product-foreground` — they resolve to nothing outside that scope. See DESIGN.md §3.3 + §7.
- **Dark mode contract**: tokens flip via `<html class="dark">` (forced), `<html class="light">` (forced), or no class (follows OS). Components MUST work in both modes without rewriting classes — let tokens flip. See DESIGN.md §3.1 + §6.
- **Focus is mandatory**: universal `focus-visible:ring-ring/50 focus-visible:ring-[3px]` on every interactive element; destructive variant swaps to `ring-destructive/{20|40}`. See DESIGN.md §3.8 + §6.
- **Accessibility floor (WCAG 2.2 AA)** is a blocker, not a target — contrast, keyboard, target size, semantics, reduced motion. See DESIGN.md §3.8.
- **Don'ts**: before completing any UI change, scan DESIGN.md §13 (Don'ts). Hits are blockers, not nits.

### Principles

- UI components **MUST** be pure and presentational; orchestration **MUST** live in pages/routes.
- State management **MUST** be testable without UI coupling (stores must not depend on React).
- HTTP access **MUST** be isolated behind service boundaries to enable fakes in tests.

### Separation of Concerns

- Routes/pages **MUST** orchestrate business logic and data fetching.
- Components **MUST** be pure UI (no store or gateway access).
- Stores **MUST** be framework-agnostic and testable without React.
- Components **MUST NOT** import from stores/ or gateways/ directly.

### Data Fetching

- Use TanStack Query as the single server-state mechanism.
- Server state **MUST NOT** be duplicated into client state unless clearly justified.
- Background refetching, caching, and invalidation **MUST** be centralized in TanStack Query.

### Routing

- TanStack Router in **code-based** mode: routes declared in `src/router.tsx` via `createRoute({ getParentRoute, path, component })`, assembled with `rootRoute.addChildren([...])`. **No file-based routing, no `routeTree.gen.ts`.**
- Each route's `component` points at a system's exported page.
- Primary data fetching **SHOULD** occur at the route/page level via TanStack Query (`queryOptions` co-located in `systems/<domain>/lib/queries.ts`).
- New routes are added to `router.tsx` in one edit; don't introduce a parallel routing mechanism.

### Key Patterns

- **File naming**: kebab-case for components (`.tsx`), hooks (`use-*.ts`), utilities (`.ts`)
- **Exports**: Prefer named exports for components and utils
- **Styling**: Tailwind CSS v4 with design tokens; **class-variance-authority (CVA) + `cn()`** for component variants (matches the Design System rule above; `tailwind-variants` is NOT installed)
- **Icons**: lucide-react
- **Notifications**: sonner
- **Forms**: TanStack Form + Zod validation

### React Component Rules

**Critical rules agents must follow:**

1. **Functional components only** — no class components, no `React.FC` (type props directly on the function)
2. **Separation of concerns** — extract behavior logic into custom hooks, components render UI only
3. **State hierarchy** — local state (`useState`/`useReducer`) > Zustand > TanStack Query > URL state
4. **useEffect is an escape hatch** — only for external system sync; never for derived state, event responses, or parent notification
5. **TypeScript** — use `React.ComponentProps<"element">` to extend HTML elements, `const` type params for generics
6. **Handle all states** — always handle loading, error, and empty states (never assume `data` exists)
7. **Performance** — avoid barrel imports, use `useMemo` for expensive computations, `useCallback` for stable refs, `lazy()` for code splitting
8. **Composition over booleans** — use compound components instead of boolean prop proliferation
9. **React 19+** — use `use()` hook, Actions, `useOptimistic()`, `useFormStatus()`; no `forwardRef` (pass ref as prop)

**useEffect anti-patterns:**

| DON'T                                       | DO Instead                               |
| ------------------------------------------- | ---------------------------------------- |
| `useState` + `useEffect` for derived values | Calculate during render                  |
| `useEffect` to cache expensive calculations | `useMemo`                                |
| `useEffect` to reset state on prop change   | `key` prop                               |
| `useEffect` watching state for user events  | Event handler directly                   |
| `useEffect` calling parent `onChange`       | Call in event handler                    |
| `useEffect` chains triggering each other    | Calculate all state in the event handler |

**Enforcement:** Violating these standards results in immediate task rejection.

## Backend Architecture Rules

- Keep backend code inside `domain/`, `application/`, or `infra/`; **do not add `src/modules` or `src/services`**
- Follow the **1 Hono instance = 1 controller** principle
- Keep route handlers thin -- delegate to usecases
- Usecases contain pure business logic (no HTTP context)
- Repositories handle all database operations via Drizzle
- Use Zod validation at API boundaries
- Use package scripts for migrations (`bun run db:generate`, `bun run db:migrate`)
- Never edit files in the `drizzle/` folder (auto-generated)

## Coding Style & Naming Conventions

- **TypeScript**: React 19, Tailwind 4; 2-space indent; semicolons; double quotes. Lint with Oxlint, format with Oxfmt (printWidth: 100)
- File names: components `kebab-case.tsx`; hooks `use-kebab-case.ts`; utilities `kebab-case.ts`; types in `types.ts`
- Exports: prefer named exports for components and utils

## Commit & Pull Request Guidelines

- Use `conventional-commits` before staging, committing, writing a commit message, or preparing a PR title.
- Commits and PR titles must follow Conventional Commits and pass `cog verify "$PR_TITLE"` for PR titles.
- Use Conventional Commits format: `type(scope): imperative subject`.
- Before opening a PR: run the active profile's verification command.
- PRs should include: clear description, linked task/issue, explanation of architectural decisions, and screenshots/GIFs for UI changes
- Do not rewrite unrelated files or reformat the whole repo — limit diffs to your change

## Security & Configuration

- Environment files: keep secrets in `.env` (never commit). Mirror keys in `.env.example`
- Do not introduce unnecessary dependencies — audit every new package addition
- Avoid introducing new global styles; scope styles via components and Tailwind utilities

## Agent Skill Dispatch Protocol

Every agent MUST follow this protocol before writing code.

### Step 1: Identify Task Domain

Scan task and target files for these keywords:

- **Backend / Hono**: route, handler, API, usecase, repository, module, Hono, middleware, plugin
- **Backend DB**: drizzle, postgres, migration, index, transaction, schema, repository
- **Validation / Zod**: zod, z.object, z.string, safeParse, z.infer, transform, refine, coerce
- **Backend Payments**: stripe, subscription, webhook, billing, payment
- **Frontend**: component, hook, JSX, TSX, render, state, props, UI, layout, page, form
- **Frontend Design**: UI design, UX, design system, visual fidelity, palette, typography, responsive
- **UI Review/A11y**: accessibility, WCAG, metadata, SEO, motion performance, animation jank, reduced motion, aria, keyboard navigation
- **State**: store, state management, zustand, selector
- **Routing**: route, navigation, loader, TanStack Router, file-based routing
- **Data Fetching**: query, mutation, TanStack Query, cache, invalidation, refetch
- **Inngest**: inngest, background job, event-driven, durable execution, step function, serverless function
- **Logging / Observability**: log, logger, LogTape, correlation ID, request ID, run ID, metrics, tracing, redaction
- **Object Storage / S3**: S3, bucket, object key, presigned URL, PutObject, GetObject, @aws-sdk/client-s3
- **External API Adapter**: adapter, ERP, provider, external API, retry, timeout, rate limit, pagination, request ID
- **Data Sync**: sync, import, backfill, checkpoint, cursor, reconciliation, idempotency, schedule
- **Lint / Format**: oxlint, oxfmt, lint, formatter, warnings as errors, max warnings
- **Testing**: test, spec, mock, stub, fixture, assertion, coverage, vitest
- **Debugging**: bug, fix, error, failure, crash, unexpected, broken, regression
- **Specs/Planning**: spec, PRD, gap analysis, architecture, technical design, ADR
- **Issues/Triage**: issue, ticket, backlog, triage, bug report, feature request
- **Business communication**: announcement, business case, stakeholder update, non-technical explainer, incident explainer
- **Architecture audit**: dead code, code smell, anti-pattern, duplication
- **Interface/App design**: dashboard, admin panel, app interface, interactive product, tool interface
- **Code cleanup**: dead code removal, optimize structure
- **README/Docs**: readme, documentation writing
- **TypeScript advanced**: generics, conditional types, mapped types, template literals, utility types, branded types
- **Vitest**: vitest, test runner, describe, it, expect, beforeEach, afterEach
- **Browser automation**: headless browser, web interaction, navigate, screenshot
- **Code analysis**: code review, refactor, trace, debug analysis
- **Linear / Agent workflow**: Linear, issue, project, initiative, evidence, Paperclip, heartbeat, CodeRabbit, Roundfix, PR review

### Step 2: Activate All Matching Skills

| Domain                    | Required Skills                                                                             | Conditional Skills                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Backend + Hono            | `hono-api-best-practices` + `hono` + `drizzle-orm`                                          | + `zod`                                                                                             |
| HTTP endpoint design      | `hono-api-best-practices`                                                                   | + `hono` + `zod` (always together)                                                                  |
| Validation / Zod          | `zod`                                                                                       |                                                                                                     |
| Logging / LogTape         | `logtape`                                                                                   | + `observability-audit` for production-sensitive paths                                              |
| AWS S3 object storage     | `aws-s3`                                                                                    | + `external-api-adapters` when wrapped behind a storage port                                        |
| External API adapters     | `external-api-adapters`                                                                     | + `integration-contract-testing` for adapter tests, `observability-audit` before delivery           |
| Data sync workflows       | `data-sync-workflows`                                                                       | + `external-api-adapters`, `logtape`, `integration-contract-testing`, `observability-audit`         |
| Linear work tracking      | `linear`                                                                                    | + `to-prd` / `to-issues` when creating product or backlog artifacts                                 |
| Paperclip orchestration   | `paperclip`                                                                                 | + `paperclip-create-agent` when hiring/configuring agents                                           |
| GitHub PR workflow        | `github-pr-workflow`                                                                        | + `conventional-commits`, `evidence-gate`                                                           |
| Roundfix repair loop      | `roundfix`                                                                                  | + `github-pr-workflow`, `evidence-gate`                                                             |
| Payments / Stripe         | `stripe-integration` + `stripe-api-selection`                                               | + `stripe-subscriptions` (subscriptions) + `stripe-webhooks` (webhooks)                             |
| Frontend                  | `feature-systems-pattern` + read `DESIGN.md` + `react` + `baseline-ui`                      | + `ui-ux-pro-max` / `frontend-design` / `interface-design` (UI), `shadcn` + `tailwindcss` (styling) |
| TanStack Query            | `tanstack-query`                                                                            |                                                                                                     |
| TanStack Router           | `tanstack-router`                                                                           |                                                                                                     |
| TanStack Table            | `tanstack-table` + `react`                                                                  |                                                                                                     |
| Figma (programmatic)      | `figma-design`                                                                              |                                                                                                     |
| Frontend + Design         | `ui-ux-pro-max` + `frontend-design` + `interface-design` + `baseline-ui` + read `DESIGN.md` | + `interaction-design` (motion) + `shadcn`                                                          |
| UI audit / accessibility  | `web-design-guidelines` + `wcag-audit-patterns` + `fixing-accessibility` + `baseline-ui`    | + `fixing-metadata` (metadata/SEO) + `fixing-motion-performance` (animation/motion)                 |
| React performance         | `react-best-practices`                                                                      | + `react-composition-patterns` (composition) + `react` (fundamentals)                               |
| State + Zustand           | `zustand`                                                                                   |                                                                                                     |
| AI/LLM features           | `ai-sdk`                                                                                    | + `mastra` (if agent integration)                                                                   |
| Inngest                   | `inngest`                                                                                   |                                                                                                     |
| Code generation           | `coding-guidelines` + `clean-code` + `solid`                                                | + relevant domain skill for the technology being touched                                            |
| Utilities / type helpers  | `typescript-advanced`                                                                       | + `coding-guidelines`                                                                               |
| Integration tests         | `integration-contract-testing` + `testing-boss`                                             | + domain skill for the boundary being tested                                                        |
| Lint / format             | `oxlint-oxfmt`                                                                              |                                                                                                     |
| Observability review      | `observability-audit`                                                                       | + `logtape` when logging is implemented with LogTape                                                |
| Discovery grill with docs | `grill-with-docs`                                                                           | + `domain-modeling` when terms, `CONTEXT.md`, or ADRs need updates                                  |
| Discovery grill only      | `grill-me`                                                                                  | + `grilling` for quick validation without documentation                                             |
| Bug fix                   | `systematic-debugging` + `no-workarounds`                                                   | + `diagnose` (hard bugs/perf regressions) + `testing-boss` (test failures)                          |
| Workaround prevention     | `no-workarounds`                                                                            | + `systematic-debugging` (root cause) + `testing-boss`                                              |
| Writing tests             | `testing-boss`                                                                              | + domain skill for code being tested                                                                |
| Task completion           | `evidence-gate`                                                                             |                                                                                                     |
| External lib research     | `context7` + `exa-web-search` (3-7 searches)                                                |                                                                                                     |
| Architecture audit        | `architectural-analysis`                                                                    |                                                                                                     |
| Refactoring tasks         | `refactoring-analysis`                                                                      |                                                                                                     |
| Interface/App design      | `ui-ux-pro-max` + `interface-design` + `frontend-design`                                    | + `baseline-ui` for implementation quality                                                          |
| Creative/new features     | `brainstorming`                                                                             | + domain-specific skills                                                                            |
| Plan execution            | `executing-plans`                                                                           |                                                                                                     |
| Git rebase/conflicts      | `git-rebase`                                                                                |                                                                                                     |
| README writing            | `tech-writer` + `crafting-effective-readmes` + `writing-clearly-and-concisely`              |                                                                                                     |
| Specs / PRDs / ADRs       | `tech-writer`                                                                               | + `to-prd` (publish PRD to the issue tracker)                                                       |
| Issue breakdown / triage  | `to-issues` + `triage`                                                                      |                                                                                                     |
| Business-facing docs      | `business-storyteller`                                                                      |                                                                                                     |
| Session handoff           | `handoff`                                                                                   |                                                                                                     |
| Creating skills           | `skill-best-practices`                                                                      |                                                                                                     |
| TypeScript advanced       | `typescript-advanced`                                                                       |                                                                                                     |
| Vitest testing            | `vitest` + `testing-boss`                                                                   |                                                                                                     |
| Browser automation        | `agent-browser`                                                                             |                                                                                                     |
| Prompt generation         | `to-prompt`                                                                                 |                                                                                                     |
| Discover skills           | `find-skills`                                                                               |                                                                                                     |

### Step 3: Verify Before Completion

1. Activate `evidence-gate`
2. Run the active profile's verification command
3. Read full output — no skipping
4. Only then claim completion

## Anti-Patterns (immediate rejection)

1. **Skipping skill activation** — every domain change requires its skill, no matter how small
2. **Activating only one skill** when code touches multiple domains (e.g., a React component using TanStack Query needs `react` + `tanstack-query`)
3. **Forgetting `evidence-gate`** before marking tasks done
4. **Writing tests without `testing-boss`** — leads to mock-testing-mocks and production code pollution
5. **Fixing bugs without `systematic-debugging`** — leads to symptom-patching instead of root-cause fixes
6. **Workarounds without `no-workarounds`** — type assertions, lint suppressions, error swallowing, timing hacks, monkey patches all rejected without root-cause justification
7. **Claiming done with any warning, error, or test failure** — zero tolerance
8. **Hand-installing Bun/Node dependencies** — always use `bun add` after verifying package and version
9. **Using Context7 or Exa for local code** — they're for external library docs and web research only
10. **Running 1 Exa search instead of 3-7** with varied queries
11. **Destructive git commands without explicit user approval** — `git restore`, `git reset`, `git clean`, etc.
12. **Writing UI without reading `DESIGN.md`** — hardcoded colors, wrong fonts, arbitrary spacing, inconsistent patterns are rejected
13. **Frontend domain code outside `systems/<domain>/`** — the `feature-systems-pattern` layout is mandatory; API calls in components, scattered query keys, and skipped `queryOptions` co-location are rejected
14. **Extending legacy `features/<domain>/` directories** — when touching a legacy feature, migrate it to `systems/<domain>/` first
15. **HTTP endpoint changes without `hono-api-best-practices`** — standard REST resource paths, correct HTTP methods, strict Zod contracts, and `createRoute` registration are mandatory. Inline `app.get(...)`/`app.post(...)`/etc. handlers that bypass OpenAPI registration are immediate rejection
16. **Shipping syncs or external integrations without observability and contract tests** — adapters, scheduled imports, backfills, S3 storage, and ERP/provider syncs require visible evidence and boundary tests
