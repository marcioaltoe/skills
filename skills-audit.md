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

| Status | Count | Rule                                                                  |
| ------ | ----: | --------------------------------------------------------------------- |
| Keep   |   128 | Installed in at least one current project.                            |
| Review |    17 | Not installed today, but potentially strategic or high-value.         |
| Remove |    17 | Not installed today and low-risk to remove from this curated catalog. |

## Outcome

Removed the 17 low-risk candidates in this pass. The catalog now has 145 discoverable skills. The remaining unused skills are the 17 entries in `Review`.

## Review

These are not installed in current projects, but should be reviewed manually before deletion.

| Skill                                   | Reason                                                  |
| --------------------------------------- | ------------------------------------------------------- |
| `design-product/create-adr`             | Useful for architecture decision records.               |
| `design-product/create-rfc`             | Useful for proposal and alignment docs.                 |
| `design-product/design-spec-extraction` | Useful if visual-to-spec workflows remain relevant.     |
| `design-product/figma-design`           | Useful if Figma MCP design generation remains relevant. |
| `design-product/figma-implement-design` | Useful if Figma-to-code work remains relevant.          |
| `dev-frontend/core-web-vitals`          | Useful for focused performance work.                    |
| `dev-frontend/web-accessibility`        | Useful for focused accessibility work.                  |
| `dev-frontend/web-quality-audit`        | Useful for broad web audits.                            |
| `dev-tools/gh-address-comments`         | Useful for GitHub PR review workflows.                  |
| `dev-tools/gh-fix-ci`                   | Useful for GitHub Actions debugging.                    |
| `dev-tools/jira-assistant`              | Useful if Jira remains part of project operations.      |
| `dev-tools/stripe-api-selection`        | Useful for payment integration decisions.               |
| `dev-tools/stripe-integration`          | Useful for payment integration implementation.          |
| `dev-tools/stripe-subscriptions`        | Useful for subscription billing implementation.         |
| `dev-tools/stripe-webhooks`             | Useful for Stripe webhook handling.                     |
| `skills-build/skill-creator`            | Useful for future skill creation and optimization.      |
| `write-tech-doc/doc-coauthoring`        | Useful for structured documentation collaboration.      |

## Remove

These were removed because they are not installed in current projects and are either narrow, overlapping, stale, or not part of the current curated set.

| Skill                                       | Reason                                                            |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `dev-frontend/web-best-practices`           | Overlaps with focused frontend audit/review skills.               |
| `dev-methods/coding-guidelines`             | Generic behavior guidance; not installed anywhere.                |
| `dev-methods/creating-spec`                 | Overlaps with existing technical documentation/spec skills.       |
| `dev-methods/extreme-software-optimization` | Unused and has broken frontmatter description.                    |
| `dev-methods/legacy-migration-planner`      | Unused specialized migration workflow.                            |
| `dev-tools/ai-sdr`                          | Unused specialized GTM tooling.                                   |
| `dev-tools/centrifugo`                      | Unused specialized realtime server skill.                         |
| `dev-tools/codenavi`                        | Unused code-navigation workflow overlapping with base dev skills. |
| `dev-tools/evolution-api`                   | Unused specialized API skill.                                     |
| `productivity/excalidraw-studio`            | Unused diagramming workflow.                                      |
| `write-marketing/ai-pricing`                | Unused marketing strategy skill.                                  |
| `write-marketing/gtm-engineering`           | Unused GTM automation strategy skill.                             |
| `write-marketing/gtm-metrics`               | Unused GTM metrics strategy skill.                                |
| `write-marketing/landing-page-design`       | Unused marketing page skill.                                      |
| `write-marketing/multi-platform-launch`     | Unused product launch skill.                                      |
| `write-marketing/paid-creative-ai`          | Unused paid creative strategy skill.                              |
| `write-marketing/partner-affiliate`         | Unused partner/affiliate strategy skill.                          |
