# Frontend Quality Lenses

Use these lenses when the selected document needs frontend architecture analysis, gap identification, or design explanation.

## Project Rules Lens

Check whether implementation and documentation follow local rules:

- Required folder layout and system/module ownership.
- Route and data-fetching style.
- Component and hook placement.
- Design-system and token discipline.
- Accessibility and state requirements.
- Testing and verification expectations.
- Generated file rules.
- Documentation placement and language.

Report rule violations with source rule path and code evidence.

## Architecture Lens

Map:

- App bootstrap and providers.
- Vite config, plugins, aliases, environment variables, and build/preview scripts.
- Route tree, layouts, guards, loaders, and error boundaries.
- Feature/domain systems.
- Component hierarchy and ownership.
- Data flow and state boundaries.
- External integrations.
- Cross-cutting concerns such as auth, theme, i18n, errors, observability, accessibility, and testing.

Common issues:

- Routes doing too much orchestration without system boundaries.
- Components importing stores/adapters directly when local rules forbid it.
- Mixed responsibilities between routes, hooks, and presentational components.
- Generated files edited manually.
- Hidden dependency on global state or root-hoisted packages.
- Architecture decisions not captured in docs.

## Feature Systems Lens

Use when `systems/<domain>/` exists or the user asks about feature systems.

Check:

- System folders match local conventions: `index.ts`, `types.ts`, `adapters/`, `lib/`, `hooks/`, optional `contexts/`, optional `stores/`, optional `guards/`, and `components/`.
- Dependency direction is `adapters -> lib -> hooks -> components`, with routes consuming public system exports.
- Cross-system imports go through public barrels, not internal files.
- API adapters own HTTP calls, typed errors, private normalization helpers, and `AbortSignal` propagation.
- Query keys are hierarchical, scoped, and exported from `lib/query-keys.ts`.
- `queryOptions` factories co-locate keys/functions and are reused by hooks, prefetching, and route loaders.
- Mutations invalidate affected queries and rollback cache-based optimistic updates.
- `index.ts` exports explicit named public APIs grouped by role.

Report missing optional folders only when the responsibility exists in code and has no clear home.

## React and Component Lens

Check:

- Functional components only.
- Props typed directly; native wrappers preserve native props.
- Behavior logic extracted into hooks where it improves clarity.
- `useEffect` used only for external synchronization, not derived state or event handling.
- Loading, empty, error, disabled, success, focus-visible, and responsive states.
- Accessibility semantics, labels, keyboard support, focus management, and target sizes.
- Component composition avoids boolean-prop explosion.
- Component text fits and does not overlap in target viewports.

## Route and Data Lens

Check:

- Route ownership and file-based route structure.
- Vite/TanStack Router plugin setup, generated route tree location, generated-file ignore rules, and route type registration.
- `beforeLoad`, loaders, route context, redirects, search param validation, pending/error/not-found behavior.
- Query keys, query options, loaders, query hooks, mutations, invalidation, optimistic updates, and rollback.
- API adapters, typed errors, schemas, `AbortSignal` propagation, and backend contract ownership.
- Cache scoping by tenant/user/org/filter/search params.
- Forms, validation, side effects, and post-submit navigation.

## State Lens

Classify state:

| State type          | Preferred home                        | Risk                                                  |
| ------------------- | ------------------------------------- | ----------------------------------------------------- |
| Local UI state      | Component or local hook               | Prop drilling or duplicated state                     |
| Server state        | TanStack Query or route loader        | Stale cache, missing invalidation, duplicate fetching |
| URL/shareable state | Router search params                  | Unsynced filter/pagination state                      |
| Shared client state | Store/context                         | Over-broad subscriptions or UI coupling               |
| External state      | Subscription or external store bridge | Missing cleanup or race conditions                    |

Flag duplicated server/client state, cross-scope cache leaks, and stores that depend on React when project rules forbid it.

## Design-System and UI Lens

Check:

- Root `DESIGN.md`, when present, is treated as the source of truth and checked against code.
- Colors, typography, spacing, radius, elevation, and motion use tokens, Tailwind theme variables, or documented variants.
- Components use established primitives and variants where available.
- Dark mode and responsive behavior are covered.
- UI has complete state matrix: default, hover, active, focus-visible, disabled, loading, empty, error, success.
- Microcopy is specific and recovery-oriented.
- No decorative UI patterns that conflict with project rules.

