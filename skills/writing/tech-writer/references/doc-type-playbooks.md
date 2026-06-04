# Doc-type playbooks

Deeper structure and templates per document type. Read the section for the type being written; skip the rest.

## PRD

Lead with the problem and cited evidence (ticket, survey, churn number) — never "users want". Specify what and why; leave how to engineering. 1–2 pages; if an engineer won't finish reading it, it is too long.

Fixed section order:

1. **Problem** — the pain, with a cited signal.
2. **Audience** — named segment and scale, not "users".
3. **Proposed shape** — high-level direction, not pixel-level design.
4. **Success metric** — one measure with a numeric target.
5. **Scope** — what is in, and an explicit out-of-scope list.
6. **Acceptance criteria** — testable, Given-When-Then where useful, including negative and edge cases. QA should be able to write test cases without asking.
7. **Open questions** — each with a named owner.

Prioritize ruthlessly: if everything is P0, nothing is. Link to context that lives elsewhere instead of restating it. Date the doc and name one owner.

Fill sections only with facts the source provides — plain lines, no bold-prefix bullets:

```markdown
# PRD: <feature> (P<n>)

## Problem

<pain + the cited signal: ticket count, report name>

## Audience

<segment and scale from the source>

## Proposed shape

<high-level description from the source>

## Success metric

<the one numeric target from the source>

## Scope

In: <from the source>
Out of scope: <the source's explicit exclusions, verbatim — add nothing>

## Acceptance criteria

TBD — needs definition with <owner>

<!-- Keep the TBD line above as-is unless the source explicitly provides acceptance criteria. Writing your own criteria, edge cases, or performance targets is fabrication. -->

## Open questions

<only the source's questions, each with its named owner — never add questions>
```

Never invent acceptance criteria, edge cases, extra open questions, UI details, or timeline commitments the source did not state.

## Tech specs, RFCs, and design docs

One proposal per document. Lead with the problem; the design earns its place by solving it. Separate what/why (yours to argue) from how (precise only where the source is precise). State honest trade-offs — a spec with no downsides is not finished, and reviewers trust documents that name their own risks.

Copy this skeleton literally — plain section text, no bold-prefix labels:

```markdown
# <proposal as a short noun phrase>

Status: <Draft | In review | Approved>
Decider: <named person or group from the source> · Decision needed by: <date from the source, or omit the line>

## Problem

<what hurts today, with the source's numbers and cited signals>

## Goals and non-goals

Goals: <from the source>
Non-goals: <the source's explicit exclusions — never add your own>

## Proposed design

<the how, at exactly the precision the source provides — contracts, schemas, and diagrams beat prose. TBD markers beat invented details.>

## Alternatives considered

<name> — rejected: <the source's stated reason, restated plainly. Stop there.>

## Risks and trade-offs

<honest negatives the source states or that follow directly from the design>

## Open questions

<only the source's questions, each with its named owner>
```

Write the design at the precision the source supports: if the source names an endpoint, name it; if it only says "a queue", do not pick a vendor. Keep the document as short as clarity allows — link to context that lives elsewhere instead of restating it.

## ADR

One architecturally significant decision per record. Numbered file in source control (`docs/adr/0007-use-webhooks.md`). Immutable after acceptance: supersede with a new ADR and link both, never edit.

Sections (Nygard):

1. **Title** — short noun phrase.
2. **Status** — Proposed, Accepted, Deprecated, or Superseded by [link].
3. **Context** — the forces in tension, stated as value-neutral facts.
4. **Decision** — full sentences, active voice: "We will ...".
5. **Consequences** — positive, negative, AND neutral. Positives-only means the ADR is broken.

List the alternatives considered and why each was rejected — that is what makes the record useful in three years. One to two pages; if it needs 4,000 words it is a design doc, not an ADR.

Copy this skeleton literally — plain section text, no bold-prefix labels:

```markdown
# <decision as a short noun phrase>

Status: <Proposed | Accepted | Deprecated | Superseded by [link]>

## Context

<the forces, as neutral facts with their numbers and sources — only facts the source states>

## Decision

We will <the decision, exactly as the source states it>.

## Alternatives considered

<name> — rejected: <the source's stated reason, restated plainly. Stop there — do not add mechanisms, figures, or scenarios the source did not give.>

## Consequences

<positive consequences the source states>
<negative consequences the source states — at least one; never soften or omit them>
```

