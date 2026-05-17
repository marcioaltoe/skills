# Composition Plan — {{DESIGN_NAME}}

Fill this template during Step 3 of the figma-design skill. Share with the user before executing `use_figma` when the scope is non-trivial.

## Goal

One sentence describing what is being designed.

## Target

- **fileKey:** `{{FILE_KEY}}`
- **Target page:** `{{PAGE_NAME}}` (node id `{{PAGE_NODE_ID}}`)
- **Target frame:** `{{FRAME_NAME}}` (node id `{{FRAME_NODE_ID}}`, or "new frame")

## Inventory Pulled From `search_design_system`

### Variables (tokens to bind)

| Variable            | Key       | Purpose in this design |
| ------------------- | --------- | ---------------------- |
| `{{variable-name}}` | `{{key}}` | {{where used}}         |

### Components (instances to import)

| Component           | Key       | Variants used               | Properties set           |
| ------------------- | --------- | --------------------------- | ------------------------ |
| `{{ComponentName}}` | `{{key}}` | `{{Variant=..., Size=...}}` | `{{Label#id, State#id}}` |

### Text styles

| Style            | Applied to  |
| ---------------- | ----------- |
| `{{Display/LG}}` | {{element}} |

## Composition Tree

```
{{ScreenFrame}} (auto-layout VERTICAL, HUG, padding 32/24, gap 24)
├── {{Header}} (auto-layout HORIZONTAL, FILL/HUG, padding 0, gap 16)
│   ├── {{PageTitle}} (text, Display/LG)
│   └── {{ActionButton}} (INSTANCE of Button, Variant=Default Size=md)
├── {{StatRow}} (auto-layout HORIZONTAL, FILL/HUG, padding 0, gap 16)
│   ├── {{StatCard}} (INSTANCE of CardStat)
│   ├── {{StatCard}} (INSTANCE of CardStat)
│   └── {{StatCard}} (INSTANCE of CardStat)
└── {{Content}} (auto-layout VERTICAL, FILL/HUG, padding 0, gap 16)
    └── ...
```

## New Assets (should be empty or exceptional)

List anything that will be created fresh rather than imported. Each entry must justify why no existing asset fits.

- `{{NewAssetName}}` — {{justification: why no library asset works}}

## Deviations From The Design System

List any decision that departs from the discovered system. Each must be flagged to the user.

- `{{decision}}` — {{why}}

## Execution Order

Number the `use_figma` calls that will run, one concern per call:

1. Import tokens: `{{list}}`
2. Import components: `{{list}}`
3. Create target frame with auto-layout
4. Build section A: `{{StatRow}}`
5. Build section B: `{{Content}}`
6. Review checkpoint (`get_screenshot` + 6-criterion review)
7. Build section C: `{{Footer}}`
8. Final audit
