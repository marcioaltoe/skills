# marcioaltoe/skills

Coleção pessoal de [agent skills](https://github.com/vercel-labs/skills) para Claude Code e outros agents compatíveis. Cada skill é um conjunto de instruções que estende as capacidades do agent para tarefas específicas.

## Instalação

Usa a CLI [`skills`](https://github.com/vercel-labs/skills) (já publicada no npm).

```bash
# Instalar todas as skills globalmente
bunx skills add marcioaltoe/skills -g

# Instalar uma categoria específica
bunx skills add marcioaltoe/skills/skills/git -g

# Instalar uma skill individual
bunx skills add marcioaltoe/skills/skills/git --skill commit-style -g

# Listar skills disponíveis sem instalar
bunx skills add marcioaltoe/skills --list
```

Sem `-g`, instala no projeto atual em `.claude/skills/`.

## Categorias

| Categoria | Domínio |
|---|---|
| [`development/`](./skills/development) | TypeScript, Rust, padrões gerais de código, refactoring |
| [`testing/`](./skills/testing) | Vitest, Jest, Playwright, estratégias de teste |
| [`git/`](./skills/git) | PRs, rebase, commits, workflows git |
| [`frontend/`](./skills/frontend) | React, Next.js, Tailwind, UI/UX |
| [`backend/`](./skills/backend) | APIs, bancos, ORMs, autenticação |
| [`ai/`](./skills/ai) | Claude API, prompts, agents, skills (meta) |
| [`writing/`](./skills/writing) | Docs, READMEs, descrições de PR, comunicação |
| [`devops/`](./skills/devops) | Docker, CI/CD, deploy, infra |

## Criar uma skill nova

Veja [AGENTS.md](./AGENTS.md) para convenções e passo a passo.

Resumo rápido:

```bash
# 1. Cria a pasta seguindo skills/<categoria>/<nome>/
mkdir -p skills/development/minha-skill

# 2. Copia o template
cp skills/_template/SKILL.md skills/development/minha-skill/SKILL.md

# 3. Edita o frontmatter e o conteúdo
$EDITOR skills/development/minha-skill/SKILL.md

# 4. Testa localmente antes de commitar
bunx skills add ./skills/development/minha-skill -g
```

## Licença

MIT — veja [LICENSE](./LICENSE).
