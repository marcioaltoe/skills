# LLM Wiki

Colecao de skills para aplicar o metodo de LLM Wiki descrito por Andrej Karpathy: uma wiki Markdown persistente mantida por LLM, onde fontes brutas ficam separadas da sintese curada.

Fonte principal pesquisada via Exa: [Andrej Karpathy, `llm-wiki`](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?permalink_comment_id=6079205).

## O metodo

O metodo troca a ideia de "perguntar para um monte de documentos brutos" por uma camada intermediaria duravel: a wiki. O LLM le novas fontes, extrai informacao importante, atualiza paginas de entidades e conceitos, revisa sinteses existentes, aponta contradicoes e melhora a estrutura com o tempo.

A wiki vira um artefato cumulativo. O chat continua util para exploracao, mas o conhecimento que deve sobreviver vai para arquivos Markdown versionaveis, pesquisaveis e editaveis no Obsidian ou no terminal.

## Camadas

```text
wiki/
  AGENTS.md        # regras da wiki: taxonomia, formato, workflows
  raw/             # fontes originais ou capturas brutas
  index.md         # catalogo navegavel
  log.md           # historico append-only
  sources/         # uma pagina por fonte
  entities/        # pessoas, empresas, produtos, projetos
  concepts/        # ideias, metodos, termos, padroes
  synthesis/       # resumos de alto nivel, comparacoes, mapas
  questions/       # respostas que merecem persistir
```

## Workflows

### Ingestao

1. Adicionar ou apontar para uma fonte bruta.
2. Extrair metadados, claims importantes, evidencias e perguntas abertas.
3. Buscar paginas relacionadas na wiki.
4. Criar ou atualizar `sources/<slug>.md`.
5. Atualizar paginas de `entities/`, `concepts/` e `synthesis/` afetadas.
6. Atualizar `index.md`.
7. Registrar o trabalho em `log.md`.

Uma fonte relevante pode tocar muitas paginas. Isso e esperado: a forca do metodo esta na manutencao incremental dos links e sinteses, nao em guardar um resumo isolado.

### Consulta

1. Comecar por `index.md`.
2. Buscar com `qmd` ou `rg`.
3. Responder com base nas paginas encontradas.
4. Separar fato citado, sintese e inferencia.
5. Persistir respostas uteis em `questions/` ou `synthesis/`.
6. Registrar a consulta no `log.md` quando ela produzir novo conhecimento.

### Lint

Revisar periodicamente:

- contradicoes entre fontes e sinteses
- claims datados que precisam ser verificados
- paginas orfas
- fontes sem entrada no indice
- paginas com claims sem fonte
- duplicacao de entidades ou conceitos
- perguntas abertas que ja podem ser respondidas

## Skills nesta colecao

| Skill                           | Papel no metodo                                                  |
| ------------------------------- | ---------------------------------------------------------------- |
| `llm-wiki-method`               | Orquestra ingestao, consulta, lint e convencoes da wiki.         |
| `llm-wiki-source-capture`       | Captura fontes brutas, clippings, transcripts e inbox.           |
| `llm-wiki-schema`               | Mantem o contrato `AGENTS.md`/`CLAUDE.md` da wiki.               |
| `llm-wiki-ingest`               | Compila fontes em paginas, claims, entidades e conceitos.        |
| `llm-wiki-query`                | Consulta a wiki com citacoes e salva respostas reutilizaveis.    |
| `llm-wiki-index-log`            | Mantem `index.md` e `log.md` navegaveis e auditaveis.            |
| `llm-wiki-dedupe-merge`         | Detecta duplicatas, aliases faltantes e merge seguro.            |
| `llm-wiki-lint`                 | Faz health check de links, frontmatter, citacoes e contradicoes. |
| `llm-wiki-git-sync`             | Versiona, revisa diffs e sincroniza backups da wiki.             |
| `exa-web-search-free`           | Descobre fontes externas e referencias atuais.                   |
| `firecrawl`                     | Extrai paginas web e crawls em Markdown limpo para ingestao.     |
| `qmd`                           | Pesquisa local em bases Markdown com busca lexical e semantica.  |
| `obsidian-markdown`             | Escreve notas compativeis com Obsidian, wikilinks e callouts.    |
| `obsidian-cli`                  | Interage com vaults Obsidian pela linha de comando.              |
| `obsidian-bases`                | Cria views de fontes, entidades, status e revisoes da wiki.      |
| `docs-writer`                   | Mantem documentacao tecnica clara e consistente.                 |
| `doc-coauthoring`               | Guia criacao colaborativa de documentos e sinteses maiores.      |
| `writing-clearly-and-concisely` | Revisa prosa para clareza e concisao.                            |
| `mermaid-syntax`                | Cria diagramas Mermaid embutidos nas notas Markdown.             |

## Politica de copias por contexto

Algumas skills desta colecao tambem continuam em suas colecoes originais, como `productivity`, `dev-base-skills`, `write-common` e `write-tech-doc`.

Esta duplicacao e intencional. Para colecoes instalaveis por contexto, usamos copias fisicas em vez de symlinks, porque `bunx skills add marcioaltoe/skills/skills/<collection>` pode instalar apenas o subdiretorio solicitado. Um symlink relativo para fora da colecao ficaria fragil nesse fluxo.

Quando uma skill compartilhada for atualizada, sincronize a copia em todas as colecoes onde ela aparece e valide com:

```bash
bunx skills add ./skills/llm-wiki --list
bunx skills add ./skills/productivity --list
bunx skills add . --list
```

## Como instalar

```bash
bunx skills add marcioaltoe/skills/skills/llm-wiki -g
```

Instalar uma skill especifica:

```bash
bunx skills add marcioaltoe/skills/skills/llm-wiki --skill llm-wiki-method -g
```

## Prompts de uso

Ingestao:

```text
Use o metodo llm-wiki para ingerir esta fonte em ~/notes/wiki.
Atualize paginas relacionadas, index.md e log.md.
```

Consulta:

```text
Consulte minha LLM Wiki em ~/notes/wiki e responda com links para as paginas usadas.
Se a resposta for reutilizavel, salve em questions/.
```

Lint:

```text
Rode um lint da LLM Wiki em ~/notes/wiki.
Procure contradicoes, paginas orfas, claims sem fonte e entradas faltando no index.md.
```

## Regras operacionais

- A fonte bruta fica em `raw/` ou e referenciada com URL/path estavel.
- A sintese vive em Markdown, com links perto das claims.
- `index.md` e `log.md` sao infraestrutura critica, nao pos-escrito.
- Contradicoes devem ser preservadas e explicadas, nao apagadas.
- Toda atualizacao relevante deve melhorar a capacidade futura de buscar, navegar ou sintetizar.
