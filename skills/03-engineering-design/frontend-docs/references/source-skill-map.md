# Source Skill Map

This skill distills guidance that originated in other skills. When a document needs deeper guidance than the distilled rules here, consult the source skill **by name** through the agent's skill mechanism — never by relative path; which skills are installed differs per project, and a named skill that is absent simply doesn't load.

## Frontend

| Skill                        | Use when                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `feature-systems-pattern`    | Domain systems, adapters, hooks, query options, stores, public barrels                                    |
| `react`                      | Component architecture, hooks, effects, state, TypeScript, testing                                        |
| `react-best-practices`       | Deeper React performance and architecture review                                                          |
| `react-composition-patterns` | Component API and composition issues                                                                      |
| `baseline-ui`                | Baseline UI validation: typography, layout, animation duration, accessibility, and Tailwind anti-patterns |
| `frontend-design`            | Production-grade frontend design guidance for distinctive component/page work                             |
| `interface-design`           | Product interface design for dashboards, admin panels, tools, and app screens                             |
| `interaction-design`         | Microinteractions, state transitions, feedback, and motion design                                         |
| `shadcn`                     | shadcn/Radix primitive usage and component conventions                                                    |
| `tailwindcss`                | Tailwind class and token usage                                                                            |
| `tanstack-router`            | Route tree, loaders, guards, search params, route context                                                 |
| `tanstack-query`             | Query keys, query options, caching, mutations, invalidation                                               |
| `tanstack-table`             | Data table docs, columns, filtering, pagination, virtualization                                           |
| `zustand`                    | Client state store ownership and selectors                                                                |
| `vite`                       | Vite config, plugins, env vars, build, SSR, assets                                                        |

## Quality and accessibility

| Skill                                         | Use when                                      |
| --------------------------------------------- | --------------------------------------------- |
| `wcag-audit-patterns`, `fixing-accessibility` | Accessibility findings and WCAG-oriented docs |
| `core-web-vitals`                             | Performance findings tied to LCP/INP/CLS      |
| `web-design-guidelines`                       | Web interface guideline compliance            |

## Writing

| Skill                           | Use when                                 |
| ------------------------------- | ---------------------------------------- |
| `tech-writer`                   | Full writing discipline for any doc type |
| `crafting-effective-readmes`    | Onboarding docs overlap with README work |
| `writing-clearly-and-concisely` | Polishing prose for humans               |

## Bundled UI Quality Sources

These resources were absorbed into `frontend-docs` so UI documentation and gap analysis keep the useful design-system checks without depending on a separate installable UI skill.

| Resource                                  | Use when                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `assets/state-matrix.md`                  | A component needs default, hover, active, focus-visible, disabled, loading, empty, error, and success coverage        |
| `assets/ui-audit-template.md`             | The user asks for a UI audit artifact or evidence table                                                               |
| `assets/pre-ship-checklist.md`            | A gap analysis needs a binary pre-ship checklist for visible UI                                                       |
| `references/design-system-integration.md` | DESIGN.md, semantic tokens, Figma/Code Connect, shadcn/Radix, Tailwind discipline, and rules files                    |
| `references/visual-craft.md`              | No design system exists or a visual decision needs a conservative default                                             |
| `references/anti-defaults.md`             | The UI shows generic AI/SaaS defaults such as emoji icons, gradient text, glassmorphism, generic cards, or vague CTAs |
| `references/ai-slop-patterns.md`          | Findings need a named pattern taxonomy for generic or low-craft UI                                                    |
| `references/accessibility-floor.md`       | Visible UI needs WCAG-oriented keyboard, focus, label, contrast, motion, and form checks                              |
| `references/component-patterns.md`        | Component APIs, variants, primitives, state matrices, and composition patterns need review                            |
| `references/microcopy-quality.md`         | Buttons, errors, empty states, toasts, labels, and help text need copy review                                         |
| `references/motion-patterns.md`           | Motion timing, easing, reduced-motion, and state transitions need review                                              |
| `references/dark-mode.md`                 | Dark mode token mapping, elevation, contrast, and state coverage need review                                          |
| `references/performance.md`               | Visual effects, fonts, images, skeletons, large lists, blur, and Core Web Vitals need review                          |
| `scripts/check-contrast.mjs`              | Contrast findings need fresh numeric evidence                                                                         |
| `scripts/detect-token-drift.mjs`          | DESIGN.md/token findings need a raw color scan                                                                        |

Do not load every source skill for every invocation. The distilled rules in this skill are enough for normal frontend documentation work.

When `systems/<domain>/` exists, prioritize `feature-systems-pattern` over generic React folder advice.

When `--mode gap-analysis` includes visible UI, consult the distilled `references/ui-quality-gap-lens.md` before writing findings. It summarizes the replacement UI quality lenses and the bundled checks above.
