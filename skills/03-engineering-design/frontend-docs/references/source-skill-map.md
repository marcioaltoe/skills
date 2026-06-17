# Source Skill Map

This frontend-docs skill is assembled from existing skills in this repository. Use this map to decide which source skill to consult when a document needs deeper guidance.

Paths are relative to this `frontend-docs` skill root.

## Skill Authoring Sources

| Source skill         | Path                                     | What was reused                                                                        |
| -------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| skill-best-practices | `../../ai/skill-best-practices/SKILL.md` | Metadata validation, lean structure, bundled references                                |
| skill-creator        | `../../ai/skill-creator/SKILL.md`        | Eval-ready design, realistic prompts, iterative improvement path                       |
| backend-docs         | `../../backend/backend-docs/SKILL.md`    | Selected-document workflow, argument style, evidence discipline, template organization |

## Frontend Sources

| Source skill               | Path                                                       | Use when                                                                                                  |
| -------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| feature-systems-pattern    | `../feature-systems-pattern/SKILL.md`                      | Domain systems, adapters, hooks, query options, stores, public barrels                                    |
| react                      | `../react/SKILL.md`                                        | Component architecture, hooks, effects, state, TypeScript, testing                                        |
| react-best-practices       | `../react-best-practices/SKILL.md`                         | Deeper React performance and architecture review                                                          |
| react-composition-patterns | `../react-composition-patterns/SKILL.md`                   | Component API and composition issues                                                                      |
| baseline-ui                | `../../05-implementation-loop/baseline-ui/SKILL.md`        | Baseline UI validation: typography, layout, animation duration, accessibility, and Tailwind anti-patterns |
| frontend-design            | `../../05-implementation-loop/frontend-design/SKILL.md`    | Production-grade frontend design guidance for distinctive component/page work                             |
| interface-design           | `../../05-implementation-loop/interface-design/SKILL.md`   | Product interface design for dashboards, admin panels, tools, and app screens                             |
| interaction-design         | `../../05-implementation-loop/interaction-design/SKILL.md` | Microinteractions, state transitions, feedback, and motion design                                         |
| shadcn                     | `../shadcn/SKILL.md`                                       | shadcn/Radix primitive usage and component conventions                                                    |
| tailwindcss                | `../tailwindcss/SKILL.md`                                  | Tailwind class and token usage                                                                            |
| tanstack-router            | `../tanstack-router/SKILL.md`                              | Route tree, loaders, guards, search params, route context                                                 |
| tanstack-query             | `../tanstack-query/SKILL.md`                               | Query keys, query options, caching, mutations, invalidation                                               |
| tanstack-table             | `../tanstack-table/SKILL.md`                               | Data table docs, columns, filtering, pagination, virtualization                                           |
| zustand                    | `../zustand/SKILL.md`                                      | Client state store ownership and selectors                                                                |
| storybook                  | `../storybook/SKILL.md`                                    | Storybook setup, docs, component states                                                                   |
| storybook-stories          | `../storybook-stories/SKILL.md`                            | Story coverage for variants/states                                                                        |
| web-accessibility          | `../web-accessibility/SKILL.md`                            | Accessibility findings and WCAG-oriented docs                                                             |
| web-quality-audit          | `../web-quality-audit/SKILL.md`                            | Broad frontend quality audits                                                                             |

## Development Sources

| Source skill | Path                              | Use when                                           |
| ------------ | --------------------------------- | -------------------------------------------------- |
| vite         | `../../development/vite/SKILL.md` | Vite config, plugins, env vars, build, SSR, assets |

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

## Design and Writing Sources

| Source skill                  | Path                                                    | Use when                                 |
| ----------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| frontend-design               | `../../design/frontend-design/SKILL.md`                 | Product UI layout and design review docs |
| web-design-guidelines         | `../../06-review-repair/web-design-guidelines/SKILL.md` | Web interface guideline compliance       |
| crafting-effective-readmes    | `../../writing/crafting-effective-readmes/SKILL.md`     | Onboarding docs overlap with README work |
| writing-clearly-and-concisely | `../../writing/writing-clearly-and-concisely/SKILL.md`  | Polishing prose for humans               |

Do not load every source skill for every invocation. The distilled rules in this skill are enough for normal frontend documentation work.

When `systems/<domain>/` exists, prioritize `feature-systems-pattern` over generic React folder advice.

When `--mode gap-analysis` includes visible UI, consult the distilled `references/ui-quality-gap-lens.md` before writing findings. It summarizes the replacement UI quality lenses and the bundled checks above.
