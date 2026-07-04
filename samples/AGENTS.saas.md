# General Agent Instructions

Template for Bun/TypeScript SaaS repos, especially monorepos with a React
frontend, a Hono API, Drizzle, Zod, TanStack, Tailwind, and product/domain work.
Keep this root file small. Put package-specific backend or frontend rules in
package-level `AGENTS.md` files.

## High priority

- Use the relevant local skills before changing code, docs, tests, workflows,
  or agent instructions.
- Prefix shell commands with `rtk` when it is available. In command chains,
  prefix each command.
- Use `rg` / `rg --files` for local code search. Use Context7 for external
  library/API docs and Exa for broader web/source research. Do not use web
  research tools to search local code.
- Run the repo's full verification gate before claiming completion. Treat any
  lint warning, type error, test failure, or format failure as blocking.
- Do not use workarounds in production code or tests. Fix the root cause.
- Do not run destructive git commands such as `git reset`, `git checkout --`,
  `git restore`, `git clean`, or forced deletion commands unless the user
  explicitly asks for that operation.
- Agent-created branches must use the `ma/` prefix unless the repo documents a
  different human-owned prefix.

## Language policy

- Write code, comments, identifiers, migrations, API contracts, and structured
  data in English.
- Write domain documentation and domain discussion in the language established
  by the project's `CONTEXT.md`. For Brazilian fiscal/product domains, use
  pt-BR domain vocabulary from `CONTEXT.md`.

## Agent docs

Read these only when relevant to the task:

- `docs/specs/<feature-slug>/` — spec artifacts (`_idea.md`, `_prd.md`,
  `_techspec.md`, `_tasks.md`, `task_NN.md`, `qa/`); shipped specs move to
  `docs/specs/_archived/`. Run `setup-workflow` once if the layout is missing.
- `docs/agents/issue-tracker.md` — optional tracker mirror for spec tasks
  (local `docs/specs/` files remain canonical)
- `docs/agents/triage-labels.md` — label mapping for issue triage skills
- `docs/agents/domain.md` — how agents consume `CONTEXT.md` and ADRs
- `CONTEXT.md` — single-context domain vocabulary, if the repo uses one
- `CONTEXT-MAP.md` — multi-context index, if domain vocabulary is co-located
  with bounded contexts
- `docs/adr/` — architectural decisions; flag conflicts before overriding them

When writing issue titles, test names, refactor proposals, API names, or user
answers, use the canonical vocabulary from the relevant context docs. If the
right term is missing, call out the gap instead of inventing new language.

## Repository shape

- Root `AGENTS.md` holds shared behavior: skills, verification, git safety,
  language policy, and domain-doc routing.
- Package-level `AGENTS.md` files hold stack-specific rules for packages such
  as `packages/backend` or `packages/frontend`.
- Backend-specific architecture details belong in the backend package
  `AGENTS.md`, not in the root file.
- Domain vocabulary belongs in `CONTEXT.md` or co-located context docs, not in
  `AGENTS.md`.
- Long architecture walkthroughs belong in focused docs such as
  `docs/agents/architecture.md`, with the root file linking to them.

## Skill dispatch

Before editing, identify the task domain and load every matching skill.

### Core workflow

- Feature discovery or product idea: `brainstorming`; product-level ideas go
  through `write-idea` (scored by `business-analyst`, debated by `council`,
  challenged by `the-fool`)
- PRD, tech spec, or task breakdown: `write-prd`, `write-techspec`,
  `write-tasks`
- Execute spec tasks: `implement-task` (one task), `implement-spec` (the whole
  graph in dependency order)
- Final QA of a completed spec: `qa-gate`; archive after release: `archive-spec`
- Implementation: `coding-guidelines`
- Bug fix or failing test: `no-workarounds` plus `systematic-debugging`
- Tests: `testing-boss` plus the domain skill for the code under test
- Docs, PRDs, ADRs, issues, PR descriptions: `tech-writer`
- Commits or PR titles: `conventional-commits`
- Completion claim: `evidence-gate`

### Frontend

- React components, hooks, state, JSX/TSX: `react`
- Feature code layout: `feature-systems-pattern`
- Routing: `tanstack-router`
- Server state, mutations, invalidation: `tanstack-query`
- Tables: `tanstack-table`
- shadcn/Radix primitives: `shadcn`
- Tailwind or styling: `tailwindcss`
- UI/UX or interface work: frontend design/interface skills plus `DESIGN.md`

Read `DESIGN.md` before UI work if the repo has one. Do not hardcode colors,
spacing, type scales, or interaction patterns when design tokens or component
rules exist.

### Backend

- Hono routes, middleware, plugins: `hono`
- HTTP endpoint design or review: `hono-api-best-practices`
- Zod schemas/contracts: `zod`
- Drizzle schema, queries, repositories, migrations: `drizzle-orm` and the
  repo's database/migration safety skills
- External providers, retries, timeouts, adapters: external API adapter and
  integration contract testing skills
- Logging/production-sensitive workflows: observability/logging skills

For backend packages, keep handlers thin. Business logic belongs in
application/use-case code, database access belongs in repositories/adapters,
and domain code must stay free of HTTP, database, and provider SDK concerns.
Follow the endpoint style documented by the backend package. Do not override a
repo-specific REST or POST-only action API policy from the root instructions.

## Verification

Use the repo's declared verification command when present, commonly
`make verify`. If no aggregate command exists, run the relevant package-level
format, lint, typecheck, and test scripts before completion.

For Bun/TypeScript projects:

- Lint warnings are failures.
- Type errors are failures.
- Flaky tests are failures.
- Test-only branches, production hooks, timing hacks, broad mocks, and lint/type
  suppressions need root-cause justification; otherwise reject them.

## Git and delivery

- Check `git status --short` before staging.
- Keep unrelated user changes out of your diff.
- Use Conventional Commits for commits and PR titles.
- Do not rewrite unrelated files or format the whole repo unless asked.
- PR bodies should summarize changes, call out risk, and list validation
  commands run.
