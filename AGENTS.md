# Convenções deste repositório

Guia para criar e manter skills aqui. Aplica-se tanto a você (humano) quanto a um agent assistente.

## Estrutura

```
skills/
  <categoria>/
    <nome-da-skill>/
      SKILL.md            # obrigatório
      references/         # opcional — material de referência aprofundado
      examples/           # opcional — exemplos de uso
      templates/          # opcional — templates/scaffolds
      scripts/            # opcional — automações
```

- `<categoria>`: uma das pastas existentes (`development`, `testing`, `git`, `frontend`, `backend`, `ai`, `writing`, `devops`). Criar uma nova pasta = criar uma nova categoria. Mantenha as categorias enxutas — se uma skill cabe em duas, escolha a dominante e use `metadata.tags` para o resto.
- `<nome-da-skill>`: lowercase, hífens, sem espaços. Esse é o slug usado em `bunx skills add ... --skill <nome>`.

## Frontmatter padrão

Todo `SKILL.md` começa com YAML frontmatter. Campos obrigatórios são exigidos pela CLI `vercel-labs/skills`; o resto é para o frontend futuro consumir.

```yaml
---
name: minha-skill                     # obrigatório — slug único (lowercase-com-hífens)
description: One-liner que o agent lê # obrigatório — o agent usa isso para decidir quando ativar
metadata:
  category: development               # explícito (a CLI ignora, mas o frontend usa)
  tags: [typescript, refactor]        # opcional — filtros adicionais
  version: 0.1.0                      # semver
  author: marcioaltoe
  internal: false                     # true = oculta da listagem padrão
---
```

### Sobre o `description`

É o campo mais importante. O agent decide se carrega a skill com base nisso. Boas práticas:

- **Comece com a ação principal**, não com "Skill para..." ou "Esta skill...".
- **Liste gatilhos concretos**: que pergunta/contexto deve ativá-la.
- **Seja específico sobre o domínio**: "PRs no estilo Conventional Commits" > "ajuda com PRs".

Bom: `Cria descrições de PR seguindo Conventional Commits — usar quando o usuário pede "create PR", "abrir PR", ou após uma sequência de commits prontos para review.`

Ruim: `Skill para ajudar com PRs.`

## Passo a passo: criar nova skill

```bash
# 1. Abre branch (sempre prefixo ma/)
make branch NAME=add-<nome>

# 2. Cria estrutura
mkdir -p skills/<categoria>/<nome>

# 3. Cria SKILL.md com o frontmatter padrão (ver seção acima)
$EDITOR skills/<categoria>/<nome>/SKILL.md

# 4. Testa localmente
bunx skills add ./skills/<categoria>/<nome> -g

# 5. Verifica que o frontmatter parseia ok
make list

# 6. Commita (Conventional Commits — instale o hook com `make install-hooks`)
git add skills/<categoria>/<nome>
git commit -m "feat(<categoria>): add <nome> skill"

# 8. Abre PR, dispara review, e (após aprovação) merge
make pr        # body é gerado agrupando feats/fixes/refactors
make review    # comenta @claude na PR
make merge     # squash + delete branch + volta pra main atualizada
```

### Regras do fluxo

- **Branches** sempre começam com `ma/` (criadas via `make branch`).
- **Commits** seguem Conventional Commits — `make install-hooks` instala validação.
- **PR titles** também seguem Conventional Commits — `make pr` valida e bloqueia se não bater.
- **Merge** é sempre squash. O título da PR vira a mensagem do commit squashed.

### PR body auto-gerado

`make pr` lê todos os commits da branch e agrupa por tipo no body:

```
## Features
- feat(git): add commit-style skill
- feat(development): add review-checklist skill

## Fixes
- fix(testing): tighten vitest skill description

## Refactors
- refactor(git): split commit-style anti-patterns section
```

Commits que não são feat/fix/refactor (docs, chore, test, etc.) ficam em "Other".

## Convenções de conteúdo do `SKILL.md`

Estrutura sugerida do corpo (após o frontmatter):

```markdown
# Nome legível da skill

Parágrafo curto explicando o propósito.

## Quando usar

- Cenário 1
- Cenário 2
- Cenário 3

## Como aplicar

Passos concretos, em imperativo. Seja específico — o agent vai seguir literalmente.

## Anti-padrões

- O que NÃO fazer.
- Erros comuns que essa skill deve impedir.

## Referências (opcional)

Links para `references/` ou documentação externa.
```

Mantenha o `SKILL.md` curto (idealmente < 200 linhas). Material extenso vai em `references/` e é mencionado no body com link.

## Validação CI

O workflow `.github/workflows/validate.yml` roda `npx skills add . --list` em cada push para garantir que todos os frontmatters parseiam. Se a CI falhar, provavelmente:

- Falta campo `name` ou `description`.
- YAML inválido (indentação, aspas).
- Pasta tem `SKILL.md` mas sem frontmatter.

## Skills internas

Para esconder uma skill da listagem (ex: trabalho em progresso, template), adicione:

```yaml
metadata:
  internal: true
```

A skill só será instalável se o usuário passar `--skill <nome>` explicitamente ou setar `INSTALL_INTERNAL_SKILLS=1`.
