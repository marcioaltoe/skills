---
name: frontend-docs
description: Creates selected frontend Markdown documentation from code evidence, including frontend architecture/design docs, feature-system maps, developer onboarding, route and data-flow docs, DESIGN.md compliance, and gap analysis for React, Vite, TanStack Router, TanStack Query, Tailwind CSS, design-system, ui-craft, accessibility, testing, and maintainability issues. Use when the user asks to document a frontend app, map UI architecture or frontend systems, onboard frontend developers, audit frontend documentation gaps, document systems/<domain> feature architecture, validate frontend adherence to DESIGN.md, evaluate gaps against ui-craft practices, or produce objective frontend docs. Do NOT use for backend docs, generic README writing, or implementing frontend changes.
argument-hint: "--mode <architecture|onboarding|gap-analysis|route-data|component-system> --frontendPath <path-or-scope> [--outputPath <doc.md>]"
metadata:
  category: frontend
  tags: [documentation, architecture, react, vite, tanstack-router, feature-systems, ui-craft]
  version: 0.2.2
  author: Marcio Altoé
  internal: false
---

# Frontend Docs

Create objective Markdown documentation for frontend applications from code evidence. Generate only the document type the user selects; do not create a full documentation set unless explicitly requested.

## Document Selection

If the user does not specify the document type, ask them to choose one or more:

| User need                                  | Template                            |
| ------------------------------------------ | ----------------------------------- |
| Frontend architecture and design           | `templates/architecture-design.md`  |
| Developer onboarding                       | `templates/developer-onboarding.md` |
| Gap analysis and improvement opportunities | `templates/gap-analysis.md`         |
| Route, data, and state contracts           | `templates/route-data-contracts.md` |
| Component system and design-system map     | `templates/component-system-map.md` |

If the user asks for "frontend docs" without a target path, create the selected file under `docs/frontend/` using the template name as the filename. If the repository has a stronger docs convention, follow that convention instead.

Argument rules:

- Treat `--mode` as the selected document type.
- Treat `--frontendPath` as the frontend path, app, route group, domain system, component tree, or scope to inspect.
- Treat `--outputPath` as the requested Markdown destination.
- If `--mode` is missing, infer the document type from the user's wording or ask them to choose.

Selection rules:

- Choose `component-system-map.md` when the request mentions components, UI system, design system, component inventory, screens, states, accessibility, or visual patterns.
- Choose `route-data-contracts.md` when the request mentions routes, navigation, loaders, query keys, mutations, adapters, API calls, forms, state contracts, or frontend/backend integration behavior.
- Choose `gap-analysis.md` when the main outcome is risks, smells, violations, tech debt, accessibility issues, design-system drift, test gaps, or improvement opportunities.
- Choose `architecture-design.md` when the main outcome is how the frontend is structured or why it is designed that way.
- Ask a clarifying question only when two document types would produce materially different outputs and the prompt does not imply a stronger reader need.

## Workflow

### Step 1: Confirm Scope

Identify the target frontend app, package, route group, domain system, component set, state layer, or design-system area. If the request is broad, document only the highest-value slice first and note what remains out of scope.

Capture:

- Document type and target reader.
- Target path or docs convention.
- Frontend stack and runtime if discoverable.
- Whether the document should describe current state, proposed design, or both.

### Step 2: Discover Rules and Existing Docs

Read `references/discovery-workflow.md`, then inspect project rules before implementation details.

Prioritize:

