// Upstream drift detector for vendored skills.
//
// Reads skills-sources.json (the curated provenance manifest), and for every
// tracked skill computes the CURRENT upstream folder tree-SHA from the GitHub
// API. It compares that against the baseline recorded in skills-sources.lock.json:
//
//   - no baseline yet  -> "baseline"  (records the starting point, no drift)
//   - SHA unchanged     -> "unchanged"
//   - SHA changed        -> "drift"     (upstream authors changed the skill)
//   - repo/path missing  -> "error"     (manifest entry needs fixing)
//
// It NEVER touches the local skill content — local hardening is preserved.
// It only updates the lock baselines and writes a Markdown report describing
// what changed upstream, so a human can review and port changes via PR.
//
// Usage:   node scripts/sync-skills.mjs
// Token:   GITHUB_TOKEN / GH_TOKEN env var, or `gh auth token` (local).
// Outputs: skills-sources.lock.json (updated), sync-report.md, and
//          `changed`/`drift`/`errors`/`baseline` to $GITHUB_OUTPUT when in CI.

import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "skills-sources.json");
const lockPath = join(root, "skills-sources.lock.json");
const reportPath = join(root, "sync-report.md");

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

// Returns { folderSha, files: { relativePath: blobSha } } for a skill folder.
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
  for (const node of tree.tree ?? []) if (node.type === "blob") files[node.path] = node.sha;
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

async function changedFilesForDrift(repo, ref, prevSha, curState) {
  // The lock stores only folderSha. Re-fetch the previous tree by its SHA
  // (trees are content-addressed) to list which files changed upstream.
  try {
    const prevTree = await gh(`/repos/${repo}/git/trees/${prevSha}?recursive=1`);
    const prevFiles = {};
    for (const node of prevTree.tree ?? [])
      if (node.type === "blob") prevFiles[node.path] = node.sha;
    return diffFiles(prevFiles, curState.files);
  } catch {
    return null; // previous tree unavailable (GC'd); skip file-level detail
  }
}

async function main() {
  if (!existsSync(manifestPath)) {
    console.error("skills-sources.json not found.");
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const lock = existsSync(lockPath)
    ? JSON.parse(readFileSync(lockPath, "utf8"))
    : { version: 1, skills: {} };
  lock.skills ??= {};

  const entries = Object.entries(manifest.skills ?? {});
  const results = [];

  for (const [name, src] of entries) {
    const ref = src.ref || "main";
    const path = src.path || "";
    try {
      const state = await upstreamState({ repo: src.repo, path, ref });
      const prev = lock.skills[name];
      let status;
      let changes = null;
      if (!prev || !prev.folderSha) status = "baseline";
      else if (prev.folderSha === state.folderSha && prev.ref === ref) status = "unchanged";
      else {
        status = "drift";
        changes = await changedFilesForDrift(src.repo, ref, prev.folderSha, state);
      }
      lock.skills[name] = { repo: src.repo, path, ref, folderSha: state.folderSha };
      results.push({
        name,
        repo: src.repo,
        path,
        ref,
        status,
        changes,
        prevSha: prev?.folderSha ?? null,
        newSha: state.folderSha,
      });
    } catch (err) {
      results.push({ name, repo: src.repo, path, ref, status: "error", error: err.message });
    }
  }

  const drift = results.filter(r => r.status === "drift");
  const baseline = results.filter(r => r.status === "baseline");
  const errors = results.filter(r => r.status === "error");
  const unchanged = results.filter(r => r.status === "unchanged");
  const meaningfulChange = drift.length > 0 || baseline.length > 0;

  // Write the lock with stable key ordering so diffs stay clean.
  const sortedSkills = {};
  for (const key of Object.keys(lock.skills).sort()) sortedSkills[key] = lock.skills[key];
  writeFileSync(lockPath, `${JSON.stringify({ version: 1, skills: sortedSkills }, null, 2)}\n`);

  // Build the human-readable report.
  const line = r =>
    `\`${r.name}\` — [\`${r.repo}/${r.path || ""}\`](https://github.com/${r.repo}/tree/${r.ref}/${r.path})`;
  const lines = [];
  lines.push("# Upstream skills sync report", "");
  lines.push(
    `Tracked: **${entries.length}** · drift: **${drift.length}** · baseline: **${baseline.length}** · unchanged: **${unchanged.length}** · errors: **${errors.length}**`,
    ""
  );

  if (drift.length) {
    lines.push("## ⇅ Upstream changed (review & port manually)", "");
    for (const r of drift) {
      lines.push(`### ${line(r)}`);
      lines.push(
        `Upstream commits for this path: https://github.com/${r.repo}/commits/${r.ref}/${r.path}`
      );
      if (r.changes) {
        const fmt = (label, arr) =>
          arr.length ? `- **${label}**: ${arr.map(f => `\`${f}\``).join(", ")}` : null;
        for (const l of [
          fmt("modified", r.changes.modified),
          fmt("added", r.changes.added),
          fmt("removed", r.changes.removed),
        ].filter(Boolean))
          lines.push(l);
      }
      lines.push("");
    }
  }
  if (baseline.length) {
    lines.push("## 🆕 Baselines established", "");
    for (const r of baseline) lines.push(`- ${line(r)}`);
    lines.push("");
  }
  if (errors.length) {
    lines.push("## ⚠️ Errors (fix the manifest entry)", "");
    for (const r of errors) lines.push(`- \`${r.name}\` → \`${r.repo}/${r.path}\`: ${r.error}`);
    lines.push("");
  }
  if (!meaningfulChange && !errors.length)
    lines.push("All tracked skills are unchanged upstream. ✅", "");
  writeFileSync(reportPath, `${lines.join("\n")}\n`);

  // Console + CI outputs.
  console.log(
    `tracked=${entries.length} drift=${drift.length} baseline=${baseline.length} unchanged=${unchanged.length} errors=${errors.length}`
  );
  if (drift.length) console.log("drift:", drift.map(r => r.name).join(", "));
  if (errors.length) console.log("errors:", errors.map(r => `${r.name} (${r.error})`).join("; "));

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `changed=${meaningfulChange}\ndrift=${drift.length}\nbaseline=${baseline.length}\nerrors=${errors.length}\n`
    );
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
