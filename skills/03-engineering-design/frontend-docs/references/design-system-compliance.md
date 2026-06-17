# Design System Compliance

Use this reference whenever a root `DESIGN.md` exists or the selected document mentions design-system compliance, token usage, visual rules, UI gaps, component systems, or frontend quality.

`DESIGN.md` is normative when present. The generated documentation must say whether the frontend follows it, where it diverges, and which findings are only possible exceptions.

## Required Evidence

Collect:

- Root `DESIGN.md` rules for colors, tokens, typography, spacing, radius, motion, iconography, copy, accessibility, and component/file ownership.
- Token implementation files such as `src/index.css`, `tailwind.config.*`, CSS `@theme`, `:root` variables, token constants, or design-system packages.
- TSX components, wrappers, SVGs, icon usage, and inline styles.
- Surface CSS and global CSS.
- Stories/tests or rendered verification when the document claims behavior across states or viewports.

## Required TSX Scans

Run targeted searches or equivalent inspection for:

- Raw colors in TSX: hex, rgb/rgba, hsl/hsla, inline SVG `fill`/`stroke`, and hard-coded color utilities such as `bg-white`, `text-black`, `border-gray-*`, `bg-blue-*`, `text-red-*`.
- Inline styles in TSX: `style={{ ... }}`. Classify whether each value is dynamic/positional and documented, or an avoidable magic spacing/sizing/radius/color value.
- Dynamic Tailwind class construction: template strings that produce incomplete class names such as `` `bg-${color}-500` ``.
- Icon family usage: verify it follows `DESIGN.md` or local icon rules.
- Typography/copy rules in TSX when `DESIGN.md` defines casing, language, labels, status names, or CTA patterns.

Example search pattern:

```text
#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|bg-white|text-black|border-gray|bg-gray|text-gray|bg-blue|text-blue|border-blue|bg-red|text-red|border-red|bg-green|text-green|border-green|style=\{\{
```

Treat this as a discovery aid, not as the full audit. Read the matched files before reporting a finding.

## Required CSS/Token Scans

Check:

- Token files define the design-system source of truth.
- Component/surface CSS uses `var(--token)` or approved framework tokens rather than repeated raw literals.
- Tailwind classes map to project tokens when the project uses Tailwind.
- Spacing, radii, shadows, motion, typography, and breakpoints follow `DESIGN.md`.
- Reduced motion, focus-visible, contrast, target size, and status-by-more-than-color rules are represented where relevant.

## Exception Rules

Do not silently accept exceptions. Classify them:

| Case                                        | Accept only when                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| SVG/canvas cannot resolve CSS variables     | A project-approved constant or documented escape hatch is used.                |
| Third-party brand logo uses official colors | The code or document names it as external brand artwork and keeps it isolated. |
| Inline style controls dynamic geometry      | It is positional/dynamic, not a design-token value that belongs in CSS.        |
| Raw CSS literal appears in token source     | It defines a token, not a component-level value.                               |

If an exception is plausible but undocumented, report it as an unknown or low/medium design-system finding.

## Output Requirements

When root `DESIGN.md` exists, include a design-system compliance row or finding in gap-analysis output.

Minimum table:

| Check                 | Result                | Evidence      | Gap           |
| --------------------- | --------------------- | ------------- | ------------- |
| DESIGN.md loaded      | [Pass/fail]           | `DESIGN.md:1` | [Gap or none] |
| TSX token/color scan  | [Pass/fail/exception] | `path.tsx:1`  | [Gap or none] |
| TSX inline style scan | [Pass/fail/exception] | `path.tsx:1`  | [Gap or none] |
| CSS token scan        | [Pass/fail/exception] | `path.css:1`  | [Gap or none] |
| Icon/copy/a11y rules  | [Pass/fail/partial]   | `path.tsx:1`  | [Gap or none] |

If no issue is found, state that explicitly with evidence for the scans performed.