1. Project instructions: `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `.cursor/rules/`, `.windsurf/rules/`, `CONTRIBUTING.md`.
2. Existing docs: `docs/`, architecture notes, design-system docs, onboarding docs, Storybook docs, ADRs/RFCs.
3. Code contracts: route definitions, loaders, query options, API adapters, schemas, stores, contexts, components, tests, stories, generated route trees, and token files.

If project rules conflict with this skill, project rules win.

If a root `DESIGN.md` exists, treat it as a normative frontend contract. Load it before assessing UI, TSX, CSS, Tailwind, tokens, icons, spacing, typography, motion, copy, accessibility, or component patterns.

If the repository uses `systems/<domain>/`, load `references/feature-system-contracts.md` before writing the document. Treat `feature-systems-pattern` as the dominant local architecture lens for feature/domain documentation.

If `--mode gap-analysis` is selected, treat `skills/frontend/ui-craft` as the normative UI quality source for visible product surfaces. Use it to identify gaps in usability, component states, token discipline, accessibility, visual hierarchy, microcopy, motion, dark mode, responsive behavior, and anti-default patterns. Do not generate a separate UI audit unless the user asks for one.

### Step 3: Gather Evidence From Code

Trace the frontend from entry points to user-facing behavior. Use file references rather than pasting large code blocks.

Look for:

- App bootstrap, router setup, providers, layout shells, theme/design-system integration, and global styles.
- Vite config, React plugin, Tailwind plugin, TanStack Router plugin order, generated route tree handling, aliases, environment variable exposure, and build/preview scripts.
- Routes, loaders, route guards, search params, navigation, lazy routes, error and pending components.
- Domain systems, `systems/<domain>/` boundaries, adapters, query keys, query options, hooks, mutations, forms, schemas, stores, contexts, guards, and public barrels.
- Components, primitives, variants, state matrices, accessibility patterns, design tokens, responsive behavior, and dark mode.
- DESIGN.md compliance in TSX/CSS: raw hex/rgb/hsl colors, hard-coded Tailwind colors, inline styles, magic spacing/radius/sizing values, icon family usage, typography utilities/classes, token files, CSS variables, and documented exceptions.
- UI-craft gaps for user-facing surfaces: unclear surface job, missing state matrix, weak hierarchy, text overflow, fake interactivity, generic CTAs, placeholder copy, emoji-as-icon, default SaaS/AI visuals, unverified contrast, missing focus-visible behavior, missing reduced-motion handling, untested dark mode, and performance-sensitive visual patterns.
- Tests, stories, visual verification, Playwright coverage, mocks/fakes, and known test gaps.
- Performance-sensitive areas: large tables, charts, virtualized lists, images, bundle boundaries, suspense/lazy loading, and unnecessary client state.

Document facts as "Observed" and label conclusions as "Inference" when they are not directly stated in code or docs.

### Step 4: Load Only Relevant References

Use progressive disclosure:

- For documentation structure and brevity, read `references/documentation-principles.md`.
- For frontend evidence collection and source-skill routing, read `references/source-skill-map.md`.
- For `systems/<domain>/` feature architecture, adapters, query options, hooks, stores, contexts, guards, and barrels, read `references/feature-system-contracts.md`.
- If root `DESIGN.md` exists, read `references/design-system-compliance.md`.
- If `--mode gap-analysis` is selected and the scope includes visible UI, read `references/ui-craft-gap-lens.md`.
- For React, systems, route/data, UI, accessibility, design-system, testing, and quality checks, read `references/frontend-quality-lenses.md`.
- For React, TanStack Router/Query, Zustand, Storybook, shadcn/Radix, Tailwind, accessibility, or design-system specifics, read `references/framework-contract-notes.md`.
- For the selected document shape, read only the matching template in `templates/`.

### Step 5: Write the Markdown Document

Use the selected template as the structure. Keep the document compact and useful to the target reader.

Each generated document should:

- Start with scope, audience, and last-reviewed date.
- Cite concrete code or docs evidence with file paths and line numbers when available.
- Separate current state from recommendations.
- Prefer tables for inventories, routes, contracts, states, gaps, and next actions.
- Include diagrams only when they clarify ownership, routing, data flow, or component relationships.
- Mark unknowns and assumptions instead of inventing missing details.
- End with a short maintenance note explaining when the document should be updated.

### Step 6: Validate Before Finishing

Before final response:

- Re-read the generated or edited document.
- Check that the selected template was followed.
- Check that every non-obvious claim has evidence or is labeled as inference.
- Check that no unrelated templates were generated.
- Check links and file paths.
- Check that a `systems/<domain>/` codebase was evaluated against the feature-system contract rather than generic React folder advice.
- Check that a root `DESIGN.md`, when present, was evaluated against frontend TSX, CSS, token files, and documented exceptions. Gap-analysis documents must report either findings or an explicit "no issues found" row for this scan.
- Check that gap-analysis documents for visible UI include a `ui-craft` pass/fail row or findings covering state matrix, accessibility floor, token discipline, microcopy, motion/dark-mode/responsive behavior, and anti-default patterns.
- Check that React, Vite, TanStack Router, TanStack Query, Tailwind CSS, and project design-system claims come from project evidence, local skills, or current docs.
- If validation commands exist for docs formatting or markdown linting, run the project-preferred command.

## Output Rules

- Write in the user's language unless the repository has a documented docs language.
- Use concise technical prose. Avoid promotional language and generic claims.
- Do not duplicate large source code blocks. Link to source paths instead.
- Do not silently create ADRs, RFCs, PRDs, or design specs unless the user selected that form or the repository convention requires it.
- Do not implement frontend changes while documenting. If gaps are found, record them as recommendations.
- Do not describe UI quality from screenshots alone when code evidence is available; cite the code, docs, stories, or rendered verification source.
- Do not turn the output into a React, Vite, Tailwind, or TanStack tutorial. Explain framework behavior only when it affects a project-specific finding, contract, or onboarding step.
- Do not recommend folder moves that violate the repository's local `systems/<domain>/` or route conventions.
- Do not say a frontend follows the design system unless `DESIGN.md` rules were checked against TSX and CSS evidence, including token usage and exceptions.
- Do not mark a gap-analysis UI surface as healthy unless `ui-craft` risks were checked against source evidence, tests/stories, rendered verification, or explicitly listed as unknown.

## Examples

### Architecture and Design

User says: "Document the frontend architecture for the dashboard app."

Action: Select `templates/architecture-design.md`, inspect project rules and frontend app code, map app bootstrap, routes, systems, state, design-system integration, testing, and risks.

### Onboarding

User says: "Create onboarding docs so a new frontend dev can understand this app."

Action: Select `templates/developer-onboarding.md`, identify setup commands, app entry points, route/data flow, component conventions, design-system rules, and first safe change paths.

### Gap Analysis

User says: "Find frontend architecture smells and documentation gaps in this system."

Action: Select `templates/gap-analysis.md`, apply project rules plus React, routing, server state, client state, component, design-system, ui-craft, accessibility, performance, and testing lenses.

### Route and Data Contracts

User says: "Document route loaders, query keys, mutations, and API adapters for the billing UI."

Action: Select `templates/route-data-contracts.md`, trace route ownership, loader/query contracts, adapter calls, forms, mutations, cache invalidation, errors, and side effects.

### Feature System Documentation

User says: "Document the accounts system and tell us if it follows our frontend system pattern."

Action: Select `templates/architecture-design.md` or `templates/gap-analysis.md` based on the requested outcome, load `references/feature-system-contracts.md`, and evaluate `systems/accounts/` against directory layout, dependency flow, query options, adapter contracts, hooks, stores, contexts, guards, and public barrels.

### Component System Map

User says: "Map the account settings components and their design-system dependencies."

Action: Select `templates/component-system-map.md`, inventory components, variants, states, primitives, tokens, accessibility behavior, stories/tests, and recommended docs.
