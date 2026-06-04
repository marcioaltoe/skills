# Skills Audit

Audit date: 2026-06-04

## Scope

Compared the current catalog against skills installed in projects under `/Users/marcio/dev` using `.agents/skills` and `.claude/skills`.

Projects scanned:

- `_boilerplate`
- `conexus`
- `dux`
- `fluxus`
- `gesttione`
- `gss`
- `lexai`
- `onioncry`
- `patrimonius`
- `tax-poc`
- `vortex`

## Summary

| Status         | Count | Rule                                                     |
| -------------- | ----: | -------------------------------------------------------- |
| Installed keep |   128 | Installed in at least one current project.               |
| Manual keep    |     7 | Not installed today, but explicitly kept after review.   |
| Added to base  |     4 | Not installed today, but promoted to `dev-base-skills`.  |
| Specialized    |     7 | Not installed today, but kept under `dev-specialized`.   |
| Removed        |    16 | Not installed today and explicitly removed after review. |

## Outcome

The catalog now has 146 discoverable skills.

## Manual Keep

These are not installed in current projects, but were explicitly kept.

| Skill                                   | Decision |
| --------------------------------------- | -------- |
| `design-product/create-adr`             | Keep.    |
| `design-product/create-rfc`             | Keep.    |
| `design-product/design-spec-extraction` | Keep.    |
| `design-product/figma-design`           | Keep.    |
| `design-product/figma-implement-design` | Keep.    |
| `skills-build/skill-creator`            | Keep.    |
| `write-tech-doc/doc-coauthoring`        | Keep.    |

## Added To Base

These are not installed in current projects, but were promoted to `dev-base-skills`.

| Previous Path                    | Current Path                        |
| -------------------------------- | ----------------------------------- |
| `dev-frontend/core-web-vitals`   | `dev-base-skills/core-web-vitals`   |
| `dev-frontend/web-accessibility` | `dev-base-skills/web-accessibility` |
| `dev-frontend/web-quality-audit` | `dev-base-skills/web-quality-audit` |
| `dev-methods/coding-guidelines`  | `dev-base-skills/coding-guidelines` |

## Specialized

These are not installed in current projects, but were kept in `dev-specialized` for specialized tools, APIs, and frameworks.

| Previous Path                    | Current Path                           |
| -------------------------------- | -------------------------------------- |
| `dev-tools/ai-sdr`               | `dev-specialized/ai-sdr`               |
| `dev-tools/centrifugo`           | `dev-specialized/centrifugo`           |
| `dev-tools/evolution-api`        | `dev-specialized/evolution-api`        |
| `dev-tools/stripe-api-selection` | `dev-specialized/stripe-api-selection` |
| `dev-tools/stripe-integration`   | `dev-specialized/stripe-integration`   |
| `dev-tools/stripe-subscriptions` | `dev-specialized/stripe-subscriptions` |
| `dev-tools/stripe-webhooks`      | `dev-specialized/stripe-webhooks`      |

## Removed

These are not installed in current projects and were removed from the curated catalog.

| Skill                                       | Decision |
| ------------------------------------------- | -------- |
| `dev-frontend/web-best-practices`           | Remove.  |
| `dev-methods/creating-spec`                 | Remove.  |
| `dev-methods/extreme-software-optimization` | Remove.  |
| `dev-methods/legacy-migration-planner`      | Remove.  |
| `dev-tools/codenavi`                        | Remove.  |
| `dev-tools/gh-address-comments`             | Remove.  |
| `dev-tools/gh-fix-ci`                       | Remove.  |
| `dev-tools/jira-assistant`                  | Remove.  |
| `productivity/excalidraw-studio`            | Remove.  |
| `write-marketing/ai-pricing`                | Remove.  |
| `write-marketing/gtm-engineering`           | Remove.  |
| `write-marketing/gtm-metrics`               | Remove.  |
| `write-marketing/landing-page-design`       | Remove.  |
| `write-marketing/multi-platform-launch`     | Remove.  |
| `write-marketing/paid-creative-ai`          | Remove.  |
| `write-marketing/partner-affiliate`         | Remove.  |
