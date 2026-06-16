# Source Skill Map

This frontend-docs skill is assembled from existing skills in this repository. Use this map to decide which source skill to consult when a document needs deeper guidance.

Paths are relative to the `skills/frontend/frontend-docs/` skill root.

## Skill Authoring Sources

| Source skill         | Path                                     | What was reused                                                                        |
| -------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| skill-best-practices | `../../ai/skill-best-practices/SKILL.md` | Metadata validation, lean structure, bundled references                                |
| skill-creator        | `../../ai/skill-creator/SKILL.md`        | Eval-ready design, realistic prompts, iterative improvement path                       |
| backend-docs         | `../../backend/backend-docs/SKILL.md`    | Selected-document workflow, argument style, evidence discipline, template organization |

## Frontend Sources

| Source skill               | Path                                     | Use when                                                                                                                                     |
| -------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| feature-systems-pattern    | `../feature-systems-pattern/SKILL.md`    | Domain systems, adapters, hooks, query options, stores, public barrels                                                                       |
| react                      | `../react/SKILL.md`                      | Component architecture, hooks, effects, state, TypeScript, testing                                                                           |
| react-best-practices       | `../react-best-practices/SKILL.md`       | Deeper React performance and architecture review                                                                                             |
| react-composition-patterns | `../react-composition-patterns/SKILL.md` | Component API and composition issues                                                                                                         |
| ui-craft                   | `../ui-craft/SKILL.md`                   | Mandatory gap-analysis lens for visible UI: state matrix, accessibility floor, visual hierarchy, microcopy, motion, dark mode, anti-defaults |
| shadcn                     | `../shadcn/SKILL.md`                     | shadcn/Radix primitive usage and component conventions                                                                                       |
| tailwindcss                | `../tailwindcss/SKILL.md`                | Tailwind class and token usage                                                                                                               |
| tanstack-router            | `../tanstack-router/SKILL.md`            | Route tree, loaders, guards, search params, route context                                                                                    |
| tanstack-query             | `../tanstack-query/SKILL.md`             | Query keys, query options, caching, mutations, invalidation                                                                                  |
| tanstack-table             | `../tanstack-table/SKILL.md`             | Data table docs, columns, filtering, pagination, virtualization                                                                              |
| zustand                    | `../zustand/SKILL.md`                    | Client state store ownership and selectors                                                                                                   |
| storybook                  | `../storybook/SKILL.md`                  | Storybook setup, docs, component states                                                                                                      |
| storybook-stories          | `../storybook-stories/SKILL.md`          | Story coverage for variants/states                                                                                                           |
| web-accessibility          | `../web-accessibility/SKILL.md`          | Accessibility findings and WCAG-oriented docs                                                                                                |
| web-quality-audit          | `../web-quality-audit/SKILL.md`          | Broad frontend quality audits                                                                                                                |

## Development Sources

| Source skill | Path                              | Use when                                           |
| ------------ | --------------------------------- | -------------------------------------------------- |
| vite         | `../../development/vite/SKILL.md` | Vite config, plugins, env vars, build, SSR, assets |

## Design and Writing Sources

| Source skill                  | Path                                                   | Use when                                 |
| ----------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| frontend-design               | `../../design/frontend-design/SKILL.md`                | Product UI layout and design review docs |
| web-design-guidelines         | `../../design/web-design-guidelines/SKILL.md`          | Web interface guideline compliance       |
| crafting-effective-readmes    | `../../writing/crafting-effective-readmes/SKILL.md`    | Onboarding docs overlap with README work |
| writing-clearly-and-concisely | `../../writing/writing-clearly-and-concisely/SKILL.md` | Polishing prose for humans               |

Do not load every source skill for every invocation. The distilled rules in this skill are enough for normal frontend documentation work.

When `systems/<domain>/` exists, prioritize `feature-systems-pattern` over generic React folder advice.

When `--mode gap-analysis` includes visible UI, consult the distilled `references/ui-craft-gap-lens.md` before writing findings.
