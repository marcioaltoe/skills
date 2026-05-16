# Anti-Patterns to Prevent

Every item below is a concrete failure mode observed when LLMs drive the Figma MCP. Read this file once before starting any non-trivial design task, and again whenever a review checkpoint fails.

## Discovery Anti-Patterns

**Building from scratch without searching first.**
Jumping straight to `figma.createFrame()` + `createRectangle()` + `createText()` to "make a button" when a Button component already exists in the library. Fix: always run `search_design_system` with 2–3 synonym queries before creating anything.

**Declaring "no tokens exist" from an empty local result.**
`figma.variables.getLocalVariableCollectionsAsync()` returns `[]` for imported library variables. An empty local result is meaningless — the tokens are in the team library. Fix: use `search_design_system({includeVariables: true})` or `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()`.

**Trusting a single search query.**
Searching `"button"` and concluding no primary button exists when the asset is named `CTA`, `Action`, or `PrimaryAction`. Fix: run at least three synonym queries per asset kind.

## Token Anti-Patterns

**Hardcoded hex values in fills.**
`node.fills = [{ type: 'SOLID', color: { r: 0.02, g: 0.47, b: 1 } }]`. This drifts from the system the moment the brand palette shifts. Fix: `importVariableByKeyAsync` + `setBoundVariableForPaint`.

**Hardcoded pixel values for spacing, radius, stroke.**
`frame.itemSpacing = 17`, `frame.paddingLeft = 15`, `frame.cornerRadius = 11`. Odd values are a signal that no token lookup happened. Fix: bind to spacing/radius variables via `setBoundVariable`.

**Inventing token names.**
Guessing `--color-primary-600` when the actual variable is `Brand/primary`. The script will fail at import time. Fix: always copy the exact `key` returned by `search_design_system`.

**Placeholder colors treated as real colors.**
Inside `setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable)`, the `r/g/b` fields are IGNORED but required by the API. Treating them as meaningful and trying to match the variable's value is wasted effort.

## Component Anti-Patterns

**Rebuilding library components from primitives.**
Assembling "Button" as `createFrame` + `createRectangle` (background) + `createText` (label) instead of importing the published Button. Fix: `importComponentByKeyAsync` + `createInstance`. No exceptions.

**Duplicating frames to represent states.**
Creating `Button`, `Button-Hover`, `Button-Disabled` as three sibling frames instead of one instance with `setProperties({ State: 'Hover' })`. Fix: use component variants.

**Calling `setProperties` on `ComponentNode`.**
Remote/imported components are read-only ComponentNodes. Only `InstanceNode` (returned by `createInstance()`) has `setProperties`. Fix: instantiate first.

**Omitting `#id` suffix on BOOLEAN/TEXT/INSTANCE_SWAP properties.**
`instance.setProperties({ Label: 'Save' })` fails — the real key is `Label#12:1`. Fix: read `instance.componentPropertyDefinitions` and copy the exact key (only VARIANT uses bare names).

## Layout Anti-Patterns

**Manual `x`/`y` positioning for layout.**
Positioning children with `child.x = 20; child.y = 40` on a frame with `layoutMode = 'NONE'`. Fix: set `layoutMode` on the parent and use padding/itemSpacing/alignment.

**Setting padding before `layoutMode`.**
Setting `frame.paddingLeft = 16` on a frame that still has `layoutMode = 'NONE'` — the padding is silently ignored. Fix: set `layoutMode` FIRST, then padding/spacing.

**Using legacy sizing modes where modern API is clearer.**
`frame.primaryAxisSizingMode = 'AUTO'`. The modern API (`layoutSizingHorizontal`, `layoutSizingVertical` with `FIXED`/`HUG`/`FILL`) is clearer and avoids confusion about which axis is which.

**Toggling `layoutMode` off and on.**
Removing auto-layout does NOT restore children to their original positions — they collapse to `0,0`. Never "reset" a frame this way.

**Fighting auto-layout with negative margins or invisible spacers.**
Inserting a 1x1 transparent rectangle to push another element right. Fix: use `itemSpacing`, or promote the target to `layoutPositioning = 'ABSOLUTE'` inside an auto-layout parent.

## Text Anti-Patterns

**Setting `characters` before `loadFontAsync`.**
Throws `In order to set this property, please call loadFontAsync`. Fix: always `await figma.loadFontAsync(text.fontName)` (or the specific font) before any text mutation.

**Manual font overrides on top of a design system style.**
Applying `Body/MD` style, then overriding `fontSize = 15` because the Figma design "needed it bigger". This breaks the type scale. Fix: pick a different style from the scale (`Body/LG`, `Display/SM`).

**Mixed-font updates without loading all fonts first.**
Updating a text node that has multiple fonts in different ranges without calling `getRangeAllFontNames` + `Promise.all(loadFontAsync)` first. Fix: load every font in the range before mutating `characters`.

**Using font-style names with wrong casing.**
`'SemiBold'` instead of `'Semi Bold'`, `'ExtraBold'` instead of `'Extra Bold'`. Fix: verify exact spelling via `figma.listAvailableFontsAsync()`.

## Script Shape Anti-Patterns

**Single mega-script doing everything.**
One 2000-line `use_figma` call that imports variables, imports components, creates a page, builds six sections, and sets every property. When it fails, there is no way to diagnose which step broke. Fix: one logical concern per `use_figma` call (tokens, then components, then each section).

**No checkpoints.**
Building the entire design and only calling `get_screenshot` at the end. Drift is invisible until it is baked in. Fix: `get_screenshot` every 2–3 mutations.

**Script exceeds 50,000 characters.**
The `use_figma.code` parameter has a hard 50k cap. Scripts that approach it are almost always doing too much. Fix: split into multiple calls.

## Reporting Anti-Patterns

**Silent deviations from the design system.**
Using a slightly different shade because "the token was close but not quite right," without telling the user. Fix: every deviation must be called out in the final report.

**Claiming completion without a final screenshot.**
Marking the task done based on the JS script exiting without error. Plugin API calls can succeed while producing a visually broken result. Fix: final `get_screenshot` + six-criterion review are non-negotiable.

**Reporting component counts by node count, not by reuse.**
"Created 47 nodes!" is not a success metric. "Reused 8 library components, bound 12 variables, created 0 new assets" is. Fix: report reuse, not volume.
