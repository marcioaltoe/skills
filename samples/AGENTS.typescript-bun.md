# General Agent Instructions

Template for Bun/TypeScript product repos, especially monorepos with React,
Hono, Drizzle, Zod, TanStack, Tailwind, and product discovery work.

## High priority

- Use the relevant local skills before changing code, docs, tests, workflows,
  or agent instructions.
- Prefix shell commands with `rtk` when it is available. In command chains,
  prefix each command.
- Use `rg` / `rg --files` for local code search. Use `context7` for external
  library/API docs, `exa-web-search` for deep research, and `firecrawl` for
  scraping or extracting content from external websites. Do not use web
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
  by the project's `CONTEXT.md`.
- Use canonical domain terms from `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/`.
  If a needed term is missing, call out the gap instead of inventing one.

## Project profile

- Install setup: `typescript-bun`
- Primary workflow: `brainstorming`/`grill-with-docs` -> `write-idea` (product-level
  ideas only) -> `write-prd` -> `write-techspec` -> `write-tasks` ->
  `implement-spec`/`implement-task` -> `qa-gate` -> `review` -> `evidence-gate`
  -> `archive-spec` after release
- Spec artifacts live under `docs/specs/<feature-slug>/` (`_idea.md`, `_prd.md`,
  `_techspec.md`, `_tasks.md`, `task_NN.md`, `qa/`); shipped specs move to
  `docs/specs/_archived/`. Run `setup-workflow` once if the layout is missing.
- Verification: run the repo's full verification command, usually `make verify`.
  If no aggregate command exists, run the relevant package-level format, lint,
  typecheck, and test commands.

## Agent docs

Read these only when relevant to the task:

- `docs/agents/issue-tracker.md` — optional tracker mirror for spec tasks
  (local `docs/specs/` files remain canonical)
- `docs/agents/triage-labels.md` — label mapping for `triage`
- `docs/agents/domain.md` — how agents consume `CONTEXT.md` and ADRs
- `CONTEXT.md` — single-context domain vocabulary, if the repo uses one
- `CONTEXT-MAP.md` — multi-context index, if bounded contexts are co-located
- `docs/adr/` — architectural decisions; flag conflicts before overriding them

## Skill dispatch

Before editing, identify the task domain and load every matching skill.

### Core workflow

| Task                         | Use skills                                                             |
| ---------------------------- | ---------------------------------------------------------------------- |
| Clarify requirements         | `brainstorming`, `grill-with-docs`, `grilling`, `domain-modeling`      |
| PRD                          | `write-prd`, `tech-writer`, `writing-clearly-and-concisely`            |
| Tech spec                    | `write-techspec`, `tech-writer`                                        |
| Task breakdown or triage     | `write-tasks`, `triage`                                                |
| Execute one spec task        | `implement-task`, `coding-guidelines`, `clean-code`                    |
| Execute a whole spec         | `implement-spec`                                                       |
| Final QA of a completed spec | `qa-gate`                                                              |
| Bug fix or failing test      | `systematic-debugging`, `no-workarounds`, `testing-boss`               |
| Code review                  | `review`, `no-workarounds`, plus the domain skill for the touched code |
| Commit, PR, or delivery note | `conventional-commits`, `github-pr-workflow`, `evidence-gate`          |
| Archive a shipped spec       | `archive-spec`                                                         |
| Handoff                      | `handoff`                                                              |

### Discovery, strategy, and critique

| Task                                            | Use skills               |
| ----------------------------------------------- | ------------------------ |
| Creative feature or behavior change             | `brainstorming`          |
| Expand a product idea into `_idea.md`           | `write-idea`             |
| Score a feature idea or structure a decision    | `business-analyst`       |
| Quantitative decision support, KPIs, forecasts  | `business-analyst`       |
| High-impact architecture or product trade-off   | `council`                |
| Challenge a plan, run a pre-mortem, find gaps   | `the-fool`               |
| 10x product opportunities or product strategy   | `game-changing-features` |
| Deep research or competitive/source sweep       | `exa-web-search`         |
| Scrape, crawl, fetch, or extract external pages | `firecrawl`              |
| Prepare context for another LLM                 | `to-prompt`              |

Use `the-fool` to challenge a plan, not to decide it. Use `council` when a
decision has multiple viable options and needs a synthesis with preserved
dissent.

### Frontend

