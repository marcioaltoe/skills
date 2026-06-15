// Builds the catalog index consumed by the Astro site.
// Parses every skills/<collection>/<name>/SKILL.md frontmatter into a single
// JSON document (skills + facet counts). The single category axis is the repo's
// real collection folder. Tags come from two sources kept separate:
//   - tags        : our curated classification (skills-tags.json overlay) — the default
//   - authorTags  : the skill's own frontmatter metadata.tags — opt-in in the UI
// Upstream provenance from skills-sources.json adds an `upstream` badge.
//
// Run standalone: `node scripts/build-index.mjs`
// Runs automatically via the `prebuild` / `predev` npm hooks.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", ".."); // web/scripts -> web -> repo root
const outFile = join(here, "..", "src", "data", "skills.json");
const manifestFile = join(repoRoot, "skills-sources.json");
const tagsFile = join(repoRoot, "skills-tags.json");

const REPO = "marcioaltoe/skills";
const installFor = path => `bunx skills add ${REPO}/${path}`;

// Friendly labels for the repo's installable collections (the single category axis).
const COLLECTION_LABELS = {
  "dev-backend": "Backend",
  "dev-frontend": "Frontend",
  "dev-core": "Core",
  "dev-methods": "Methods",
  "dev-specialized": "Specialized",
  marketing: "Marketing",
  writing: "Writing",
  "office-docs": "Office Docs",
  "product-design": "Product & Design",
  "knowledge-tools": "Knowledge Tools",
  "research-tools": "Research Tools",
  "llm-wiki": "LLM Wiki",
  learning: "Learning",
  "skill-authoring": "Skill Authoring",
};

// Optional provenance manifest: { skills: { "<name>": { repo, path, ref } } }.
let manifest = {};
if (existsSync(manifestFile)) {
  try {
    manifest = JSON.parse(readFileSync(manifestFile, "utf8")).skills ?? {};
  } catch (err) {
    console.warn(`Warning: could not parse ${manifestFile}: ${err.message}`);
  }
}

// Our curated tag overlay: { skills: { "<name>": ["frontend", ...] } }.
let tagOverlay = {};
if (existsSync(tagsFile)) {
  try {
    tagOverlay = JSON.parse(readFileSync(tagsFile, "utf8")).skills ?? {};
  } catch (err) {
    console.warn(`Warning: could not parse ${tagsFile}: ${err.message}`);
  }
}

const files = execSync("find skills -name SKILL.md", { cwd: repoRoot, encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean)
  .sort();

const skills = [];
const skipped = [];

for (const rel of files) {
  const raw = readFileSync(join(repoRoot, rel), "utf8");

  let fm;
  try {
    fm = matter(raw).data;
  } catch (err) {
    skipped.push({ rel, reason: `invalid frontmatter: ${err.message}` });
    continue;
  }

  const segments = rel.split("/"); // skills / <collection> / <folder> / SKILL.md
  const collection = segments[1];
  const folder = segments[segments.length - 2];
  const meta = (fm && fm.metadata) || {};
  const pick = key => (meta[key] !== undefined ? meta[key] : fm?.[key]);

  const name = (fm?.name ?? folder).toString().trim();
  const description = (fm?.description ?? "").toString().replace(/\s+/g, " ").trim();
  if (!name || !description) {
    skipped.push({ rel, reason: "missing name or description" });
    continue;
  }

  const internal = pick("internal") === true || pick("internal") === "true";
  if (internal) {
    skipped.push({ rel, reason: "internal" });
    continue;
  }

  // Author (skill frontmatter) tags — opt-in in the UI.
  const rawTags = pick("tags");
  const authorTags = Array.isArray(rawTags)
    ? rawTags.map(t => String(t).trim()).filter(Boolean)
    : typeof rawTags === "string"
      ? rawTags
          .split(",")
          .map(t => t.trim())
          .filter(Boolean)
      : [];
  // Our curated classification — the default tag set.
  const ourTags = Array.isArray(tagOverlay[name])
    ? tagOverlay[name].map(t => String(t).trim()).filter(Boolean)
    : [];

  const dir = `skills/${collection}/${folder}`;
  const upstream = manifest[name] ?? null;

  skills.push({
    name,
    slug: folder,
    collection,
    collectionLabel: COLLECTION_LABELS[collection] ?? collection,
    tags: ourTags,
    authorTags,
    version: pick("version") != null ? String(pick("version")) : null,
    author: pick("author") != null ? String(pick("author")).trim() : null,
    description,
    path: dir,
    githubUrl: `https://github.com/${REPO}/tree/main/${dir}`,
    install: installFor(dir),
    upstream: upstream
      ? { repo: upstream.repo, path: upstream.path ?? null, ref: upstream.ref ?? "main" }
      : null,
  });
}

// Collection facet — value (slug), friendly label, count, and the group install command.
const collCounts = {};
for (const s of skills) collCounts[s.collection] = (collCounts[s.collection] ?? 0) + 1;
const collections = Object.entries(collCounts)
  .map(([value, count]) => ({
    value,
    label: COLLECTION_LABELS[value] ?? value,
    count,
    install: installFor(`skills/${value}`),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// Tag facets — `tags` over our classification, `tagsAll` over our ∪ author.
const facet = selector => {
  const counts = {};
  for (const s of skills) for (const t of selector(s)) counts[t] = (counts[t] ?? 0) + 1;
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};
const tags = facet(s => s.tags);
const tagsAll = facet(s => [...new Set([...s.tags, ...s.authorTags])]);

skills.sort((a, b) => a.name.localeCompare(b.name));

const data = {
  generatedAt: new Date().toISOString(),
  repo: REPO,
  total: skills.length,
  upstreamTracked: skills.filter(s => s.upstream).length,
  collections,
  tags,
  tagsAll,
  skills,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`);

console.log(
  `Indexed ${skills.length} skills across ${collections.length} collections -> src/data/skills.json`
);
if (data.upstreamTracked)
  console.log(`  ${data.upstreamTracked} skill(s) tracked for upstream sync`);
console.log(`  tags: ${tags.length} ours, ${tagsAll.length} including author`);
if (skipped.length) {
  const hidden = skipped.filter(s => s.reason === "internal").length;
  const errors = skipped.filter(s => s.reason !== "internal");
  if (hidden) console.log(`  ${hidden} internal skill(s) hidden`);
  if (errors.length)
    console.log(
      `  Skipped ${errors.length} with issues:\n    ${errors.map(s => `${s.rel} (${s.reason})`).join("\n    ")}`
    );
}
