# Framework Contract Notes

Use this reference only when the selected document involves React, TanStack Router, TanStack Query, Zustand, Storybook, shadcn/Radix, Tailwind, design-system tokens, accessibility behavior, or route/data contracts.

Verify against local code first. Framework docs explain expected behavior, but repository code is the source of truth for the document.

## React

Collect evidence for:

| Concern            | What to verify                                                                              | Typical evidence               |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Component boundary | Components render UI; behavior orchestration lives in routes, hooks, or system layers.      | Components, route files, hooks |
| Props              | Props are typed directly; wrappers preserve native element props where expected.            | Component file                 |
| Effects            | `useEffect` is reserved for external synchronization, not derived state or event reactions. | Hooks/components               |
| States             | Loading, empty, error, disabled, focus-visible, and success states exist where relevant.    | Component + tests/stories      |
| Composition        | Components compose children/primitives instead of accumulating boolean variants.            | Component API                  |

Current-doc checks:

- Components and hooks must be pure during render. Impure work such as timers, subscriptions, logging, and browser integration belongs in effects or event handlers.
- Hooks are called at the top level of components or custom hooks; flag conditional hooks, hooks after early returns, hooks in callbacks, and hooks in try/catch.
- `useEffect` is for synchronization with external systems after render. Flag effects used only to derive render data, mirror props into state, or respond to user events.
- Prefer route loaders, TanStack Query, or framework data APIs over ad hoc `useEffect` fetching when the project already has those layers.

## Vite

Collect evidence for:

| Concern         | What to verify                                                                                                | Typical evidence            |
| --------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Config style    | `vite.config.ts` uses ESM and `defineConfig` or `satisfies UserConfig` where possible.                        | `vite.config.ts`            |
| Plugin order    | TanStack Router plugin runs before the React plugin when file-based routing is configured.                    | `vite.config.ts`            |
| Tailwind v4     | Tailwind v4 uses `@tailwindcss/vite` and CSS-first theme variables when the project adopted v4.               | `vite.config.ts`, CSS       |
| Env exposure    | Client-visible env vars use the public prefix expected by Vite/project config.                                | `.env*`, `vite-env.d.ts`    |
| Build scripts   | Dev, build, preview, typecheck, test, Storybook, and route generation scripts are discoverable.               | `package.json`              |
| Generated files | Generated route tree files are ignored by formatters/linters or otherwise treated as generated.               | `routeTree.gen.ts`, configs |
| Assets/features | `import.meta.glob`, asset query imports, workers, aliases, and CSS modules are documented when architectural. | Source + config             |

Document Vite details only when they affect architecture, onboarding, route generation, environment behavior, or build/debug workflows.

## TanStack Router

Collect evidence for:

| Concern         | What to verify                                                                      | Typical evidence                |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| Route ownership | File-based routes map to app navigation and layouts.                                | `routes/`, generated route tree |
| Guards          | Auth/permission redirects use route hooks such as `beforeLoad`, not UI-only checks. | Route files                     |
| Search params   | Route-owned search params are validated and updated through router APIs.            | Route files                     |
| Data loading    | Loaders use router context and QueryClient where the project expects it.            | Route loaders                   |
| Pending/errors  | Pending, error, and not-found states are defined for critical routes.               | Route files/components          |

Current-doc checks:

- File-based routes use `createFileRoute` and the generated route tree. The route path in code should match the route file location.
- `beforeLoad` owns auth/permission redirects; UI-only auth checks are a gap for protected routes.
- Search params should be validated and loader-dependent search params should be represented with `loaderDeps`.
- Loaders should use router context, including `queryClient.ensureQueryData(...)`, when the app integrates TanStack Query at route boundaries.
- Heavy route components should be split with `.lazy.tsx`, `createLazyFileRoute`, or `autoCodeSplitting` in the Vite plugin.
- Generated route tree files should be documented as generated and should not be hand-edited.

## TanStack Query

Collect evidence for:

| Concern       | What to verify                                                                                   | Typical evidence        |
| ------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| Query options | `queryOptions` factories co-locate query keys and query functions when local patterns expect it. | `query-options.ts`      |
| Query keys    | Keys are hierarchical and include scope/filter/search identifiers that isolate cache entries.    | `query-keys.ts`         |
| AbortSignal   | Query functions pass `signal` to adapters/fetch calls.                                           | Query options + adapter |
| Mutations     | Mutations invalidate relevant queries and roll back optimistic updates when used.                | Mutation hook           |
| Typed errors  | API layer throws typed errors instead of raw unknown shapes.                                     | Adapter                 |

## Zustand or Client Stores

Collect evidence for:

| Concern            | What to verify                                                                        | Typical evidence         |
| ------------------ | ------------------------------------------------------------------------------------- | ------------------------ |
| State role         | Store holds shared client state, not duplicated server state.                         | Store file + query layer |
| React independence | Store can be tested without React if project rules require framework-agnostic stores. | Store file/tests         |
| Selectors          | Components subscribe narrowly enough to avoid broad re-renders.                       | Store usage              |
| Persistence        | Persisted state has versioning/migration if schema can change.                        | Store middleware         |

## Storybook, Tests, and Visual Verification

Collect evidence for:

| Concern              | What to verify                                                                              | Typical evidence                      |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| Stories              | Important components expose variants and state matrix in stories.                           | `stories/`, `*.stories.tsx`           |
| Tests                | Components/hooks/routes test observable behavior and failure states.                        | `*.test.tsx`, `*.spec.tsx`            |
| Accessibility        | Tests or stories include semantic labels, keyboard behavior, or a11y checks where critical. | Tests/stories                         |
| Browser verification | Complex UI docs state what viewport/state was verified or what remains unknown.             | Playwright output, screenshots, notes |

## Design System, shadcn/Radix, Tailwind

Collect evidence for:

| Concern             | What to verify                                                                                 | Typical evidence             |
| ------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------- |
| Token use           | Colors, typography, spacing, radius, elevation, and motion use tokens or documented utilities. | `DESIGN.md`, CSS, components |
| Primitive use       | Existing primitives are reused before creating feature-specific UI.                            | `components/ui`, imports     |
| Variant strategy    | Component variants use the project's established variant helper and naming style.              | Component file               |
| Radix behavior      | Dialog/menu/tabs/popover semantics and keyboard behavior are preserved through composition.    | Component primitive          |
| Tailwind discipline | Classes follow design-system scale; no one-off colors/sizes without documented reason.         | Component file               |

Tailwind CSS v4 checks:

- Prefer semantic project tokens and Tailwind theme variables over hard-coded colors such as `bg-white`, `text-black`, or `border-gray-200`.
- V4 projects may define design tokens with CSS-first `@theme`; document those variables as design-system source when present.
- Prefer mobile-first responsive utilities and container queries where the project uses them.
- Flag dynamically constructed classes such as `bg-${color}-500` because Tailwind's class detection needs complete class names.
- Avoid `@apply` except for base styles or project-approved exceptions.
- When root `DESIGN.md` exists, validate Tailwind classes, CSS variables, and TSX inline styles against that file rather than against generic Tailwind preferences alone.

Keep framework expectations short. Do not turn frontend documentation into framework tutorials.
