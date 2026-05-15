---
name: commit-style
description: Cria mensagens de commit no estilo Conventional Commits — usar quando o usuário pede "commit", "git commit", ou após mudanças prontas para serem registradas no histórico.
metadata:
  category: git
  tags: [git, commits, conventional-commits]
  version: 0.1.0
  author: marcioaltoe
---

# Commit Style

Mensagens de commit seguem [Conventional Commits](https://www.conventionalcommits.org/). O foco é o **porquê** da mudança, não o **o quê** (o diff já mostra o quê).

## Quando usar

- Usuário pede "commit", "git commit", "commita isso".
- Após uma sequência de mudanças prontas para serem registradas.
- Quando o histórico precisa de uma entrada nova e descritiva.

## Como aplicar

1. **Identifique o tipo** com base na natureza da mudança:
   - `feat` — funcionalidade nova
   - `fix` — correção de bug
   - `refactor` — mudança de código sem alterar comportamento
   - `docs` — só documentação
   - `test` — só testes
   - `chore` — manutenção, deps, configs sem impacto em runtime
   - `perf` — melhoria de performance
   - `style` — formatação (não confundir com mudanças visuais de UI)

2. **Escolha o escopo** (opcional, mas recomendado). É a área afetada: `feat(auth):`, `fix(api):`, `refactor(cli):`. Use o nome da pasta/módulo principal modificado.

3. **Escreva o subject (primeira linha)**:
   - Em inglês ou português, mas mantenha consistência no repo.
   - Imperativo: "add", "fix", "remove" — não "added", "fixed".
   - Sem ponto final.
   - Máximo 72 caracteres.

4. **Body (opcional, mas use quando o porquê não é óbvio)**:
   - Linha em branco após o subject.
   - Foco no **porquê**, não no **o quê**.
   - Quebre em 72 caracteres.

5. **Footer (opcional)**:
   - `BREAKING CHANGE: <descrição>` para mudanças quebrando compatibilidade.
   - `Closes #123` ou `Refs #123` para issues relacionadas.

## Exemplos

Bom:

```
feat(auth): add token refresh flow

Sessions were expiring mid-task and forcing users to restart.
The refresh runs silently 30s before expiry.

Closes #142
```

Bom (curto):

```
fix(cli): handle empty skills/ directory without crashing
```

Ruim:

```
update files
```

Ruim (foco no o quê, não no porquê):

```
fix: change line 42 of auth.ts to use Date.now()
```

## Anti-padrões

- Mensagens genéricas: "update", "fix stuff", "wip".
- Misturar múltiplos tipos no mesmo commit. Se você adicionou feature E corrigiu bug, são 2 commits.
- Subject em passado: "added", "fixed". Use imperativo.
- Body explicando o diff linha-a-linha — o diff já está lá.
- Usar `feat` para coisas que não são features (renomear arquivo = `refactor`, não `feat`).
