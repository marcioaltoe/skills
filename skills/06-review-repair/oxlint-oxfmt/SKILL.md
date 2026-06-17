---
name: oxlint-oxfmt
description: Use when configuring, running, or fixing Oxlint and Oxfmt in JavaScript or TypeScript projects. Covers lint scripts, format scripts, warning gates, type-aware linting, config files, fix flags, CI usage, and monorepo pitfalls. Do not use for ESLint-only, Prettier-only, or Biome-only projects unless migrating to the Oxc toolchain.
metadata:
  version: 0.1.0
  tags: [lint, format, typescript, qa]
---

# Oxlint and Oxfmt

Use this skill for projects that use the Oxc toolchain for linting and formatting.

Official sources:

- Oxc repository: https://github.com/oxc-project/oxc
- Oxlint docs: https://oxc.rs/docs/guide/usage/linter
- Oxfmt docs: https://oxc.rs/docs/guide/usage/formatter

## Detection

Before running commands, check for:

- `oxlint` or `oxc` packages in `package.json`
- `oxlint.config.ts` or `.oxlintrc.json`
- `.oxfmtrc.json` or `.oxfmtrc.jsonc`
- package scripts such as `lint`, `lint:fix`, `format`, or `fmt`

Use project scripts when they exist because they may include workspace filters, plugin flags, or warning gates.

## Common Commands

```bash
bun run lint
bun run lint:fix
bun run fmt
bun run fmt:check
```

Direct commands when no script exists:

```bash
oxlint
oxlint --fix
oxlint --type-aware
oxlint --deny-warnings
oxfmt --check .
oxfmt --write .
```

Prefer checking touched files when the project supports it. Run the full project gate before completion.

## Oxlint Configuration

Oxlint supports `.oxlintrc.json` and `oxlint.config.ts`.

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    typeAware: true,
  },
  rules: {
    "typescript/consistent-return": "error",
  },
});
```

Use `--type-aware` or `options.typeAware` when rules need TypeScript semantic information.

## Fixing Diagnostics

1. Read the rule name and message.
2. Fix the underlying issue, not just the syntax.
3. Use `--fix` for safe fixes.
4. Avoid unsafe or dangerous fixes unless the user explicitly approves them.
5. Use ignore comments only for confirmed false positives, with a reason.

```ts
// oxlint-ignore-next-line no-console -- CLI output is the command result
console.log(result);
```

## CI and Warning Gates

If the project treats warnings as failures, use one of:

```bash
oxlint --deny-warnings
oxlint --max-warnings 0
```

Do not claim lint passed if warnings remain and the repo policy treats warnings as blocking.

## Monorepo Guidance

- Run commands from the workspace root unless package scripts document otherwise.
- Watch for nested configs; Oxlint can resolve nested configuration files.
- Use package filters only when the repo's scripts support them.
- Re-run the aggregate verify command before delivery.

## Common Mistakes

- Running `npx oxlint` when the repo has a stricter `bun run lint` script.
- Suppressing diagnostics before understanding them.
- Formatting the whole repository for a narrow change.
- Forgetting type-aware linting when the config expects it.
- Treating warnings as acceptable in repositories with zero-warning policy.
