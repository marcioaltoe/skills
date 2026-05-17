# Documentation Principles

Use these principles to keep backend documentation useful without making it heavy.

## Content Type First

Choose one primary documentation need before writing:

| Need          | Reader question                            | Good output                                        |
| ------------- | ------------------------------------------ | -------------------------------------------------- |
| Learning      | "Can you teach me how this backend works?" | Onboarding guide with a guided path                |
| Work          | "How do I do this task safely?"            | Focused how-to or runbook steps                    |
| Information   | "What exists and how does it behave?"      | API, schema, component, or configuration reference |
| Understanding | "Why is it designed this way?"             | Architecture/design explanation with trade-offs    |

Avoid mixing all four needs in one document. If a section drifts into another need, add a link or a follow-up item instead of expanding the document.

Source basis: Diataxis documentation model, which separates tutorials, how-to guides, reference, and explanation by reader need.

## Lean Architecture Documentation

For architecture and design docs, include only information stakeholders need to understand, operate, or change the backend.

Useful sections, adapted from arc42:

- Goals and non-goals.
- Constraints and project rules.
- Context and external systems.
- Building blocks and ownership.
- Runtime flows.
- Deployment and operational view.
- Cross-cutting concepts such as auth, validation, persistence, errors, observability, and testing.
- Architecture decisions and trade-offs.
- Risks, technical debt, and known gaps.
- Glossary.

Do not generate every section by default. Select the smallest subset that answers the user's chosen document type.

## Diagrams

Use Mermaid diagrams when they reduce ambiguity. Prefer C4-style levels:

- Context: the backend and adjacent users/systems.
- Container: backend apps, databases, queues, external APIs, workers.
- Component: internals of one backend container or bounded context.
- Dynamic or sequence: runtime flow for a request, event, webhook, job, or migration.

Most backend docs need at most context, container, and one runtime flow. Avoid code-level diagrams unless the user asks for deep design detail.

Good diagrams:

- Define scope and audience.
- Label relationships.
- Avoid mixing abstraction levels.
- Explain notation if colors or line styles carry meaning.
- Use names from the codebase or ubiquitous language.

## Evidence and Maintenance

Backend docs decay quickly when they describe intention without source links. For every non-obvious claim, cite:

- Source file and line when available.
- Existing docs, ADRs, or project rules.
- Runtime command output, generated OpenAPI, tests, or migration files.

If evidence is missing, write "Unknown" or "Needs confirmation" with a specific next step.

End every document with:

- Last reviewed date.
- Scope covered.
- What should trigger an update.

## Writing Style

- Use active voice.
- Prefer concrete nouns over vague abstractions.
- Keep sections short.
- Put inventories and findings in tables.
- Avoid "robust", "seamless", "powerful", and similar filler.
- Write for the selected reader, not for every possible stakeholder.