State each rejection reason and consequence only as given. "Stateful connections complicate the load balancer setup" must not grow into session affinity, connection pooling, or peak-season scenarios the source never mentioned.

## Issues and bug reports

Action-forward title: component, then behavior — "Login button: disable on Safari 17 beta", not "Some login thing". One idea per issue; search for duplicates first.

Bug report body:

1. **Expected vs actual** — two bullets.
2. **Reproduction steps** — numbered, specific. A bug that cannot be reproduced cannot be fixed.
3. **Environment** — OS, browser, version.
4. **Evidence** — screenshot, log excerpt, failing test.
5. **Acceptance criteria** — pass/fail definition of done.

Add scope constraints when needed to prevent yak-shaving ("no new dependencies", "keep p95 under 200ms").

Copy this skeleton literally — plain-text field labels, no bold prefixes:

```markdown
# <component>: <observed behavior> (<conditions>)

Expected: <from the source>
Actual: <from the source>

## Reproduction steps

1. <step>

## Environment

- <only environments the source states>

## Evidence

- <links and traces from the source>

Hypothesis: <only if the evidence suggests a cause — never assert a root cause as fact. Omit this line if no evidence points anywhere.>
```

Include acceptance criteria only when the source provides them. If it does not, omit that section entirely — never invent pass conditions, browser lists, or run counts.

## Tasks and user stories

Identify audience, action, outcome: "As a [user], I want [task], so that [goal]". Replace vague adjectives with constraints: "fast" → "each page loads within 0.5s". Keep tasks small, independent, and estimable. Use Markdown checklists for sub-tasks.

## PR descriptions

First line: a standalone imperative summary of what changed ("Delete the FizzBuzz RPC and replace callers with FooBar"). It becomes the version-history line people search.

Body answers WHY, not what — the diff already shows what. Include: context, decisions not visible in the code, trade-offs, known shortcomings, links to the bug/benchmark/design. Call out risky areas so reviewers know where to focus. Add screenshots for UI changes and testing instructions when non-obvious. "Fix bug" and "Phase 1" are not descriptions. Re-read the description before merging — it drifts during review.

## Code review comments

Comment on the code, never the developer. Explain why, not just what. Label severity so authors know what is mandatory: "Nit:", "Optional:", "FYI:". Point out problems; let the author choose the fix unless a specific fix matters. Praise good work — it teaches as much as criticism. Do not block on personal preference that no style guide backs. Approve when the change improves overall code health, not when it is perfect.

## Async updates and team posts

TL;DR first. Frontload all context — assume the reader has none; one self-contained message resolves in one reply instead of three follow-ups. Never send a bare "hello" or "got a sec?".

Status update shape: STATUS (what shipped, linked) / BLOCKERS (what, plus the specific unblocking ask) / ASKS (decision needed, owner, deadline) / FYI. Scannable in 30 seconds.

Set explicit response expectations: "FYI only", "need a decision by Thursday EOD", "blocking — please respond within 24h". Put decisions in a durable, searchable, linkable place — chat threads are not a decision record.

## Docs and quickstarts: pick the mode

Before writing, name which Diátaxis mode the page is, and do not mix modes on one page:

- **Tutorial** — learning by doing; a guaranteed-success path for a beginner.
- **How-to guide** — steps to solve one real task for someone who knows the basics.
- **Reference** — complete, accurate description of the machinery; neutral tone, tables welcome.
- **Explanation** — background and reasoning; the only place for "why it works this way".

Be prescriptive: recommend one path instead of enumerating every option. Keep code blocks shorter than one screen; never include shell prompt characters that break copy-paste.

When the source states behavior qualitatively, reuse the source's word and stop. For `Backoff: "exponential"` with `BaseDelay: 100ms`, write exactly this much: "Retries use exponential backoff starting from `BaseDelay`." Writing "doubles", "grows as 2^n", or "100ms, 200ms, 400ms" when the source gave no multiplier is fabrication — the actual implementation may use any growth factor, and your invented numbers will be wrong in print. The same applies to statistics: quote p95 as p95; never reinterpret a percentile as an average, median, or "half of all requests".
