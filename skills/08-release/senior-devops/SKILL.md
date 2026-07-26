---
name: senior-devops
description: Operate production infrastructure like an experienced engineer — reconcile reality before planning, review the plan before applying, keep one writer on the state, size the blast radius, and back every claim with evidence. Use for Terraform/OpenTofu changes, cloud provisioning, deploys, rollbacks, incident response, runbooks, or when the user says "apply this", "deploy to prod", "infra change", or "devops".
metadata:
  category: devops
  tags: [devops, infrastructure, terraform, deployment, observability, incident-response, runbook]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# Senior DevOps

Production is a live system with users on it, not a codebase with a test suite. Every rule here exists because the cheap version of the mistake does not exist: an apply is not a commit you can amend, and a destroyed database is not a failing test.

Four ideas carry this skill: **reality first**, **the plan is the artifact**, **one writer**, **blast radius**.

## When to use

- Planning, reviewing, or applying any infrastructure change (Terraform, OpenTofu, Pulumi, CloudFormation).
- Deploying, rolling back, or resizing anything users depend on.
- Responding to an incident, or writing the runbook that prevents the next one.
- Reviewing someone else's infrastructure change before it reaches production.

## 1. Reality first

Code and state both lie. Reconcile three views before designing anything on top of them:

| View                           | How to read it                                                   |
| ------------------------------ | ---------------------------------------------------------------- |
| What the code declares         | The `.tf` files on the branch you are about to change            |
| What the state holds           | `terraform plan` on an untouched tree, `terraform state list`    |
| What the provider actually has | The provider CLI, read-only (`doctl`, `aws`, `gcloud`, `flyctl`) |

A resource in state that no longer exists, or a resource in the account that no code manages, is **drift** — name it out loud before you build on it. Report drift as drift; do not silently import, recreate, or delete it.

**Completion criterion**: every resource inside the change's blast radius appears in all three views, or is explicitly recorded as unmanaged.

## 2. The plan is the artifact

- Read `terraform plan` resource by resource, not as a summary line. Count creates, updates, **replaces**, and destroys.
- A plan that proposes replacing or destroying something you did not intend to touch is a stop condition. Stop and ask; do not "accept the diff".
- Apply the plan you reviewed: `terraform plan -out=tfplan` then `terraform apply tfplan`. A bare `apply` re-plans against a world that may have moved.
- Get explicit authority before `apply`, `destroy`, `import`, or any `state` subcommand. These are the four verbs that change production out from under everyone else.

## 3. One writer

Assume the state has **no lock** unless you can point at the mechanism that provides it (S3 + DynamoDB, `use_lockfile`, HCP Terraform, a Consul backend). S3-compatible stores such as DigitalOcean Spaces, MinIO, or R2 usually offer none.

- One apply at a time, per state. Two concurrent applies against an unlocked state corrupt it.
- Announce the apply where the team can see it, and say when it finished.
- CI and a human shell are two writers. Pick one.

## 4. Blast radius

- Split state by lifecycle tier — network, data, compute, edge — so a bad apply reaches one tier, not the account.
- Apply dependencies in ascending order, destroy in descending order. Prefer one stage at a time over an apply-everything target.
- Guard the irreplaceable: `prevent_destroy` on databases, buckets, and volumes.
- Use `ignore_changes` for fields mutated out of band (`user_data`, `ssh_keys`, `size`), and document each one as an out-of-band operation in the runbook — otherwise the next engineer believes changing the variable moves the resource.
- Prefer stable references over addresses: a droplet/instance ID survives a reassigned IP; a `/32` does not.

## 5. Secrets never land in the repo

- Provider tokens and state credentials come from the environment, never from tracked files. `*.tfvars`, `backend.hcl`, and `.env` stay untracked.
- Mark every credential-bearing output `sensitive`, and remember that state files hold plaintext secrets — the state bucket is a credential store, so lock it down like one.
- A secret that reached a commit, a log, a plan output, or a screenshot is leaked. Rotate it; do not rewrite history and call it handled.

## 6. Deploys: immutable, reversible, observed

- Ship immutable artifacts pinned by digest, not by a mutable tag. `latest` is not a deployment.
- Know the rollback before you deploy: the previous digest, the command that restores it, and how long it takes.
- Health-check before shifting traffic, and verify from outside the box — request the public URL, do not just read a container's logs.
- Migrations go forward-compatible and separate from the code deploy: expand, deploy, contract. A migration that only works with the new code has no rollback.

## 7. Incidents

Stabilize, then diagnose, then fix properly — in that order, and never skip the third. Restore service with the smallest reversible action, capture what you observed while it is still true, and record a timeline as you go. When the fire is out, fix the cause rather than the symptom (see `no-workarounds`) and fold what you learned into the runbook.

## 8. Evidence

"Applied", "deployed", "fixed", and "verified" are claims about production and need output pasted from the command that proves each one. Uncommanded confidence is the failure mode this whole skill guards against — see `evidence-gate` for the completion contract.

## Anti-patterns

- Designing a change from the code alone, then discovering the account disagrees during the apply.
- Applying a plan nobody read, or re-planning at apply time and calling it the same change.
- Running `apply-all` while drift is unreconciled.
- Reaching for `terraform state rm` or `-target` to make an inconvenient plan smaller instead of fixing why the plan is wrong.
- Fixing production by hand and leaving the code behind — the next apply reverts your fix.
- Declaring success from the deploy tool's exit code instead of from the system's behaviour.
