# Final Audit Checklist

Run this audit once, right before reporting completion to the user. Every item must pass. Fix violations with an additional `use_figma` call and re-run the audit until every item is green.

## Variables and Tokens

- [ ] **No hardcoded colors.** Every `fills[0]` and `strokes[0]` is either variable-bound (via `setBoundVariableForPaint`) or references a published paint style. Raw hex/rgb values are rejected.
- [ ] **No hardcoded spacing.** Every `paddingLeft/Right/Top/Bottom` and `itemSpacing` is either variable-bound or explicitly matches a documented spacing token in the design system reference.
- [ ] **No hardcoded radius.** Every `cornerRadius` (or `topLeftRadius`/`topRightRadius`/`bottomLeftRadius`/`bottomRightRadius`) is variable-bound or matches a documented radius token.
- [ ] **Stroke weight bound** where applicable (e.g. `strokeWeight` references a border-width variable if one exists).

## Components and Reuse

- [ ] **Every design system component is used as an instance.** Walk the target frame and check `node.type === 'INSTANCE'` for every button, input, card, badge, tab, etc. Any match that is a `FRAME` built from primitives is a violation — replace with an import.
- [ ] **Variants and component properties used** instead of duplicated frames. If there are multiple copies of "Button Primary", "Button Primary Hover", "Button Primary Disabled", they must collapse into one instance with `setProperties({State: '...'})`.
- [ ] **New assets justified.** Every frame/component created fresh (not imported) must have a written justification in the final report. Count should ideally be zero.

## Auto-Layout and Sizing

- [ ] **Every container frame has `layoutMode !== 'NONE'`.** Manual positioning is rejected.
- [ ] **`layoutSizingHorizontal` and `layoutSizingVertical` set intentionally** (`FILL`/`HUG`/`FIXED`) on every frame. No stale defaults.
- [ ] **No orphan children** positioned via `x`/`y` outside of `layoutPositioning = 'ABSOLUTE'` contexts.
- [ ] **Parents with absolute children** have `clipsContent = false` if the child extends past the bounds.

## Text and Typography

- [ ] **Every visible text node has a text style applied** (`textStyleId !== ''`) OR the divergence is explicitly flagged in the final report.
- [ ] **No missing fonts** — check `text.hasMissingFont === false` on every text node.
- [ ] **Font families match the design system** — no ad-hoc fonts introduced.

## Naming and Structure

- [ ] **Semantic names.** Frame names match engineering component names (e.g. `CardStat`, `SidebarNavItem`), not generic labels like `Frame 1`, `Rectangle 3`, `Group 17`.
- [ ] **Consistent hierarchy.** Atoms inside molecules inside organisms inside screens. No molecule nested five levels deep inside another molecule without reason.

## Visual Review

- [ ] **Final `get_screenshot` captured** of the top-level target frame.
- [ ] **All six review criteria pass** (spacing, typography, contrast, alignment, clipping, repetition) per `references/review-checklist.md`.

## Reporting

- [ ] **Final report lists:** fileKey, primary nodeId, count of components reused, count of variables bound, count of new assets created (with justification), and the final screenshot.
- [ ] **Deviations flagged.** Any decision that diverged from the discovered design system is called out explicitly, not hidden.

## Escalation Triggers

Stop the audit and escalate to the user if any of these are true:

- More than two new components had to be created from scratch.
- A requested token does not exist in the design system.
- The target file or node is ambiguous and cannot be resolved without input.
- The final screenshot shows a layout that clearly drifts from the user's stated intent.