## UI Quality Gap Lens

Use for `--mode gap-analysis` when the scope includes visible frontend UI. Treat this skill's bundled UI quality references, plus `baseline-ui`, `frontend-design`, `interface-design`, `interaction-design`, and `web-design-guidelines`, as the default sources for user-facing quality checks.

Check:

- Each visible route/page/component has a clear user-facing job and does not mix unrelated tasks.
- State matrix coverage exists for applicable default, hover, active, focus-visible, disabled, loading, empty, error, success, selected, and domain states.
- Accessibility floor is met or explicitly unverified: keyboard reachability, focus-visible, labels/descriptions, dialog/menu/tab behavior, target size, contrast, and reduced motion.
- UI values follow `DESIGN.md`/tokens; raw values, magic numbers, undocumented variants, and ad hoc component styles are reported.
- Visual hierarchy, responsive behavior, density, and worst-case content do not create overlap, overflow, or weak primary actions.
- Component patterns use established primitives where available and avoid reimplementing accessible behavior without justification.
- Microcopy uses verb-object CTAs, recovery-oriented errors, useful empty states, and avoids placeholder/filler/AI-default phrasing.
- Motion, dark mode, skeletons, fonts, images, blur, large lists, and charts have verification or are listed as risks.
- Anti-default patterns from the UI quality lenses are flagged when they appear without project-specific justification.

Gap-analysis output must include a UI Quality Gap Checks table row or material finding when visible UI is in scope.

## DESIGN.md Compliance Lens

Use when root `DESIGN.md` exists.

Check:

- TSX has no raw hex/rgb/hsl colors, hard-coded Tailwind colors, or undocumented SVG `fill`/`stroke` literals.
- TSX inline styles are either dynamic geometry with a documented reason or are reported as magic spacing/sizing/radius/color values.
- Surface CSS uses tokens or documented constants except in token definition files.
- Tailwind utilities resolve to project tokens when local rules require token discipline.
- Icon family, typography scale, casing, language, status labels, spacing, radii, motion, and reduced-motion behavior follow `DESIGN.md`.
- Any exception is classified as approved, plausible but undocumented, or invalid.

Gap-analysis output must include a finding or explicit pass row for this lens when `DESIGN.md` exists.

## Accessibility Lens

Check:

- Semantic HTML and landmark/headings.
- Keyboard reachability and focus-visible states.
- Accessible names and descriptions for controls.
- Form labels, validation messages, and `aria-describedby`/live announcements.
- Dialog/menu/combobox/tabs/listbox patterns follow expected keyboard behavior.
- Contrast and target size are documented or verified when relevant.
- Reduced motion is honored where animation exists.

## Testing and Verification Lens

Check:

- Unit tests for hooks and pure utilities.
- Component tests for behavior users observe.
- Route/data tests for loaders, guards, query invalidation, and error states.
- Storybook stories for component variants and state matrix.
- Playwright or browser verification for critical workflows.
- Accessibility checks where available.

Treat missing tests/stories as documentation risk when the doc claims behavior that tests or stories do not protect.

## Vite and Build Lens

Check:

- `vite.config.ts` uses `defineConfig` or `satisfies UserConfig` and ESM style.
- React, Tailwind, and TanStack Router plugins are configured in the expected order for the project.
- TanStack Router generated files are treated as generated artifacts and not manually edited.
- `import.meta.env` exposure is understood: only public-prefixed client variables should be documented as browser-visible.
- Aliases, root, envDir, build target, preview, SSR, and proxy settings that affect frontend architecture are captured.
- Package scripts identify dev, build, preview, typecheck, lint, test, Storybook, and route generation commands when present.

## Finding Format

Use this structure for gap-analysis findings:

```markdown
### [Severity] Finding title

- **Type**: Project rule | Architecture | Feature system | React | Vite/build | Routing | Data | State | UI craft | Design system | Accessibility | Testing | Performance
- **Evidence**: `path/to/file.tsx:42`
- **Observed**: What the code or docs show.
- **Impact**: Why it matters.
- **Recommendation**: The smallest useful next step.
- **Confidence**: High | Medium | Low
```
