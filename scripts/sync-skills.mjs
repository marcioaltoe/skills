// Upstream sync for vendored skills.
//
// Reads skills-registry.json and checks entries that have an upstream `repo`.
// Each vendored skill can set `update`:
//
//   - off    -> skip the entry; do not call GitHub for it
//   - auto   -> update local skill content and allow workflow auto-merge
//   - manual -> update local skill content, but require human PR review
//
// The script compares the current upstream folder tree-SHA with
// skills-registry.lock.json. When a checked skill is new or changed upstream,
// it replaces the local skill directory with the upstream folder content,
// updates the lock baseline, and writes sync-report.md.
//
// Usage:   node scripts/sync-skills.mjs
// Token:   GITHUB_TOKEN / GH_TOKEN env var, or `gh auth token` (local).
// Outputs: skills-registry.lock.json, sync-report.md, and CI outputs.

import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = join(root, "skills-registry.json");
const lockPath = join(root, "skills-registry.lock.json");
const reportPath = join(root, "sync-report.md");
const tempRoot = join(root, ".sync-skills-tmp");
const updateModes = new Set(["off", "auto", "manual"]);

function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) return fromEnv;
  try {
    return execSync("gh auth token", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
const TOKEN = resolveToken();

async function gh(apiPath) {
  const res = await fetch(`https://api.github.com${apiPath}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "marcioaltoe-skills-sync",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    const error = new Error(`GitHub API ${res.status} on ${apiPath}: ${body.slice(0, 160)}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

const encodePath = p => p.split("/").map(encodeURIComponent).join("/");
const fileShaMap = files =>
  Object.fromEntries(Object.entries(files).map(([path, file]) => [path, file.sha]));

function updateMode(src) {
  const mode = src.update || "manual";
  if (!updateModes.has(mode)) throw new Error(`invalid update mode: ${mode}`);
  return mode;
}

function safePathFromRoot(relativePath, label) {
  if (!relativePath || typeof relativePath !== "string") throw new Error(`${label} is required`);
  const target = resolve(root, relativePath);
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (target !== root && !target.startsWith(rootPrefix)) {
    throw new Error(`${label} leaves repository root: ${relativePath}`);
  }
  return target;
}

function safeJoin(base, relativePath) {
  if (
    !relativePath ||
    relativePath.startsWith("/") ||
    relativePath.split("/").includes("..") ||
    relativePath.includes("\0")
  ) {
    throw new Error(`unsafe upstream path: ${relativePath}`);
  }
  const target = resolve(base, relativePath);
  const basePrefix = base.endsWith(sep) ? base : `${base}${sep}`;
  if (target !== base && !target.startsWith(basePrefix)) {
    throw new Error(`upstream path leaves target directory: ${relativePath}`);
  }
  return target;
}

// Returns { folderSha, files: { relativePath: { sha, mode } } } for a skill folder.
async function upstreamState({ repo, path, ref }) {
  let folderSha;
  if (!path) {
    folderSha = (await gh(`/repos/${repo}/git/trees/${encodeURIComponent(ref)}`)).sha;
  } else {
    const slash = path.lastIndexOf("/");
    const parent = slash === -1 ? "" : path.slice(0, slash);
    const base = slash === -1 ? path : path.slice(slash + 1);
    const query = parent
      ? `${encodePath(parent)}?ref=${encodeURIComponent(ref)}`
      : `?ref=${encodeURIComponent(ref)}`;
    const entries = await gh(`/repos/${repo}/contents/${query}`);
    const dir = Array.isArray(entries) && entries.find(e => e.name === base && e.type === "dir");
    if (!dir) {
      const error = new Error(`folder not found: ${repo}/${path}@${ref}`);
      error.status = 404;
      throw error;
    }
    folderSha = dir.sha;
  }
  const tree = await gh(`/repos/${repo}/git/trees/${folderSha}?recursive=1`);
  const files = {};
  for (const node of tree.tree ?? []) {
    if (node.type === "blob") files[node.path] = { sha: node.sha, mode: node.mode };
  }
  return { folderSha, files };
}

// File-level diff between two { path: sha } maps.
function diffFiles(prev, cur) {
  const added = [];
  const removed = [];
  const modified = [];
  for (const p of Object.keys(cur)) {
    if (!(p in prev)) added.push(p);
    else if (prev[p] !== cur[p]) modified.push(p);
  }
  for (const p of Object.keys(prev)) if (!(p in cur)) removed.push(p);
  return { added: added.sort(), removed: removed.sort(), modified: modified.sort() };
}

async function changedFilesForDrift(repo, prevSha, curState) {
  // The lock stores folderSha. Re-fetch the previous tree by SHA to list
  // changed files; skip file details if GitHub no longer has that tree.
  try {
    const prevTree = await gh(`/repos/${repo}/git/trees/${prevSha}?recursive=1`);
    const prevFiles = {};
    for (const node of prevTree.tree ?? []) {
      if (node.type === "blob") prevFiles[node.path] = node.sha;
    }
    return diffFiles(prevFiles, fileShaMap(curState.files));
  } catch {
    return null;
  }
}

async function blobContent(repo, sha) {
  const blob = await gh(`/repos/${repo}/git/blobs/${sha}`);
  if (blob.encoding !== "base64") {
    throw new Error(`unsupported blob encoding for ${repo}@${sha}: ${blob.encoding}`);
  }
  return Buffer.from(blob.content.replace(/\s/g, ""), "base64");
}

async function syncSkillContent(name, src, state) {
  const target = safePathFromRoot(src["local-path"], `${name}.local-path`);
  const temp = join(tempRoot, name.replace(/[^a-zA-Z0-9._-]/g, "_"));
  rmSync(temp, { recursive: true, force: true });
  mkdirSync(temp, { recursive: true });

  for (const [relativePath, file] of Object.entries(state.files)) {
    const destination = safeJoin(temp, relativePath);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, await blobContent(src.repo, file.sha));
    chmodSync(destination, file.mode === "100755" ? 0o755 : 0o644);
  }

  mkdirSync(dirname(target), { recursive: true });
  rmSync(target, { recursive: true, force: true });
  renameSync(temp, target);
}

function upstreamUrl(r) {
  return `https://github.com/${r.repo}/tree/${r.ref}${r.path ? `/${r.path}` : ""}`;
}

function commitsUrl(r) {
  return `https://github.com/${r.repo}/commits/${r.ref}${r.path ? `/${r.path}` : ""}`;
}

function reportLine(r) {
  const source = `${r.repo}/${r.path || ""}`;
  return `\`${r.name}\` (${r.update}) - [\`${source}\`](${upstreamUrl(r)})`;
}

function addUpdateSection(lines, title, items) {
  if (!items.length) return;
  lines.push(`## ${title}`, "");
  for (const r of items) {
    lines.push(`### ${reportLine(r)}`);
    lines.push(`Upstream commits for this path: ${commitsUrl(r)}`);
    lines.push(`Status: \`${r.status}\``);
    if (r.changes) {
      const fmt = (label, arr) =>
        arr.length ? `- **${label}**: ${arr.map(f => `\`${f}\``).join(", ")}` : null;
      for (const line of [
        fmt("modified", r.changes.modified),
        fmt("added", r.changes.added),
        fmt("removed", r.changes.removed),
      ].filter(Boolean))
        lines.push(line);
    }
    lines.push("");
  }
}

async function main() {
  if (!existsSync(registryPath)) {
    console.error("skills-registry.json not found.");
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const lock = existsSync(lockPath)
    ? JSON.parse(readFileSync(lockPath, "utf8"))
    : { version: 1, skills: {} };
  lock.skills ??= {};

  const entries = Object.entries(registry.skills ?? {}).filter(([, v]) => v.repo);
  const results = [];

  rmSync(tempRoot, { recursive: true, force: true });
  mkdirSync(tempRoot, { recursive: true });

  try {
    for (const [name, src] of entries) {
      const ref = src.ref || "main";
      const path = src.path || "";
      let mode;
      try {
        mode = updateMode(src);
        if (mode === "off") {
          results.push({ name, repo: src.repo, path, ref, update: mode, status: "skipped" });
          continue;
        }

        const state = await upstreamState({ repo: src.repo, path, ref });
        const prev = lock.skills[name];
        let status;
        let changes = null;
        if (!prev || !prev.folderSha) status = "baseline";
        else if (
          prev.folderSha === state.folderSha &&
          prev.repo === src.repo &&
          (prev.path || "") === path &&
          prev.ref === ref
        )
          status = "unchanged";
        else {
          status = "drift";
          changes = await changedFilesForDrift(src.repo, prev.folderSha, state);
        }

        if (status === "baseline" || status === "drift") {
          await syncSkillContent(name, src, state);
        }

        lock.skills[name] = { repo: src.repo, path, ref, folderSha: state.folderSha };
        results.push({
          name,
          repo: src.repo,
          path,
          ref,
          update: mode,
          status,
          changes,
          prevSha: prev?.folderSha ?? null,
          newSha: state.folderSha,
        });
      } catch (err) {
        results.push({
          name,
          repo: src.repo,
          path,
          ref,
          update: mode || src.update || "manual",
          status: "error",
          error: err.message,
        });
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  const updated = results.filter(r => r.status === "drift" || r.status === "baseline");
  const autoUpdates = updated.filter(r => r.update === "auto");
  const manualUpdates = updated.filter(r => r.update === "manual");
  const drift = results.filter(r => r.status === "drift");
  const baseline = results.filter(r => r.status === "baseline");
  const errors = results.filter(r => r.status === "error");
  const skipped = results.filter(r => r.status === "skipped");
  const unchanged = results.filter(r => r.status === "unchanged");
  const meaningfulChange = updated.length > 0;
  const manualChanged = manualUpdates.length > 0;
  const autoMerge = meaningfulChange && !manualChanged && errors.length === 0;

  const sortedSkills = {};
  for (const key of Object.keys(lock.skills).sort()) sortedSkills[key] = lock.skills[key];
  writeFileSync(lockPath, `${JSON.stringify({ version: 1, skills: sortedSkills }, null, 2)}\n`);

  const lines = [];
  lines.push("# Upstream skills sync report", "");
  lines.push(
    `Tracked: **${entries.length - skipped.length}** · skipped: **${skipped.length}** · updated: **${updated.length}** · drift: **${drift.length}** · baseline: **${baseline.length}** · unchanged: **${unchanged.length}** · errors: **${errors.length}**`,
    ""
  );
  lines.push(
    `Auto updates: **${autoUpdates.length}** · manual updates: **${manualUpdates.length}** · auto-merge eligible: **${autoMerge ? "yes" : "no"}**`,
    ""
  );

  addUpdateSection(lines, "Auto updates", autoUpdates);
  addUpdateSection(lines, "Manual updates", manualUpdates);

  if (skipped.length) {
    lines.push("## Skipped", "");
    for (const r of skipped) lines.push(`- ${reportLine(r)}`);
    lines.push("");
  }
  if (errors.length) {
    lines.push("## Errors", "");
    for (const r of errors) lines.push(`- \`${r.name}\` -> \`${r.repo}/${r.path}\`: ${r.error}`);
    lines.push("");
  }
  if (!meaningfulChange && !errors.length) {
    lines.push("All checked skills are unchanged upstream.", "");
  }
  writeFileSync(reportPath, `${lines.join("\n")}\n`);

  console.log(
    `tracked=${entries.length - skipped.length} skipped=${skipped.length} updated=${updated.length} drift=${drift.length} baseline=${baseline.length} unchanged=${unchanged.length} errors=${errors.length} auto=${autoUpdates.length} manual=${manualUpdates.length} auto_merge=${autoMerge}`
  );
  if (updated.length) console.log("updated:", updated.map(r => `${r.name}:${r.update}`).join(", "));
  if (errors.length) console.log("errors:", errors.map(r => `${r.name} (${r.error})`).join("; "));

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      [
        `changed=${meaningfulChange}`,
        `updates=${updated.length}`,
        `drift=${drift.length}`,
        `baseline=${baseline.length}`,
        `errors=${errors.length}`,
        `manual_changed=${manualChanged}`,
        `auto_changed=${autoUpdates.length > 0}`,
        `auto_merge=${autoMerge}`,
      ].join("\n") + "\n"
    );
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
