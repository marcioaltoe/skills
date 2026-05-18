# Feature System Contracts

Use this reference when a frontend is organized around `systems/<domain>/` modules or the user asks about feature systems, domain systems, system boundaries, or whether a frontend area follows the project's system pattern.

This distills `../feature-systems-pattern/SKILL.md` and its references into documentation checks. Do not generate code from this reference; use it to document observed structure, gaps, and recommendations.

## Canonical Structure

Expected shape:

```text
systems/<domain>/
├── index.ts
├── types.ts
├── adapters/
│   └── <domain>-api.ts
├── lib/
│   ├── query-keys.ts
│   ├── query-options.ts
│   ├── <domain>-schemas.ts
│   └── constants.ts
├── hooks/
│   ├── use-<action>.ts
│   ├── use-create-<entity>.ts
│   ├── use-update-<entity>.ts
│   ├── use-delete-<entity>.ts
│   └── use-<domain>-view-model.ts
├── contexts/
│   └── <domain>-context.tsx
├── stores/
│   └── <domain>-store.ts
├── components/
│   ├── <component-name>.tsx
│   ├── stories/
│   └── index.ts
└── guards/
    └── <guard-name>.ts
```

Optional folders are valid only when there is a real need:

- `contexts/`: shared query data or combined state across a subtree.
- `stores/`: complex async state machines, polling, multi-step flows, or emitted events.
- `guards/`: route-level or access-control logic.

## Dependency Flow

Expected dependency direction:

```text
adapters -> lib -> hooks -> components
routes -> systems public barrel
components -> hooks/primitives, not adapters directly
```

Document violations when:

- An adapter imports from hooks, components, routes, stores, or contexts.
- A component imports another system's internals instead of its public barrel.
- Routes duplicate API calls, query keys, schemas, or mutation behavior that belongs in the system.
- Shared utilities live inside one system while being used by multiple systems.

## Public API Barrel

Every system should have `index.ts` with explicit named exports grouped by role. Prefer:

- Types
- Query hooks
- Mutation hooks
- Components
- Utilities
- Query keys and query options
- API adapter and typed API error

Flag `export * from` when local rules expect explicit named exports.

## API Adapter Contract

For `adapters/<domain>-api.ts`, check:

- Exports one namespace object such as `<domain>Api`.
- Exports a typed error class such as `<Domain>ApiError`.
- Keeps response normalization and error extraction helpers private.
- Accepts `signal?: AbortSignal` on read operations and any cancellable operation.
- Throws typed errors rather than raw response objects or message strings.
- Normalizes backend response shapes into clean domain types before they reach hooks/components.

## Query Contract

For `lib/query-keys.ts`, check:

- Keys are hierarchical and use `as const`.
- Keys include user, org, tenant, filter, search, pagination, or route params needed to isolate cache entries.
- List/detail levels support broad and narrow invalidation.

For `lib/query-options.ts`, check:

- `queryOptions` factories co-locate `queryKey` and `queryFn`.
- Factories are reused by route loaders, hooks, prefetching, and cache reads.
- Query functions pass `signal` from the query context to the adapter.
- Dependent queries use `enabled`, not conditional hook calls.

For mutations, check:

- Mutations invalidate relevant keys after success or settlement.
- Optimistic cache updates cancel outgoing queries first, snapshot previous data, rollback on error, and invalidate on settlement.
- UI-only optimistic updates use mutation `variables`/pending state instead of unnecessary cache writes.

## Hooks, Contexts, Stores, and Components

Check:

- Query hooks wrap query option factories and expose a stable, typed interface.
- View-model hooks compose hooks for route/page shells and return a flat object.
- Contexts are nullable at creation and consumer hooks throw if used outside the provider.
- Performance-sensitive contexts are split into focused values.
- Stores are reserved for complex client workflows, not duplicated server state.
- Components render UI and state, while adapters, query keys, schemas, and mutation orchestration stay in system layers.
- Component stories/tests cover states that documentation claims are supported.

## Documentation Output

When writing a selected document for a feature system, include:

- A system map table listing folders, responsibilities, and evidence.
- A dependency-flow summary with any boundary violations.
- A route/data ownership table linking routes to system query options, hooks, adapters, schemas, and guards.
- A cache-scope table for keys, parameters, invalidation, and optimistic updates.
- A public API table showing what the system exports and what should remain private.
- A gap list with the smallest useful next action for each violation.

Do not require every optional folder. Missing optional folders are only gaps when the code has the responsibility but no clear home.
