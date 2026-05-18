# Documentation Principles

Use these principles to keep frontend documentation useful without making it heavy.

## Content Type First

Choose one primary documentation need before writing:

| Need          | Reader question                             | Good output                                         |
| ------------- | ------------------------------------------- | --------------------------------------------------- |
| Learning      | "Can you teach me how this frontend works?" | Onboarding guide with a guided path                 |
| Work          | "How do I safely change this UI?"           | Focused how-to or workflow steps                    |
| Information   | "What exists and how does it behave?"       | Route, state, component, or design-system reference |
| Understanding | "Why is it structured this way?"            | Architecture/design explanation with trade-offs     |

Avoid mixing all four needs in one document. If a section drifts into another need, add a link or follow-up item instead of expanding the document.

## Lean Frontend Documentation

For architecture and design docs, include only information maintainers need to understand, operate, or change the frontend.

Useful sections:

- Goals and non-goals.
- Constraints and project rules.
- App context and external systems.
- Route tree and page ownership.
- Domain systems and component ownership.
- Runtime/data flows.
- Cross-cutting concepts: routing, server state, client state, forms, auth, errors, accessibility, design tokens, tests, and performance.
- Decisions and trade-offs.
- Risks, technical debt, and known gaps.
- Glossary.

Do not generate every section by default. Select the smallest subset that answers the user's chosen document type.

## Diagrams

Use Mermaid diagrams when they reduce ambiguity. Prefer:

- Context: app, users, backend APIs, design system, and external systems.
- Container: frontend app, design-system package, shared client libraries, backend API, auth provider.
- Component/system: route group, domain system, adapters, hooks, stores, components.
- Sequence: route/data load, mutation, optimistic update, form submit, auth redirect, or real-time update.

Most frontend docs need at most one context or data-flow diagram. Avoid diagrams that restate directory trees.

## Evidence and Maintenance

Frontend docs decay quickly when they describe intention without source links. For every non-obvious claim, cite:

- Source file and line when available.
- Existing docs, design-system docs, Storybook, ADRs, project rules, route files, generated route trees, tests, or rendered verification output.

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
