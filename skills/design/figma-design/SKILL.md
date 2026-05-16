---
name: figma-design
description: Creates and composes new Figma designs via the Figma MCP server while respecting existing design systems. Use when creating, composing, or updating Figma designs, screens, components, mockups, or UI layouts programmatically; when the request mentions designing in Figma, adding a screen to Figma, building a mockup in Figma, or writing to Figma via use_figma or the Plugin API. Enforces reuse of existing library components through search_design_system and importComponentByKeyAsync over recreation, binding of color/spacing/radius variables instead of hardcoded values, auto-layout on every container, variant and component properties usage, and per-checkpoint visual review with get_screenshot. Do not use for implementing Figma designs as code, Code Connect mapping, reading designs without modification, or non-Figma design tools.
---

# Figma Design Authoring Procedure

Follow this procedure to create or modify designs inside a Figma file through the Figma MCP server. The non-negotiable rules: **reuse before create**, **bind variables never hardcode**, **auto-layout everywhere**, **verify every 2–3 mutations with a screenshot**.

## Required Tools

The Figma MCP server (`plugin:figma:figma`) must be connected. Verify by checking availability of `use_figma`, `search_design_system`, `get_metadata`, `get_screenshot`, and `get_variable_defs`. If any are missing, stop and report to the user.

## Step 1: Capture Intent and Inputs

1. Extract the `fileKey` from any provided Figma URL (`figma.com/design/:fileKey/...`). If only a fileKey was provided, use it directly. If none was provided, ask the user for one before proceeding. Never invent a fileKey.
2. Identify the target scope: new file, new page in an existing file, a specific frame/node (`nodeId`), or a modification to an existing element. Convert URL node ids from `a-b` to `a:b` for tool calls.
3. Restate the design goal in one sentence (screen, component, flow) so later steps stay aligned.

## Step 2: Discover the Design System (Non-Negotiable)

Never skip this step. Rebuilding assets that already exist is the single biggest failure mode.

1. Call `get_metadata` on the target page (use page id `0:1` if unknown) to map the existing pages, frames, and top-level structure. Record which frames are "Components", "Patterns", "Tokens/Reference", or screens.
2. Call `search_design_system` with `includeComponents: true`, `includeVariables: true`, `includeStyles: true` for every asset kind the design will need. Run multiple queries with synonyms — for example `button`, `primary`, `cta`; `card`, `panel`; `input`, `field`, `text field`; `tab`, `nav`, `segmented`; `color`, `primary`, `background`, `surface`; `spacing`, `gap`, `padding`; `radius`, `corner`. A single empty query result does NOT prove an asset is missing.
3. For each match, record the asset `key`, `name`, node id, and its variant/property definitions. This is the reusable inventory.
4. If the user pointed at a reference design (existing frame), also call `get_design_context` on that node to extract tokens, typography, and component usage patterns already proven in the file.
5. Only declare an asset "missing" after searching with at least three synonym queries. Prefer adapting an existing component (via variants/properties) over creating a new one.

## Step 3: Plan the Composition Before Writing Code

1. Draft a short plan (3–10 bullets) that lists, in order: the target frame, the tokens to bind, the component instances to import, and the nesting hierarchy (atoms → molecules → organisms → screen). For non-trivial scopes use the template in `assets/composition-plan.template.md` as the structure.
2. For every visual decision, point to an inventory item from Step 2. If a decision cannot point to an inventory item, either relax the decision to match an existing asset or explicitly flag it as "new asset to create" and justify why.
3. Share the plan with the user when the scope is non-trivial (more than a single component) and wait for confirmation before executing Step 4.
4. Before the first `use_figma` call, skim `references/anti-patterns.md` to pre-empt the most common failure modes.

## Step 4: Execute With `use_figma`

Read `references/plugin-api-patterns.md` once before the first `use_figma` call. It contains the exact code patterns for importing components, binding variables, creating auto-layout frames, loading fonts, and setting component properties.

Follow these rules when writing the JavaScript passed to `use_figma.code`:

