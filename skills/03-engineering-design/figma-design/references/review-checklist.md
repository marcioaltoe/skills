# Per-Checkpoint Visual Review Criteria

Run this checklist after every 2–3 `use_figma` mutations. Capture a fresh `get_screenshot` of the current target frame and evaluate each criterion. Summarise each as a one-line verdict. Fix every issue before the next mutation.

## 1. Spacing

**Check:** Are gaps between elements consistent and intentional? Are groups cramped or do sections feel unintentionally empty? Is there a clear visual rhythm across the frame?

**Common failures:**

- Mixed spacing values within one section (8px, 10px, 12px instead of all 12px).
- Components flush against frame edges because padding was not applied.
- `itemSpacing = 0` where a gap was intended.

**Fix:** Re-bind `paddingLeft/Right/Top/Bottom` and `itemSpacing` to the documented spacing variables. Remove any raw pixel values.

## 2. Typography

**Check:** Is text readable at its rendered size? Is there clear hierarchy between heading, body, and caption? Are line-heights comfortable?

**Common failures:**

- Body text smaller than 12px.
- Heading and body using the same size and weight (no hierarchy).
- Line-height too tight (`lineHeight: AUTO` on a display font).
- Wrong font family loaded because of a typo (e.g. `'Inter Semi Bold'` instead of family `Inter` + style `Semi Bold`).

**Fix:** Apply the correct text style via `setTextStyleIdAsync`. Never set fontSize/fontName directly on top of a design system style.

## 3. Contrast

**Check:** Does every text element meet the background it sits on? Do elements blend into their surrounding area? Is color being used intentionally or uniformly?

**Common failures:**

- `muted-foreground` token applied to body text on `muted` background — both are low-contrast.
- Primary brand color used for every accent, causing visual noise.
- Borders invisible because they use the same variable as the background.

**Fix:** Verify each `setBoundVariableForPaint` call uses the correct semantic token (`foreground` on `background`, `muted-foreground` on `card`, not swapped). Check the file's `DESIGN.md` or token reference frame for correct pairings.

## 4. Alignment

**Check:** Do elements that should share a vertical or horizontal lane actually share it? Are icons and actions aligned across repeated rows?

**Common failures:**

- Repeated rows (list items, table rows) where each row's leading icon sits at a different x because padding differs.
- Form field labels not aligned because some use `primaryAxisAlignItems: 'CENTER'` and others `'MIN'`.
- Header title and subtitle not sharing a counter-axis anchor.

**Fix:** Ensure repeated containers share the same `layoutMode`, `primaryAxisAlignItems`, `counterAxisAlignItems`, and padding. Promote the row into a component if it will repeat more than twice.

## 5. Clipping

**Check:** Is any content cut off at a container or artboard edge? Do text labels truncate when they should not?

**Common failures:**

- Fixed-width frame clipping long labels.
- Parent frame with `layoutSizingVertical = 'FIXED'` cutting off children when content grows.
- `clipsContent = true` on a frame that contains an absolutely-positioned badge extending past its bounds.

**Fix:** If the content SHOULD fit, switch the overflowing dimension to `HUG` (`layoutSizingHorizontal = 'HUG'` or `layoutSizingVertical = 'HUG'`). Never hardcode a bigger fixed size as a workaround. If the overflow is intentional (e.g. a decorative badge), set `clipsContent = false` on the parent.

## 6. Repetition

**Check:** Does the frame feel overly grid-like, with every element at the same scale and weight? Is there any visual interest?

**Common failures:**

- A dashboard of 8 stat cards with identical size, weight, and color — no focal point.
- A list where every item has the same icon, same label weight, same action — no rhythm.
- All headings at the same size.

**Fix:** Vary scale, weight, or spacing deliberately. Promote the primary metric, demote secondary ones. Use the typography scale to express hierarchy.

## Verdict Format

After evaluating, report verdicts in this format:

```
Spacing:    PASS — consistent 16px gaps, padding bound to space-16 token
Typography: FAIL — body text at 11px, below minimum 12px → fixing
Contrast:   PASS — foreground on background, muted-fg on muted-bg
Alignment:  PASS — all rows share primaryAxisAlignItems: 'CENTER'
Clipping:   PASS — hug sizing on the main column
Repetition: FAIL — all four cards identical weight → promoting hero card
```

Then fix every `FAIL` before continuing to the next mutation batch.
