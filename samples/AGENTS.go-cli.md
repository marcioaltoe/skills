# General Agent Instructions

Template for Go CLI projects, including command-line tools, automation CLIs,
Cobra command trees, and Bubble Tea/Lip Gloss TUIs.

## High priority

- Use the relevant local skills before changing code, docs, tests, workflows,
  or agent instructions.
- Prefix shell commands with `rtk` when it is available. In command chains,
  prefix each command.
- Use `rg` / `rg --files` for local code search. Use Context7 for external
  library/API docs and Exa for broader web/source research. Do not use web
  research tools to search local code.
- Run the repo's full verification gate before claiming completion. Treat any
  lint warning, vet failure, test failure, or format failure as blocking.
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
- Go command behavior, package layout, error handling, version output, command
  tests: `golang-cli`
- Cobra command trees: `golang-spf13-cobra`
- Go tests, fixtures, golden files, integration tests: `golang-testing` plus
  `testing-boss`
- Bubble Tea or Lip Gloss TUI work: `bubbletea` and `tui-design`
- Implementation: `coding-guidelines`
- Bug fix or failing test: `no-workarounds` plus a systematic debugging skill
- Docs, PRDs, ADRs, issues, PR descriptions: `tech-writer`
- Commits or PR titles: `conventional-commits`
- Completion claim: `evidence-gate`

## CLI behavior

- Design commands for humans and agents. Prefer deterministic output,
  non-interactive flags, stable exit codes, and machine-readable modes when the
  workflow needs automation.
- Keep stdout for requested command output. Send diagnostics, progress, and
  warnings to stderr.
- Do not change command names, flag names, JSON fields, or exit-code contracts
  casually. Treat them as public API.
- Help text must be concise, truthful, and backed by implemented behavior.
- Errors must name the failed operation and the next useful action when one is
  known.

## Go conventions

- Keep packages cohesive. Do not create generic utility packages unless they
  remove real duplication across multiple packages.
- Prefer dependency injection through small interfaces at the boundary that
  owns the behavior.
- Use table tests when they clarify input/output behavior. Avoid table tests
  that hide setup or assertion intent.
- Tests must assert observable behavior. Do not add production-only hooks for
  tests.
- Keep command parsing, execution, and output formatting separable enough to
  test without shelling out for every case.

## Verification

Use the repo's declared verification command when present, commonly
`make verify`. If no aggregate command exists, run at least:

```bash
go test ./...
```

Also run any documented format, vet, lint, build, or integration-test command
that applies to the touched files.

## Git and delivery

- Check `git status --short` before staging.
- Keep unrelated user changes out of your diff.
- Use Conventional Commits for commits and PR titles.
- Do not rewrite unrelated files or format the whole repo unless asked.
- PR bodies should summarize changes, call out risk, and list validation
  commands run.