1. **Import, do not rebuild.** Use `figma.importComponentByKeyAsync(key)` or `figma.importComponentSetByKeyAsync(key)` for every component identified in Step 2. Create instances via `componentSet.defaultVariant.createInstance()` or `component.createInstance()`. Never replicate a library component out of `createRectangle` + `createText`.
2. **Bind variables, never hardcode.** Use `figma.variables.importVariableByKeyAsync(key)` to load tokens, then `figma.variables.setBoundVariableForPaint(...)` for fills/strokes and `node.setBoundVariable('paddingLeft' | 'itemSpacing' | 'cornerRadius' | 'strokeWeight' | ..., variable)` for numeric fields. Raw hex, rgb, and pixel values are forbidden except inside `setBoundVariableForPaint` placeholder colors.
3. **Auto-layout everywhere.** Every container frame must set `layoutMode` to `HORIZONTAL`, `VERTICAL`, or `GRID` **before** setting padding, spacing, or alignment. Prefer `layoutSizingHorizontal`/`layoutSizingVertical` (`FILL`/`HUG`/`FIXED`) over legacy `primaryAxisSizingMode`. Never position children with `x`/`y`; use `layoutPositioning = 'ABSOLUTE'` inside an auto-layout parent for genuine overlays.
4. **Use component properties, not duplicated frames.** Express state (hover, disabled, with-icon, size variations) by calling `instance.setProperties({...})` on InstanceNodes. VARIANT properties use bare names (`Size`, `Variant`); BOOLEAN/TEXT/INSTANCE_SWAP properties require the `#id` suffix from `componentPropertyDefinitions`. `setProperties` does NOT exist on ComponentNode.
5. **Text uses styles, not raw overrides.** After `figma.createText()`, call `figma.loadFontAsync(node.fontName)` before setting `characters`. Prefer `setTextStyleIdAsync(styleId)` over manually setting fontSize/fontName/lineHeight.
6. **Work in small batches.** Each `use_figma` call should perform ONE logical action (create tokens, import components, build one section). Multi-step scripts that touch variables + components + composition in one call are harder to validate and harder to debug.
7. **Name everything semantically.** Frame names should match the engineering component they represent (`CardStat`, `SidebarNavItem`, `ButtonPrimary`). This keeps future Code Connect mappings clean.

If the script fails, read the error carefully. Common causes are listed in `references/plugin-api-patterns.md` under "Error Handling".

## Step 5: Review Checkpoint (Mandatory Every 2–3 Mutations)

After every 2–3 `use_figma` calls, execute a review checkpoint:

1. Call `get_screenshot` on the current target frame.
2. Evaluate the screenshot against the six criteria in `references/review-checklist.md` (spacing, typography, contrast, alignment, clipping, repetition). Summarise each as a one-line verdict.
3. Fix every issue found before the next mutation. Do NOT continue building on top of a broken state.
4. If content overflows its frame, use `update_styles` / `use_figma` to set the overflowing dimension to `layoutSizingVertical = 'HUG'` or `layoutSizingHorizontal = 'HUG'` — do not expand the artboard by hardcoding a larger fixed size.

Fixing broken images or transient rendering bugs does not count as a checkpoint — those are pre-conditions, not craft review.

## Step 6: Final Audit

Before reporting completion, read `references/final-audit.md` and verify every item. Pay particular attention to:

1. Zero hardcoded colors (no raw hex in fills/strokes) — every paint must be variable-bound or reference a published style.
2. Zero hardcoded spacing/radius — padding, itemSpacing, cornerRadius must be variable-bound or match a documented token in the design system reference frame.
3. Every container frame has `layoutMode` set (no implicit `NONE`).
4. Every library component is used as an instance (`node.type === 'INSTANCE'`), not a rebuilt frame.
5. Every visible text node either has a text style applied or explicitly represents intentional divergence (flag these to the user).
6. Final `get_screenshot` of the top-level target frame has been captured and reviewed.

If any item fails, fix it with an additional `use_figma` call and re-run the audit. Only declare completion once every item passes.

## Step 7: Report Back

Report a concise summary to the user containing: the fileKey and nodeId of the primary output, the components reused (count + names), the variables bound (count), any new assets created (with justification), and the final screenshot. If any decision deviated from the discovered design system, call it out explicitly.

## Error Handling

- **`search_design_system` returns nothing.** Retry with 2+ synonym queries. If still empty, call `get_metadata` on the page, inspect frame names, and call `get_design_context` on a candidate frame to read tokens directly. Do NOT conclude "no design system exists" from a single empty search.
- **`importComponentByKeyAsync` rejects.** The component may not be published. Either ask the user to publish it, or fall back to copying an existing instance from the file via `get_metadata` + plugin-api scripting. Never silently recreate the component.
- **Variable binding fails with "variable does not belong to this collection".** The variable was imported for the wrong mode or scope. Re-check `resolvedType` and `scopes` on the variable before binding; see `references/plugin-api-patterns.md`.
- **Fonts missing.** Call `figma.listAvailableFontsAsync()` and pick the closest published font, or ask the user to install the required font. Never skip `loadFontAsync`.
- **`setProperties` throws "property not found".** The property name is missing its `#id` suffix (BOOLEAN/TEXT/INSTANCE_SWAP) or was passed to a ComponentNode instead of an InstanceNode. Read the instance's `componentPropertyDefinitions` to get the exact keys.
- **Script exceeds 50,000 characters.** Split the work into multiple `use_figma` calls — one concern per call.
- **Review checkpoint reveals layout drift.** Stop adding new content. Fix the existing layout first. Repeated drift usually means a parent frame has fixed sizing where it should hug.

## Escalation to the User

Ask the user before proceeding when:

- The requested design has no analogous pattern in the discovered system and would require creating more than one new component.
- A token needed for the design does not exist (e.g. a new color, a new spacing step).
- The target file is unclear or ambiguous (multiple candidate pages/frames).

Do not invent design decisions silently. Every deviation from the existing system must be visible to the user.
