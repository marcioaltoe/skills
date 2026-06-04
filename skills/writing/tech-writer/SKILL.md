---
name: tech-writer
description: Write or rewrite anything technical people write — READMEs, documentation pages, quickstarts, PRDs, tech specs, RFCs, ADRs, design docs, GitHub issues, bug reports, task descriptions, PR descriptions, code review comments, and async team updates — so it reads clearly, scans fast, stays faithful to source facts, and sounds human. Use when the user says "write a README", "improve these docs", "write a quickstart", "write a PRD", "write a tech spec", "draft an ADR", "draft an RFC", "open an issue", "write the PR description", "draft a status update", or wants technical writing that persuades without marketing fluff. Do NOT use for marketing landing pages, sales copy, or ad copywriting.
metadata:
  category: writing
  tags: [readme, docs, technical-writing, copywriting, prd, adr, issues, communication]
  version: 0.3.0
  author: marcioaltoe
---

# Tech writer

Write technical content that earns the reader's attention: lead with what matters most, prove claims with real facts and runnable examples, and cut everything that does not help the reader decide or act. Applies to docs, READMEs, PRDs, tech specs, RFCs, ADRs, issues, tasks, PR descriptions, review comments, and team updates.

## When to use

- Writing a README, quickstart, docs page, or guide for a tool, library, or service
- Writing or rewriting a PRD, tech spec, RFC, ADR, design doc, GitHub issue, bug report, task, PR description, code review comment, or async status update
- Rewriting any technical text that feels bloated, vague, or AI-generated

## Process

1. **Read the source first.** Examine the code, CLI help, API surface, spec, ticket, or diff before writing. Every claim must be backed by something real. Never invent flags, options, or behavior.
2. **Name the reader and the action.** Decide who reads this (new user, reviewer, PM, future maintainer) and the one thing they should know or do after reading. Structure everything around that.
3. **Pick the doc type and load its playbook.** Read the matching section of [references/doc-type-playbooks.md](references/doc-type-playbooks.md) for structure rules and skeletons (PRD, tech spec/RFC/design doc, ADR, issue, task, PR description, review comment, async update, docs mode).
4. **Draft inverted-pyramid.** The most important sentence comes first. For docs: what it does and the concrete outcome. For a PR: the standalone summary line. For an update: the TL;DR. No throat-clearing ("Welcome to...", "This document describes...").
5. **Cut pass.** Delete needless words, qualifiers, and duplicate ideas. If a sentence survives unchanged after removing a word, the word was noise.
6. **Humanize pass.** Scan for the banned patterns below and rewrite every hit.
7. **Verify.** Run the self-check. Confirm every command runs, every link resolves, and every stated fact exists in the source.

## Writing rules

- **Active voice.** "The CLI writes a report" — not "a report is written".
- **Concrete over abstract — but only as concrete as the source.** Name the commands, versions, file paths, and numbers the source gives. "Retries 3 times with exponential backoff" beats "handles failures gracefully". But if the source says only "exponential backoff", stop there: never compute example delays ("100ms, 200ms, 400ms"), multipliers ("doubles"), or formulas the source does not state. Source-stated concreteness is credibility; invented concreteness is a bug.
- **Why over what.** Code, diffs, and schemas already show what. Your text adds why: intent, trade-offs, rejected alternatives.
- **One topic per artifact.** One decision per ADR, one idea per issue, one purpose per page.
- **Must / can / might — not "should".** "Must" for required, "can" for optional, "might" for possible outcomes. "Should" leaves the reader guessing.
- **Benefits with proof.** State what the reader gets, then show the code, command, or evidence that delivers it.
- **One idea per paragraph, four sentences max.** Long paragraphs hide the point.
- **Sentence-case headings.** "Getting started", not "Getting Started".
- **Runnable examples.** Snippets must be copy-pasteable, complete, and shorter than one screen. Prefer one real example over three abstract ones.
- **Plain words.** "Use" not "utilize", "help" not "facilitate", "fast" not "performant".

## Banned patterns

Rewrite any occurrence of these. They mark text as machine-generated filler.

- **AI vocabulary:** delve, leverage, seamless, robust, cutting-edge, crucial, pivotal, comprehensive, testament, landscape (abstract), showcase, foster, tapestry, intricate, vibrant, streamline, empower, elevate, unlock, supercharge.
- **Filler phrases:** "in order to" → "to"; "due to the fact that" → "because"; "it is important to note that" → delete; "at this point in time" → "now"; "please note that" → delete.
- **Minimizers:** "simply", "easily", "just", "it's that simple". If it were simple, the reader would not need the doc.
- **Inflated significance:** "plays a vital role", "marks a pivotal step", "represents a paradigm shift".
- **Superficial -ing tails:** "...ensuring reliability", "...showcasing flexibility", "...highlighting its power". Cut the tail or replace it with a fact.
- **Negative parallelism:** "It's not just X, it's Y."
- **Rule-of-three padding:** forced triads like "fast, flexible, and powerful". Use the one adjective that is true and provable.
- **Bold-header bullet lists:** bullets shaped like "**Performance:** Performance has been improved...". Write prose or plain bullets instead.
- **Decoration:** emojis in headings or bullets, exclamation points, Title Case headings, bold scattered for emphasis.
- **Vague attribution:** "many developers say", "users want", "it is widely considered". Cite the ticket, survey, or source — or cut the claim.
- **Generic endings:** "The future looks bright", "Happy coding!". End with the next concrete step instead.

## README skeleton

Adapt as needed; not every project needs every section.

```markdown
# project-name

One sentence: what it does and for whom. One sentence: the concrete win.

## Install

Copy-pasteable command(s) for the main platform(s).

## Usage

The single most common task, shown end to end.

## Configuration (if applicable)

Table or list of options: name, type, default, what it changes.

## Contributing (for OSS)

How to set up dev environment, run tests, and submit changes.

## License
```

For other doc types (PRD, tech spec, RFC, ADR, issue, task, PR description, review comment, async update), use the structures and skeletons in [references/doc-type-playbooks.md](references/doc-type-playbooks.md).

## Self-check

Before delivering, every answer must be yes:

1. Does the first sentence carry the single most important point for this reader?
2. Is every code block complete and runnable as written?
3. Did a scan for banned patterns come back clean?
4. Is every claim specific — backed by a command, number, option name, citation, or example?
5. Does the doc follow its type's structure (playbook section), and could the target reader act using only this text?

## Anti-patterns

- Writing before reading the code, spec, ticket, or diff.
- Opening with history, philosophy, or "In today's fast-paced world...".
- Listing features or consequences as adjectives instead of demonstrating them.
- Padding length to look thorough. A short doc that works beats a long one that impresses.
- Inventing benchmarks, testimonials, or behavior not present in the source.
- Restating context that already lives elsewhere instead of linking to it.
