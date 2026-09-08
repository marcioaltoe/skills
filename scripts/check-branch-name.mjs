#!/usr/bin/env node

// Validates a branch name against the shared convention: `<type>/<description>`,
// where `<type>` is the same set of purpose types Conventional Commits uses for
// commit subjects and PR titles. Complements check-setups.mjs and
// check-registry.mjs, which validate the catalog rather than the git surface.
//
// Usage: node scripts/check-branch-name.mjs [branch-name]
//        Without an argument it checks the current branch.

import { execSync } from "node:child_process";

// Conventional Commits types. cog.toml pins scopes, not types, so this list is
// the convention's own; keep it in step with the types cog accepts.
const TYPES = [
  "feat",
  "fix",
  "refactor",
  "docs",
  "test",
  "chore",
  "perf",
  "build",
  "ci",
  "style",
  "revert",
];

// Branches a tool owns and names itself, exempt from the convention.
const TOOL_NAMESPACES = ["roundfix"];

// Long-lived branches that predate the convention and are never renamed.
const EXEMPT = ["main"];

const SEGMENT = "[a-z0-9]+(?:[._-][a-z0-9]+)*";
const PATTERN = new RegExp(`^(?:${TYPES.join("|")})/${SEGMENT}(?:/${SEGMENT})*$`);

function currentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

// The most useful message names the specific mistake, so the fix is one edit.
function diagnose(branch, prefix) {
  if (!prefix) {
    return `add a type prefix, one of: ${TYPES.join(", ")}`;
  }
  if (TYPES.includes(prefix)) {
    return "the description must be lowercase words joined by -, _ or .";
  }
  const near = { refact: "refactor", doc: "docs", tests: "test", feature: "feat", bug: "fix" };
  if (near[prefix]) {
    return `use "${near[prefix]}/" instead of "${prefix}/"`;
  }
  if (/^[a-z]{1,3}$/.test(prefix)) {
    return `"${prefix}/" looks like initials; use a purpose type: ${TYPES.join(", ")}`;
  }
  return `"${prefix}/" is not a purpose type; use one of: ${TYPES.join(", ")}`;
}

const branch = (process.argv[2] ?? currentBranch()).trim();
const slash = branch.indexOf("/");
const prefix = slash === -1 ? null : branch.slice(0, slash);

if (!branch || branch === "HEAD") {
  console.error("Could not determine the branch name; pass it as an argument.");
  process.exit(1);
}

if (EXEMPT.includes(branch)) {
  console.log(`Branch "${branch}" is exempt from the naming convention.`);
  process.exit(0);
}

if (prefix && TOOL_NAMESPACES.includes(prefix)) {
  console.log(`Branch "${branch}" uses a tool-owned namespace.`);
  process.exit(0);
}

if (!PATTERN.test(branch)) {
  console.error(
    `Branch "${branch}" does not follow <type>/<description>: ${diagnose(branch, prefix)}.`
  );
  console.error("Example: chore/sync-upstream-skills");
  process.exit(1);
}

console.log(`Branch "${branch}" follows the naming convention.`);
