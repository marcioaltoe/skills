# UI Craft Gap Lens

Use this reference when `--mode gap-analysis` covers visible frontend UI. It distills `skills/frontend/ui-craft` into documentation-focused checks. The goal is not to create a full UI audit; it is to make sure gap-analysis reports do not miss user-facing quality failures.

Source skill references:

- `../ui-craft/SKILL.md`
- `../ui-craft/assets/ui-audit-template.md`
- `../ui-craft/assets/state-matrix.md`
- `../ui-craft/references/design-system-integration.md`
- `../ui-craft/references/accessibility-floor.md`
- `../ui-craft/references/component-patterns.md`
- `../ui-craft/references/microcopy-quality.md`
- `../ui-craft/references/motion-patterns.md`
- `../ui-craft/references/dark-mode.md`
- `../ui-craft/references/performance.md`
- `../ui-craft/references/ai-slop-patterns.md`
- `../ui-craft/references/anti-defaults.md`

## Required Gap Checks

For each visible route, page, dialog, form, table, card list, or component system in scope, check:

| Area                        | Evidence to inspect                                                                                     | Report as a gap when                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surface job                 | Route/component name, heading, CTA, form/action code, product copy                                      | The surface has multiple competing jobs or no clear user task.                                                                                      |
| State matrix                | Components, stories, tests, loading/error/empty branches, disabled props, focus styles                  | Default, hover, active, focus-visible, disabled, loading, empty, error, or success states are missing when applicable.                              |
| Accessibility floor         | Semantic elements, labels, dialogs, menus, tabs, keyboard handlers, focus management, contrast evidence | Keyboard reachability, focus-visible, labels, modal focus lifecycle, target size, contrast, or reduced-motion support is missing or unverified.     |
| Design-system discipline    | `DESIGN.md`, token files, CSS, Tailwind classes, TSX inline styles                                      | Raw values, magic spacing/radius/shadow, token drift, undocumented variants, or component-specific one-offs appear.                                 |
| Visual hierarchy and layout | Headings, density, information grouping, responsive CSS/classes, worst-case content                     | Important information is visually weak, text can overflow, controls crowd or overlap, or layout breaks at expected viewports.                       |
| Component pattern fit       | Existing primitives, shadcn/Radix usage, custom widgets, public components                              | The code reimplements behavior that should come from an accessible primitive or creates ad hoc component APIs.                                      |
| Microcopy                   | Buttons, errors, empty states, labels, help text, toasts                                                | CTAs are generic, errors lack recovery, empty states lack action, copy uses filler, emoji-as-icon, placeholder names, or banned AI/default wording. |
| Motion and dark mode        | Animation CSS/classes, `prefers-reduced-motion`, theme selectors, dark tokens                           | Motion is decorative, too slow, bounce-heavy in product chrome, lacks reduced-motion fallback, or dark mode states are untested.                    |
| Performance-sensitive UI    | Fonts, images, blur/backdrop filters, large lists/tables/charts, skeletons                              | Visual effects or loading placeholders create paint, layout shift, or perceived-performance risk without evidence.                                  |
| Anti-default patterns       | Hero/marketing sections, dashboards, empty states, illustrations, gradients, cards                      | The UI matches obvious AI/SaaS defaults without project-specific scene or design authority.                                                         |

## Severity Guidance

- **Critical**: Blocks keyboard operation, hides critical feedback, makes text unreadable, breaks primary task completion, or violates explicit project rules.
- **High**: Missing modal/menu focus lifecycle, unhandled loading/error states for primary flows, severe token drift, fake interactivity, or layout breakage in supported viewports.
- **Medium**: Missing stories/tests for state matrices, weak hierarchy, generic microcopy, undocumented design-system exceptions, or unverified dark/reduced-motion behavior.
- **Low**: Cleanup-level consistency issues that do not affect task completion but compound visual drift.

## Output Requirements

In `templates/gap-analysis.md`, include either:

1. A finding for each material `ui-craft` issue with code evidence and a smallest useful recommendation, or
2. An explicit pass row in the UI Craft Gap Checks table when the scope was checked and no issue was found.

Do not claim a UI surface is polished, accessible, or design-system compliant from screenshots alone. Use source evidence first; rendered/browser verification may support the finding when available.
