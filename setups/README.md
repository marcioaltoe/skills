# Skill setups

Setups are install presets for common project types. Each setup is a plain text file with one skill directory per line.

See the published setup guide for OS-specific commands and included skills:

```text
https://marcioaltoe.github.io/skills/setups/
```

Install a setup without Node:

```bash
curl -fsSL https://raw.githubusercontent.com/marcioaltoe/skills/main/install.sh | bash -s -- agentic-workflow
```

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) agentic-workflow"
```

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
