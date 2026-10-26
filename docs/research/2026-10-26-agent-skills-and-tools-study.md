# Candidate agent skills and tools for Baseline evaluation

## Decision context

This study, requested by Marcio on 2026-10-26, identifies capabilities worth evaluating in Roundfix's actual project Baselines. It does not approve installing tools, replacing skills, enabling hooks, or changing delivery gates. Proposals require project-specific evidence.

The local comparison covers 145 catalog skills and six setup presets after the authorized consolidation of skill authoring around `skill-creator`. Existing overlapping UI, architecture, testing, research, and workflow skills make selective replacement more valuable than indiscriminate additions. Runtime, token savings, retrieval accuracy, and quality were not benchmarked.

## Main recommendation

Prioritize optional pilots of **Archify** for architecture communication, **Impeccable** for UI consolidation, and **one graph tool** for code exploration. Evaluate specific methods from Addy Osmani and Superpowers within existing Roundfix stages. Reconcile the official UI/UX Pro Max source before considering another UI skill. Treat Ponytail and Caveman as comparative experiments and Composio as a discovery directory.

## Evaluation criteria

Prefer a concrete capability absent from the catalog over another general workflow. Check triggers, callable dependencies, licensing, installed-tree portability, toolchain requirements, network/model costs, artifact freshness, and per-Run/per-Task worktree isolation. Keep advisory diagrams, graphs and local checks distinct from Verification, terminal QA and settlement.

The priorities below are recommendations from documentary inspection, not demonstrated performance rankings.

## Repository assessments

### 1. pbakaus/impeccable

**Candidate:** a unified UI skill, commands such as audit/critique/polish/harden, and deterministic detectors. The current package includes one main skill, 24 commands and a binary launcher; it is more than a Markdown prompt.

**Possible value:** a coherent entry point and executable observations could consolidate parts of `frontend-design`, `interface-design`, `baseline-ui` and `ui-ux-pro-max`. It distinguishes persuasive, operational, reading and experiential surfaces and preserves existing visual systems.

**Integration work:** the launcher can download a versioned engine, verified against a bundled checksum manifest. Installation can configure hooks. Live browser iteration and PRODUCT.md/DESIGN.md conventions need reconciliation with current project context and QA ownership. Detector execution is documented as not requiring an LLM key; agent-led design still consumes model usage.

**Recommendation:** high-priority, optional UI pilot. Compare rendered outcomes, findings and cost before retiring existing skills. Apache-2.0. [S1]

### 2. tt-a1i/archify

**Candidate:** the `archify` skill and Node package generate standalone HTML architecture, sequence, workflow, dataflow, lifecycle, ERD and related diagrams using schemas, renderers and delivery checks.

**Possible value:** concrete, navigable architecture explanations complement `backend-docs`, `frontend-docs` and `architectural-analysis`. This does not replace OnionCry's enforcement of source dependency rules.

**Integration work:** Node 18 or later; include the package's resources, not only SKILL.md. Full delivery includes browser validation. An automated receipt does not establish perceptual quality, and authored runtime relationships do not prove deployed behavior. The optional update check can be disabled through ARCHIFY_UPDATE_CHECK_DISABLED=1.

**Recommendation:** high-priority, on-demand documentation pilot. Keep generated diagrams grounded in source and existing vocabulary; do not make diagram generation a mandatory verification step. Apache-2.0. [S2]

### 3. ComposioHQ/awesome-claude-skills

**Candidate:** a discovery directory, copied skill folders and a large application-automation collection, rather than one coherent Baseline dependency.

**Possible value:** selected techniques or integrations absent from a project's stack. The linked `pypict-claude-skill` is a follow-up lead for pairwise test generation; its own source was not inspected, so it is not an adoption recommendation.

**Integration work:** substantial overlap with current document, authoring, research and workflow skills. The sampled `langsmith-fetch` entry instructs echoing LANGSMITH_API_KEY and must not be adopted unchanged. `connect-apps` introduces external actions, providers and OAuth; existing message approval and Jarvis boundaries remain applicable. A meeting-analysis skill is more relevant to Secondbrain than the software Baseline. The README claims Apache-2.0 but notes per-folder differences; the root license endpoint was unavailable during inspection.

