# General Agent Instructions

Template for Rust CLI projects, including command-line tools, clap parsers,
automation-facing commands, JSON/text output contracts, and Cargo release
workflows.

## High priority

- Use the relevant local skills before changing code, docs, tests, workflows,
  or agent instructions.
- Prefix shell commands with `rtk` when it is available. In command chains,
  prefix each command.
- Use `rg` / `rg --files` for local code search. Use Context7 for external
  library/API docs and Exa for broader web/source research. Do not use web
  research tools to search local code.
- Run the repo's full verification gate before claiming completion. Treat any
  format issue, clippy warning, build failure, or test failure as blocking.
- Do not use workarounds in production code or tests. Fix the root cause.
- Do not run destructive git commands such as `git reset`, `git checkout --`,
  `git restore`, `git clean`, or forced deletion commands unless the user
  explicitly asks for that operation.
- Agent-created branches must use the `ma/` prefix unless the repo documents a
  different human-owned prefix.

## Agent docs

Read these only when relevant to the task:

- `docs/agents/issue-tracker.md` — local issue/PRD conventions, usually
  `.scratch/<feature>/`
- `docs/agents/triage-labels.md` — label mapping for issue triage skills
- `docs/agents/domain.md` — how agents consume `CONTEXT.md` and ADRs
- `CONTEXT.md` — project vocabulary, command concepts, domain rules, and
  product decisions
- `docs/adr/` — architectural decisions; flag conflicts before overriding them

Use canonical terms from `CONTEXT.md` in command names, help text, issue titles,
test names, and user-facing explanations. If the right term is missing, call
out the gap instead of inventing new language.

## Skill dispatch

Before editing, identify the task domain and load every matching skill.

- CLI behavior, flags, stdout/stderr, exit codes, JSON output, dry-run behavior,
  non-interactive mode, or introspection: `agentic-cli-design`
- Rust command behavior, clap parser code, error handling, output contracts,
  integration tests, or Cargo workflows: `rust` and `rust-cli`
- Tests, fixtures, golden files, integration tests: `testing-boss` plus the
  relevant Rust/CLI skill
- Implementation: `coding-guidelines`
- Bug fix or failing test: `no-workarounds` plus a systematic debugging skill
- Docs, PRDs, ADRs, issues, PR descriptions: `tech-writer`
- Commits or PR titles: `conventional-commits`
- Completion claim: `evidence-gate`
- OnionCry checks: `onioncry` only when running OnionCry against architecture
  boundaries or modifying the OnionCry project itself. Do not load OnionCry for
  ordinary Rust CLI work.

## CLI behavior

- Design commands for humans and agents. Prefer deterministic output,
  non-interactive flags, stable exit codes, and machine-readable modes when the
  workflow needs automation.
- Keep stdout for requested command output. Send diagnostics, progress, and
  warnings to stderr.
- Treat command names, flags, JSON fields, text output relied on by tests, and
  exit-code contracts as public API.
- Help text must be concise, truthful, and backed by implemented behavior.
- Errors must name the failed operation and the next useful action when one is
  known.

## Rust conventions

- Prefer explicit domain types over stringly typed command plumbing.
- Keep parsing, domain execution, and output rendering separable enough to test
  without spawning the binary for every case.
- Use `thiserror` or the repo's established error pattern for typed errors.
- Use `serde`/`serde_json` for structured output. Do not hand-build JSON.
- Integration tests should assert CLI behavior through the binary when the
  contract is user-facing. Unit tests should cover pure parsing and domain
  logic directly.

## Verification

Use the repo's declared verification command when present, commonly
`make verify`. If no aggregate command exists, run at least:

```bash
cargo fmt --all -- --check
cargo check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
```

Also run any documented build, snapshot, integration, or release check that
applies to the touched files.

## Git and delivery

- Check `git status --short` before staging.
- Keep unrelated user changes out of your diff.
- Use Conventional Commits for commits and PR titles.
- Do not rewrite unrelated files or format the whole repo unless asked.
- PR bodies should summarize changes, call out risk, and list validation
  commands run.
