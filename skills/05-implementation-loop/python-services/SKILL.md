---
name: python-services
description: Build Python CLIs, HTTP backends, and workers around shared application services. Use when creating a Python project, exposing a command as an API or job, choosing uv tooling, or implementing retries, cancellation, and durable work. Preserve existing argparse and framework contracts. For file ingestion and report generation, also load python-file-pipelines. Do not use for production frontend development.
license: CC-BY-4.0
metadata:
  category: python
  tags: [python, cli, backend, worker, testing, tooling]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Python services

Keep application behavior callable from a CLI, an HTTP handler, or a worker without importing any of those transports into the domain layer. Apply the repository's agent instructions and selected Roundfix Baseline before this skill; an installed framework skill does not authorize a migration or replace a project gate.

## Establish the project contract

1. Read `pyproject.toml`, `uv.lock`, Python version pins, entry points, repository verification commands, and the existing CLI/API schemas. Inspect the service and persistence boundaries before choosing a framework.
2. For an existing project, keep its supported Python versions, build backend, CLI framework, dependency allowlist, and type checker. Adopt additional tools through a reviewed project decision. A working argparse CLI does not need a Typer rewrite.
3. For a new project, propose a supported Python version, a packaged `src/` layout, uv, Ruff linting and formatting, pytest, and one type checker. Prefer ty when no checker is established; retain Pyright or mypy where its checks are already a contract. Add runtime frameworks only for the required surface.
4. Load `uv`, `ruff`, and `pytest` for their tooling. Load `ty`, `typer`, or `fastapi` only when using that tool. Retrieve documentation matching installed versions before selecting APIs. A skill installation does not install dependencies or configure an editor plugin.

Use Typer for a new typed CLI when its command model fits; keep argparse for existing contracts or a dependency-light tool. Use FastAPI for a typed HTTP API. Keep a synchronous batch command synchronous when it already meets the workload. Choose a queue or durable workflow engine only when scheduling, independent scaling, or recovery requires one.

## Keep execution reproducible

- Change project dependencies with `uv add`, `uv add --group dev`, `uv remove`, and targeted `uv lock --upgrade-package`. Keep manifest and lockfile changes together.
- Run Python and project tools through `uv run`. Create worktree and CI environments from the lock with the required dependency groups. Use `uv sync --locked` when manifest drift must fail; `--frozen` trusts the existing lock without checking that agreement.
- Respect the repository's lint rules. Fix the cause of diagnostics; retain specific, justified suppressions where the project requires them. A new checker is an additional decision, not permission to remove an existing gate.
- Use the declared gate. For a new project, propose Ruff format checking, Ruff linting, pytest, packaging checks, and the selected type checker as appropriate. Keep focused iteration separate from full repository verification.

## Implement one service, then its adapters

1. Express use cases as package functions or small service objects with explicit inputs, results, and typed failure categories. Keep global environment reads and I/O at adapters.
2. Make the CLI entry point parse input, invoke a service, render output, and map failures to documented exit codes. Reserve stdout for requested results and stderr for diagnostics. Preserve machine-readable schemas and non-interactive automation.
3. Make HTTP handlers validate transport data, enforce authentication and tenant authorization, invoke the same service, and map failures to status codes. Exclude credentials, internal exceptions, and sensitive input from responses and logs.
4. Initialize shared resources through the framework's documented lifecycle and close them at shutdown. Bound external requests with timeouts and concurrency limits. Keep blocking file/database work off an async event loop; use process isolation for CPU-heavy work when needed.
5. Keep in-process post-response tasks for small work whose loss is acceptable. Work that must survive a restart needs durable state and an independent recovery path; FastAPI `BackgroundTasks` alone does not provide that contract.

Read [references/workers.md](references/workers.md) when implementing scheduled work, queues, cancellation, retries, or crash recovery. Read `python-file-pipelines` when services consume files or produce reports.

## Verify the public boundary

- Exercise a console command through its declared entry point. Assert stdout, stderr, and the exit code, including `SystemExit` where raised; also smoke-test the installed console script in an isolated environment when packaging changes.
- Keep tests hermetic with `tmp_path` and `monkeypatch`: set or clear every environment variable the changed code reads, and isolate home, caches, filesystem, clock, network, and credentials as needed.
- A test that needs external data skips with a reason naming the missing path or variable. Keep such tests separate from the hermetic gate; a Roundfix Task Verification cannot depend on them.
- Select a newly introduced pytest test by its exact node ID alone in its Task Verification. Do not also pass a file or directory that contains it: deduplication can conceal a missing node ID. A missing exact node must fail before implementation.
- Exercise every changed operating-system branch with controlled platform values or the project's platform-specific checker/CI. A host-only run proves only the host branch.
- For HTTP adapters, test validation, authorization, error mapping, and resource lifecycle through an application client. For workers, test duplicate delivery, cancellation, and crash recovery at the persistence boundary.
- Within a Roundfix Run, follow the Task's verification authority and record focused evidence where requested. Leave Daemon-owned verification and settlement to the Daemon.

## Examples

- "Expose this existing argparse audit as an HTTP endpoint." Extract or reuse a service, retain the CLI contract, add a FastAPI adapter, and test both entry points. Keep existing dependency restrictions until a framework addition is approved.
- "Run nightly imports and resume after a crash." Start with a scheduled command and persisted checkpoints. Add a queue only if required; define duplicate delivery and commit behavior before adding retries.
- "Give operators a screen quickly." Propose an explicitly scoped internal prototype with `developing-with-streamlit`, keeping behavior in the service package. Keep a production frontend as a separate project decision.

## Delivery

Report changed behavior, commands actually run, untested external boundaries, and any required operator setup. Installing skills or passing lint does not prove a deployed API, durable worker, or complete user journey.

## Sources

- [uv project management](https://docs.astral.sh/uv/concepts/projects/)
- [pytest fixtures and monkeypatch](https://docs.pytest.org/en/stable/how-to/monkeypatch.html)
- [FastAPI background-task caveat](https://fastapi.tiangolo.com/tutorial/background-tasks/#caveat)