**Recommendation:** use as a source-discovery index. Verify original sources and licenses for each selected candidate; avoid bulk installation. [S3]

### 4. Egonex-AI/Understand-Anything

**Candidate:** a plugin with understanding, diff, domain, onboarding, chat, explanation, dashboard and knowledge skills. It builds interactive code/domain maps under .ua/, retaining a legacy output directory when present.

**Possible value:** guided onboarding and graph-backed impact exploration beyond static audit reports.

**Integration work:** the inspected entrypoint requires Node 22 or later, pnpm 10 or later and a built core package. Initial agent analysis can be expensive; incremental reconciliation does not eliminate the need to prove freshness. Crucially, the understand entrypoint redirects PROJECT_ROOT from a worktree to the main checkout by default. UNDERSTAND_NO_WORKTREE_REDIRECT=1 opts out. This needs an explicit, tested head-isolation policy before any Run/Task use.

**Recommendation:** optional onboarding pilot after resolving worktree behavior. Review source exclusions, concurrent writers and commit-triggered updates. Local dashboard storage does not mean analysis by cloud agents stays local. MIT. [S4]

### 5. addyosmani/agent-skills

**Candidate:** a lifecycle pack whose broad stages overlap Roundfix, with narrower methods worth selecting.

**Possible value:** `constraint-driven-development` makes quality constraints and attempts to weaken gates explicit; `deprecation-and-migration` adds consumer inventories and staged compatibility transitions. A fresh-context review method is potentially useful for high-risk decisions, but broad compulsory escalation would add friction and cost.

**Integration work:** do not create CONSTRAINTS.md as a competing authority to Baseline configuration, AGENTS or Spec Verification. Defaults such as mypy must not displace an existing ty contract. A blanket tested-down-migration rule must be reconciled with genuinely irreversible changes. The README acknowledges that individual skill installs omit shared repository-level references: portable folder vendoring needs dependency packaging.

**Recommendation:** prioritize those two narrow methods, mapped into current contracts. Avoid the whole lifecycle pack. MIT. Current `core-web-vitals` comes from Addy's separate web-quality-skills repository, not this pack. [S5]

### 6. JuliusBrussee/caveman

**Candidate:** session voice skills plus compression, proxy/routing and reusable-block tooling.

**Possible value:** a controlled experiment in reducing repeated input/output, compared with RTK and targeted extraction already in use.

**Integration work:** the actual voice skill preserves technical payload and restores normal prose for durable documents and third-party messages, but its session-wide voice still overlaps concise-writing guidance. The sampled compress skill sends complete files to a provider and overwrites sources after validation, keeping backups separately. Governed instruction files should not be rewritten automatically. Full installation changes more than speaking style.

**Recommendation:** low-priority, opt-in comparison, not a default voice or automatic source compressor. Measure correctness, missing evidence recovery, total cost and latency, not output-token counts alone. Upstream efficiency claims are not local results. Apache-2.0. [S6]

### 7. Graphify-Labs/graphify

**Candidate:** the `graphifyy` Python package, exposed through the `graphify` CLI, with source graph extraction, queries, paths, explanations and reports. Its default branch at inspection was v8. Host skills are generated from skill markdown and sidecars rather than a ready-to-vendor canonical SKILL.md folder.

**Possible value:** local structural extraction could reduce repeated code exploration and connect code to rationale.

**Integration work:** Python 3.10 or later plus parser and graph dependencies. Code extraction is documented as local and LLM-free; semantic document/media paths can use providers. Installed integrations can add broad graph-first instructions and hooks. Verify cache invalidation, changed/deleted files, parser versions and source/head correspondence.

**Recommendation:** prioritize a CLI-only, source-only pilot against rg/read exploration. Do not install graph-first hooks initially. Compare with Understand-Anything before selecting one. License surface includes Apache-2.0, LICENSE-MIT and NOTICE; preserve component notices. [S7]

### 8. nextlevelbuilder/ui-ux-pro-max-skill

**Candidate:** the official UI/UX Pro Max package with local Python search and bundled data/references.

**Possible value:** maintained upstream provenance and searchable design knowledge. The local `ui-ux-pro-max` already exists but currently syncs from `fellipeutaka/leon`; adding another slug would increase duplication.

