# Source Skill Map

This skill distills guidance that originated in other skills. When a document needs deeper guidance than the distilled rules here, consult the source skill **by name** through the agent's skill mechanism — never by relative path; which skills are installed differs per project, and a named skill that is absent simply doesn't load.

## Documentation and writing

| Skill                           | Use when                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `tech-writer`                   | A doc needs full writing discipline: structure, altitude control, verification |
| `crafting-effective-readmes`    | Onboarding docs overlap with README setup or internal project overview         |
| `writing-clearly-and-concisely` | Polishing prose for humans                                                     |
| `write-techspec`                | Architecture/design docs need implementation planning, risks, or a build order |
| `doc-coauthoring`               | The document is being co-authored interactively with the user                  |

## Codebase discovery

| Skill           | Use when                                                                              |
| --------------- | ------------------------------------------------------------------------------------- |
| `find-rules`    | Discovering AGENTS, CLAUDE, Cursor rules, architecture rules, and project conventions |
| `evidence-gate` | Confirming docs work with available checks before claiming completion                 |

## Backend and architecture

| Skill                                               | Use when                                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `hono-api-best-practices`, `hono`, `zod`            | API contract docs: Hono routes, Zod/OpenAPI schemas, envelopes, generated API reference |
| `drizzle-orm`                                       | Database schema, query, transaction, migration, and backfill documentation              |
| `domain-modeling`                                   | Bounded contexts, `CONTEXT.md` glossary, ubiquitous-language capture                    |
| `tactical-ddd`                                      | Anemic-model and tactical DDD findings                                                  |
| `architectural-analysis`                            | Dead code, duplication, type confusion, code smells, and structural audits              |
| `clean-architecture`, `vertical-slice-architecture` | Layering and slice-structure documentation                                              |
| `mermaid-studio`                                    | Mermaid diagrams for architecture, sequence, ERD, and C4-style views                    |

## External research touchpoints

Use official sources when current or external documentation principles are needed:

- Diataxis: https://diataxis.fr/
- arc42: https://arc42.org/documentation/
- C4 model: https://c4model.com/

Do not load external research for every invocation. The distilled rules in `documentation-principles.md` are enough for normal backend documentation work.

Use `framework-contract-notes.md` when a selected document needs concrete Hono, Zod/OpenAPI, Drizzle, or migration evidence. The notes are intentionally compact so API and data docs can stay objective without live research on every run.