| Task                                | Use skills                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| React components, hooks, state      | `react`                                                                            |
| Feature code under `systems/`       | `feature-systems-pattern`                                                          |
| Routing                             | `tanstack-router`                                                                  |
| Server state, mutations, cache      | `tanstack-query`                                                                   |
| Tables                              | `tanstack-table`, `react`                                                          |
| State management                    | `zustand`                                                                          |
| shadcn/Radix primitives             | `shadcn`                                                                           |
| Tailwind or styling                 | `tailwindcss`, `baseline-ui`                                                       |
| UI/UX or interface work             | `ui-ux-pro-max`, `frontend-design`, `interface-design`, `baseline-ui`, `DESIGN.md` |
| Motion or interaction changes       | `interaction-design`, `motion`                                                     |
| Accessibility, metadata, web design | `wcag-audit-patterns`, `web-design-guidelines`, `fixing-accessibility`             |
| Performance and vitals              | `core-web-vitals`, `react-best-practices`                                          |

Read `DESIGN.md` before UI work if the repo has one. Do not hardcode colors,
spacing, type scales, or interaction patterns when tokens or component rules
exist.

New frontend feature code belongs under `packages/frontend/src/systems/<domain>/`
when that layout exists. Keep shared shadcn-base primitives in
`packages/frontend/src/components/ui/`.

## Backend

| Task                                | Use skills                                              |
| ----------------------------------- | ------------------------------------------------------- |
| Hono routes, middleware, plugins    | `hono`                                                  |
| HTTP endpoint design or review      | `hono-api-best-practices`, `hono`, `zod`                |
| Zod schemas/contracts               | `zod`                                                   |
| Drizzle schema, queries, migrations | `drizzle-orm`                                           |
| Auth                                | `better-auth`                                           |
| External providers and adapters     | `external-api-adapters`, `integration-contract-testing` |
| S3 object storage                   | `aws-s3`                                                |
| Logging                             | `logtape`                                               |
| Email templates                     | `react-email`                                           |
| Forms                               | `react-hook-form-zod`                                   |

For backend packages, keep handlers thin. Business logic belongs in
application/use-case code, database access belongs in repositories/adapters,
and domain code must stay free of HTTP, database, and provider SDK concerns.

## Quality, QA, and refactoring

| Task                               | Use skills                                                              |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Tests                              | `testing-boss`, `vitest`, plus the domain skill for the code under test |
| Lint or format issues              | `oxlint-oxfmt`                                                          |
| Real-user QA planning              | `qa-report`                                                             |
| Real-user QA execution             | `qa-execution`, `agent-browser`                                         |
| Refactoring audit                  | `refactoring-analysis`                                                  |
| Architecture/dead-code audit       | `architectural-analysis`                                                |
| Accessibility and UX repair        | `fixing-accessibility`, `fixing-metadata`, `fixing-motion-performance`  |
| CodeRabbit/Roundfix review cleanup | `roundfix`                                                              |

Use `qa-report` before execution when personas, journeys, charters, or test
cases need to be planned. Use `qa-execution` when validating a release
candidate, migration, refactor, or user-facing change through public interfaces.

## Writing and communication

| Task                                    | Use skills                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Technical docs, README, PRD, ADR, issue | `tech-writer`, `crafting-effective-readmes`, `writing-clearly-and-concisely` |
| Make text sound human                   | `humanizer`                                                                  |
| Non-technical stakeholder communication | `business-storyteller`                                                       |

Use `business-storyteller` for internal announcements, approval proposals,
incident explainers, technical-debt cases, product explainers, or executive
summaries. Do not use it for READMEs, specs, ADRs, or customer-facing sales
copy.

## Verification

- Use the repo's declared verification command when present, commonly
  `make verify`.
- For Bun/TypeScript projects, lint warnings are failures, type errors are
  failures, and flaky tests are failures.
- If no aggregate command exists, run the relevant package-level format, lint,
  typecheck, and test scripts before completion.
- Use `evidence-gate` before claiming work is complete, fixed, passing,
  committed, pushed, PR-ready, or ready for handoff.

## Git and delivery

- Check `git status --short` before staging.
- Keep unrelated user changes out of your diff.
- Use `conventional-commits` for commits and PR titles.
- Do not rewrite unrelated files or format the whole repo unless asked.
- PR bodies should summarize changes, call out risk, and list validation
  commands run.