**Integration work:** Python 3 with no external Python dependencies documented for search. The actual skill invokes scripts through CLAUDE_PLUGIN_ROOT and a .claude path. A plain .agents subdirectory install needs a tested path strategy. The public MIT package should not be conflated with separately described premium offerings.

**Recommendation:** provenance and installed-tree compatibility review, followed by a measured choice between the current package and the official source. Coordinate with the Impeccable pilot and existing UI-overlap study; do not install all UI systems together. MIT. [S8]

### 9. DietrichGebert/ponytail

**Candidate:** a core simplification skill plus review/audit/debt commands and plugin integrations.

**Possible value:** an ordered solution ladder: reuse repository facilities, platform facilities and installed dependencies before writing minimal new code. This is testable against `coding-guidelines`.

**Integration work:** broad overlap with current coding, review and evidence guidance. It preserves important validation and risk checks but introduces session-long behavior levels, completion checks and shortcut comments. Full plugin installation adds lifecycle behavior; token/cost displays depend on supported host versions.

**Recommendation:** opt-in, core-skill comparison on representative tasks. Assess maintenance quality and correctness as well as cost. Do not add its full suite alongside existing guardrails based on upstream efficiency claims. MIT. [S9]

### 10. obra/superpowers

**Candidate:** selected review-reception and session-diagnostic techniques, not another complete lifecycle.

**Possible value:** `receiving-code-review` emphasizes evaluating suggestions against source and contracts; `diagnosing-superpowers` uses session evidence to investigate repeated work and workflow failures. The latter could inform a bounded Roundfix diagnostic.

**Integration work:** `systematic-debugging` is already vendored locally. Whole-pack brainstorming, tasking, worktrees and delivery overlap Roundfix. `writing-skills` conflicts with the chosen single authoring base. The diagnostic mandates seven analyst agents; that cost is not justified by default. Some source workflows impose clarification stops, deletion of code written before tests, or their own integration/cleanup menu.

**Recommendation:** selectively study review reception and bounded transcript diagnostics. Preserve daemon authority and current user authorization. Review optional visual-companion networking before any bootstrap. MIT. [S10]

## Proposed evaluation order

1. **Documentation pilot:** Archify on an existing architecture explanation. Compare source accuracy, useful relationships, browser readability and authoring/review time.
2. **UI consolidation pilot:** Impeccable versus current product/marketing routing; include an official UI/UX Pro Max provenance check. Assess existing-system preservation and unique findings.
3. **Code-exploration pilot:** compare Graphify's source-only CLI with native rg/read; evaluate Understand-Anything only with demonstrated worktree isolation. Select a winner before layering tools.
4. **Narrow workflow improvements:** map constraint anti-weakening, deprecation planning and review-reception methods into existing Roundfix contracts.
5. **Cost experiments:** compare Ponytail/Caveman selectively with current defaults. Follow up pairwise testing only after inspecting its original source and dependencies.

These are proposed experiments, not new gates or promises of lower cost.

## Questions for Roundfix

- Which projects lack the proposed capability, and which already have an equivalent?
- What does each installed Baseline actually load, invoke and require? Account for wrappers, sibling references, generated skills and hooks.
- Can selected folders install portably on all supported hosts, including Windows, with their licenses and resources intact?
- Can indexing and artifacts prove the same checkout/head as the Run or Task, including concurrent worktrees, deleted files and stale caches?
- Which actions are local, which use a provider, what data leaves the machine, and which credentials/configuration are needed?
- Measure cold/warm setup, incremental wall time, model/tool calls, total tokens/cost where observable, useful findings, false positives and correctness. Include failed/offline/index-unavailable cases.
- Can a pilot run without privileged hooks, automatic downloads or new lifecycle authority? Do not suppress errors to achieve that.
- What capabilities would be lost by consolidation? Define migration and reversal before changing profiles, snapshots, hashes or setup presets.
- Keep Verification, terminal QA and settlement as existing contracts. An explanatory diagram, graph receipt or local detector result does not substitute for them.

## Sources and method

Three parallel research assignments inspected the ten user-supplied repositories through Exa page fetches and GitHub metadata/source inspection. Because exact repositories were supplied, no broad search-result sweep was necessary. Actual skill/implementation entrypoints were sampled for the material integration findings; this was not an exhaustive code/security audit.

