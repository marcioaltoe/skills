# [Frontend Area] Gap Analysis

| Field          | Value                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Audience       | [Maintainers / tech lead / design-system owner / QA]                                 |
| Scope          | [App, route group, domain system, component set, state layer, or design-system area] |
| Last reviewed  | YYYY-MM-DD                                                                           |
| Analysis depth | [Quick scan / targeted review / full audit]                                          |

## Executive Summary

| Metric            | Value  |
| ----------------- | ------ |
| Critical findings | 0      |
| High findings     | 0      |
| Medium findings   | 0      |
| Low findings      | 0      |
| Highest-risk area | [Area] |

[One paragraph summarizing current health, main risks, and the most useful next action.]

## Evidence Reviewed

| Source               | Purpose             |
| -------------------- | ------------------- |
| `path/to/file.tsx:1` | [What was reviewed] |

## DESIGN.md Compliance

Use this section only when root `DESIGN.md` exists.

| Check                 | Result                | Evidence      | Gap           |
| --------------------- | --------------------- | ------------- | ------------- |
| DESIGN.md loaded      | [Pass/fail]           | `DESIGN.md:1` | [Gap or none] |
| TSX token/color scan  | [Pass/fail/exception] | `path.tsx:1`  | [Gap or none] |
| TSX inline style scan | [Pass/fail/exception] | `path.tsx:1`  | [Gap or none] |
| CSS token scan        | [Pass/fail/exception] | `path.css:1`  | [Gap or none] |
| Icon/copy/a11y rules  | [Pass/fail/partial]   | `path.tsx:1`  | [Gap or none] |

## UI Quality Gap Checks

Use this section when the scope includes visible UI. Keep rows objective; cite code, tests, stories, docs, or rendered verification when available.

| Check                                      | Result              | Evidence     | Gap           |
| ------------------------------------------ | ------------------- | ------------ | ------------- |
| Surface job and hierarchy                  | [Pass/fail/partial] | `path.tsx:1` | [Gap or none] |
| State matrix coverage                      | [Pass/fail/partial] | `path.tsx:1` | [Gap or none] |
| Accessibility floor                        | [Pass/fail/partial] | `path.tsx:1` | [Gap or none] |
| Token discipline and visual values         | [Pass/fail/partial] | `path.tsx:1` | [Gap or none] |
| Microcopy and anti-defaults                | [Pass/fail/partial] | `path.tsx:1` | [Gap or none] |
| Motion, dark mode, responsive, performance | [Pass/fail/partial] | `path.css:1` | [Gap or none] |

## Findings

### [Severity] [Finding Title]

- **Type**: Project rule | Architecture | Feature system | React | Vite/build | Routing | Data | State | UI quality | Design system | Accessibility | Testing | Performance
- **Evidence**: `path/to/file.tsx:1`
- **Observed**: [What the code or docs show.]
- **Impact**: [Why it matters.]
- **Recommendation**: [Smallest useful next step.]
- **Confidence**: High | Medium | Low

## Gap Matrix

| Area                 | Current state | Gap   | Impact   | Priority | Next action |
| -------------------- | ------------- | ----- | -------- | -------- | ----------- |
| Project rules        | [Observed]    | [Gap] | [Impact] | High     | [Action]    |
| Architecture         | [Observed]    | [Gap] | [Impact] | High     | [Action]    |
| Feature system       | [Observed]    | [Gap] | [Impact] | High     | [Action]    |
| Vite/build           | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| Routing              | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| Data fetching        | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| State                | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| Components           | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| UI quality           | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| Design system        | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| DESIGN.md compliance | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |
| Accessibility        | [Observed]    | [Gap] | [Impact] | High     | [Action]    |
| Tests/stories        | [Observed]    | [Gap] | [Impact] | Medium   | [Action]    |

## Positive Patterns

| Pattern   | Evidence | Why it helps |
| --------- | -------- | ------------ |
| [Pattern] | `path`   | [Impact]     |

## Recommended Plan

| Order | Action   | Owner   | Expected impact | Verification    |
| ----- | -------- | ------- | --------------- | --------------- |
| 1     | [Action] | [Owner] | [Impact]        | [How to verify] |

## Unknowns

| Unknown   | Why it matters | How to resolve |
| --------- | -------------- | -------------- |
| [Unknown] | [Impact]       | [Next step]    |

## Maintenance

Re-run this analysis when frontend rules change, major systems are refactored, route/data contracts change, or repeated defects point to missing documentation.
