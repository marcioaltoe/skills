# Source Skill Map

This backend-docs skill is assembled from existing skills in this repository. Use this map to decide which source skill to consult when a document needs deeper guidance.

Paths are relative to the `skills/backend/backend-docs/` skill root.

## Skill Authoring Sources

| Source skill         | Path                                     | What was reused                                                                       |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| skill-architect      | `../../ai/skill-architect/SKILL.md`      | Discovery, architecture, craft, validate flow; progressive disclosure; trigger design |
| skill-best-practices | `../../ai/skill-best-practices/SKILL.md` | Metadata validation, lean structure, bundled references, no extra human docs          |
| skill-creator        | `../../ai/skill-creator/SKILL.md`        | Eval-ready design, realistic test prompts, iterative improvement path                 |

## Documentation Sources

| Source skill                  | Path                                                   | Use when                                                                                                |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| docs-writer                   | `../../writing/docs-writer/SKILL.md`                   | General Markdown documentation writing or editing discipline                                            |
| crafting-effective-readmes    | `../../writing/crafting-effective-readmes/SKILL.md`    | Onboarding docs overlap with README setup or internal project overview                                  |
| writing-clearly-and-concisely | `../../writing/writing-clearly-and-concisely/SKILL.md` | Polishing prose for humans                                                                              |
| technical-design-doc-creator  | `../../writing/create-technical-design-doc/SKILL.md`   | Architecture/design docs need implementation planning, risks, rollout, monitoring, or rollback sections |
| create-adr                    | `../../writing/create-adr/SKILL.md`                    | A discovered decision should be recorded separately as an ADR                                           |
| create-rfc                    | `../../writing/create-rfc/SKILL.md`                    | A recommendation needs stakeholder alignment before implementation                                      |

## Codebase Discovery Sources

| Source skill  | Path                                       | Use when                                                                              |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| codenavi      | `../../development/codenavi/SKILL.md`      | Investigating unfamiliar backend flows from entry point to behavior                   |
| find-rules    | `../../development/find-rules/SKILL.md`    | Discovering AGENTS, CLAUDE, Cursor rules, architecture rules, and project conventions |
| evidence-gate | `../../development/evidence-gate/SKILL.md` | Confirming docs work with available checks before claiming completion                 |

## Backend and Architecture Sources

| Source skill                    | Path                                                          | Use when                                                                               |
| ------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| hono-api-best-practices         | `../hono-api-best-practices/SKILL.md`                         | Hono, Zod OpenAPI, POST-only action APIs, generated Scalar/OpenAPI docs, API envelopes |
| hono                            | `../hono/SKILL.md`                                            | Hono CLI docs lookup and request testing                                               |
| zod                             | `../zod/SKILL.md`                                             | Request/response schema validation and type inference docs                             |
| drizzle-orm                     | `../drizzle-orm/SKILL.md`                                     | Database schema, query, transaction, migration, and backfill documentation             |
| nestjs-modular-monolith         | `../nestjs-modular-monolith/SKILL.md`                         | NestJS modular monolith, DDD, Clean Architecture, and CQRS documentation               |
| domain-analysis                 | `../../architecture/domain-analysis/SKILL.md`                 | Strategic DDD and bounded context analysis                                             |
| tactical-ddd                    | `../../architecture/tactical-ddd/SKILL.md`                    | Anemic model and tactical DDD findings                                                 |
| coupling-analysis               | `../../architecture/coupling-analysis/SKILL.md`               | Coupling, integration strength, distance, and volatility findings                      |
| component-identification-sizing | `../../architecture/component-identification-sizing/SKILL.md` | Component inventory and oversized module analysis                                      |
| architectural-analysis          | `../../architecture/architectural-analysis/SKILL.md`          | Dead code, duplication, type confusion, code smells, and structural audit patterns     |
| mermaid-syntax                  | `../../tools/mermaid-syntax/SKILL.md`                         | Mermaid diagrams for architecture, sequence, ERD, and C4-style views                   |

## External Research Touchpoints

Use official sources when current or external documentation principles are needed:

- Diataxis: https://diataxis.fr/
- arc42: https://arc42.org/documentation/
- C4 model: https://c4model.com/

Do not load external research for every invocation. The distilled rules in `documentation-principles.md` are enough for normal backend documentation work.

Use `framework-contract-notes.md` when a selected document needs concrete Hono, Zod/OpenAPI, Drizzle, or migration evidence. The notes are intentionally compact so API and data docs can stay objective without live research on every run.