No candidate was installed, no candidate's extraction or model pipeline was executed, and no local savings or quality benchmark was performed. License labels describe the inspected sources and do not replace per-file provenance review during any future vendoring.

Pinned revisions observed on 2026-10-26:

- **S1 — Impeccable:** [README](https://github.com/pbakaus/impeccable/blob/6743a347db6229848348024388033e830ae4af42/README.md), [skill](https://github.com/pbakaus/impeccable/blob/6743a347db6229848348024388033e830ae4af42/.agents/skills/impeccable/SKILL.md), [launcher](https://github.com/pbakaus/impeccable/blob/6743a347db6229848348024388033e830ae4af42/.agents/skills/impeccable/scripts/impeccable).
- **S2 — Archify:** [skill](https://github.com/tt-a1i/archify/blob/81c6be8d87090670c45d08a8f97f9d29c5af0bec/archify/SKILL.md), [package](https://github.com/tt-a1i/archify/blob/81c6be8d87090670c45d08a8f97f9d29c5af0bec/archify/package.json).
- **S3 — Composio:** [repository](https://github.com/ComposioHQ/awesome-claude-skills/tree/be2a406907dbc61b73e6827ded415c96139d13a2), [sampled trace skill](https://github.com/ComposioHQ/awesome-claude-skills/blob/be2a406907dbc61b73e6827ded415c96139d13a2/langsmith-fetch/SKILL.md), [external-action skill](https://github.com/ComposioHQ/awesome-claude-skills/blob/be2a406907dbc61b73e6827ded415c96139d13a2/connect-apps/SKILL.md).
- **S4 — Understand-Anything:** [pipeline and worktree handling](https://github.com/Egonex-AI/Understand-Anything/blob/4e6d3299017a7432da15957874992837a315c5b4/understand-anything-plugin/skills/understand/SKILL.md), [diff analysis](https://github.com/Egonex-AI/Understand-Anything/blob/4e6d3299017a7432da15957874992837a315c5b4/understand-anything-plugin/skills/understand-diff/SKILL.md).
- **S5 — Addy Osmani:** [pack and packaging limitations](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/README.md), [constraints](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/constraint-driven-development/SKILL.md), [migration](https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/deprecation-and-migration/SKILL.md).
- **S6 — Caveman:** [skill](https://github.com/JuliusBrussee/caveman/blob/9b68f7ed12b05e7efaff18e65c5a3fc2849fd0a4/skills/caveman/SKILL.md), [file compression](https://github.com/JuliusBrussee/caveman/blob/9b68f7ed12b05e7efaff18e65c5a3fc2849fd0a4/skills/caveman-compress/SKILL.md).
- **S7 — Graphify:** [README](https://github.com/Graphify-Labs/graphify/blob/92741d162b2094ffc2fed58cfbd8ee823e9da62c/README.md), [host skill](https://github.com/Graphify-Labs/graphify/blob/92741d162b2094ffc2fed58cfbd8ee823e9da62c/graphify/skill-agents.md), [dependencies](https://github.com/Graphify-Labs/graphify/blob/92741d162b2094ffc2fed58cfbd8ee823e9da62c/pyproject.toml).
- **S8 — UI/UX Pro Max:** [README](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/README.md), [official package](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03/.claude/skills/ui-ux-pro-max).
- **S9 — Ponytail:** [core](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/skills/ponytail/SKILL.md), [review](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/skills/ponytail-review/SKILL.md).
- **S10 — Superpowers:** [pack](https://github.com/obra/superpowers/tree/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b), [review reception](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/receiving-code-review/SKILL.md), [session diagnostics](https://github.com/obra/superpowers/blob/2ce8aa15d05bd57213e6f746f953aafb7ded7a8b/skills/diagnosing-superpowers/SKILL.md).

Local comparison sources: skills-registry.json, setups/*.txt and the corresponding SKILL.md entrypoints. Related research already sent to Roundfix: ub-mode/tools message 01a17804-0685-7fd3-a82a-9f132d194580; overlap study message 01a1780e-ec18-7e90-a0b3-30b8abdb1d4b. Those messages contain earlier documentary findings, not measured Baseline outcomes.
