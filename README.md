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
| [`ai/`](./skills/ai) | Claude API, prompts, agents, skills (meta), MCPs |
| [`architecture/`](./skills/architecture) | DDD, decomposição modular, design de sistemas |
| [`backend/`](./skills/backend) | APIs, bancos, ORMs, autenticação, payments |
| [`design/`](./skills/design) | UI/UX, diagramas, design systems, theming |
| [`development/`](./skills/development) | TypeScript, Go, refactoring, padrões gerais |
| [`devops/`](./skills/devops) | Docker, CI/CD, deploy, infra |
| [`frontend/`](./skills/frontend) | React, TanStack, Tailwind, shadcn, Storybook |
| [`git/`](./skills/git) | PRs, rebase, commits, workflows git |
| [`marketing/`](./skills/marketing) | Pitch decks, copywriting, fundraising, sales |
| [`testing/`](./skills/testing) | Vitest, QA, anti-patterns, doutrinas de teste |
| [`tools/`](./skills/tools) | Obsidian, formatos de arquivo, MCPs auxiliares |
| [`writing/`](./skills/writing) | Docs, READMEs, comunicação |

## Criar uma skill nova

Veja [AGENTS.md](./AGENTS.md) para convenções e [Makefile](./Makefile) para os comandos.

Fluxo:

```bash
# 1. Abre branch com prefixo ma/
make branch NAME=add-minha-skill

# 2. Cria a estrutura (frontmatter mínimo em AGENTS.md)
mkdir -p skills/development/minha-skill
$EDITOR skills/development/minha-skill/SKILL.md

# 3. Testa localmente
bunx skills add ./skills/development/minha-skill -g

# 4. Commita (Conventional Commits)
git add skills/development/minha-skill
git commit -m "feat(development): add minha-skill"

# 5. Abre PR + dispara review do Claude
make pr
make review

# 6. Após review aprovada
make merge
```

Veja todos os targets disponíveis com `make help`.

## Licença

MIT — veja [LICENSE](./LICENSE).
