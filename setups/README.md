# Skill setups

Setups are install presets for common project types. Each setup is a plain text file with one skill directory per line.

See the published setup guide for OS-specific commands and included skills:

```text
https://marcioaltoe.github.io/skills/setups/
```

Install a setup without Node:

```bash
curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- saas
```

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) saas"
```

Recommended starting points:

- `saas` for normal Bun/TypeScript/React/Hono SaaS projects.
- `go-cli` for Go CLI projects without an interactive TUI.
- `go-cli-tui` for Go CLI projects with a Bubble Tea TUI.
- `rust-cli` for Rust CLI projects.
- `agent-automation` when the project uses Linear, GitHub PR evidence, CodeRabbit, and Roundfix.
- `paperclip-hermes` only for the experimental Paperclip/Hermes orchestration flow.

The project setups include the base Grill -> PRD -> Issues -> Implement -> Review workflow. They include `grill-with-docs` with `domain-modeling` for `CONTEXT.md`/ADR capture. `agent-automation` and `paperclip-hermes` are overlays, not default project setups.

List setups:

```bash
curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- --list
```

Local usage from this repository:

```bash
./install.sh marketing --dest .agents/skills
```

Validate setup files before committing:

```bash
make setups-check
```
