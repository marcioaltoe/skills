// Builds the catalog index consumed by the Astro site.
// Parses every skills/<collection>/<name>/SKILL.md frontmatter into a single
// JSON document (skills + facet counts), and merges upstream provenance from
// skills-sources.json when present so the UI can badge auto-synced skills.
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

// Coarse "setup" buckets the catalog groups by, derived from the collection folder.
// Keep in sync with the collections table in the repository CLAUDE.md.
const SETUP_BY_COLLECTION = {
  "dev-backend": "Backend",
  "dev-frontend": "Frontend",
  "dev-core": "Fullstack",
  "dev-methods": "Architecture & Methods",
  "dev-specialized": "AI & Integrations",
  writing: "Writing & Docs",
  "office-docs": "Writing & Docs",
  "product-design": "Product & Design",
  marketing: "Marketing & GTM",
  "knowledge-tools": "Knowledge & Research",
  "research-tools": "Knowledge & Research",
  "llm-wiki": "Knowledge & Research",
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

// Optional cross-cutting tag overlay: { skills: { "<name>": ["frontend", ...] } }.
// Merged with each skill's frontmatter metadata.tags so filter tags can be
// curated in one place without editing every SKILL.md.
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

  const rawTags = pick("tags");
  const frontmatterTags = Array.isArray(rawTags)
    ? rawTags.map(t => String(t).trim()).filter(Boolean)
    : typeof rawTags === "string"
      ? rawTags
          .split(",")
          .map(t => t.trim())
          .filter(Boolean)
      : [];
  // Curated overlay tags come first so role/runtime facets lead on the card.
  const overlayTags = Array.isArray(tagOverlay[name])
    ? tagOverlay[name].map(t => String(t).trim()).filter(Boolean)
    : [];
  const tags = [...new Set([...overlayTags, ...frontmatterTags])];

  const dir = `skills/${collection}/${folder}`;
  const upstream = manifest[name] ?? null;

  skills.push({
    name,
    slug: folder,
    collection,
    setup: SETUP_BY_COLLECTION[collection] ?? "Other",
    category: pick("category") != null ? String(pick("category")).trim() : null,
    tags,
    version: pick("version") != null ? String(pick("version")) : null,
    author: pick("author") != null ? String(pick("author")).trim() : null,
    description,
    path: dir,
    githubUrl: `https://github.com/${REPO}/tree/main/${dir}`,
    install: `bunx skills add ${REPO}/${dir}`,
    upstream: upstream
      ? { repo: upstream.repo, path: upstream.path ?? null, ref: upstream.ref ?? "main" }
      : null,
  });
}

const countBy = key => {
  const counts = {};
  for (const skill of skills) {
    const value = skill[key];
    if (value == null) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

const tagCounts = {};
for (const skill of skills)
  for (const tag of skill.tags) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;

skills.sort(
  (a, b) =>
    a.setup.localeCompare(b.setup) ||
    a.collection.localeCompare(b.collection) ||
    a.name.localeCompare(b.name)
);

const data = {
  generatedAt: new Date().toISOString(),
  repo: REPO,
  total: skills.length,
  upstreamTracked: skills.filter(s => s.upstream).length,
  setups: countBy("setup"),
  collections: countBy("collection"),
  categories: countBy("category"),
  tags: Object.entries(tagCounts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
  skills,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`);

console.log(
  `Indexed ${skills.length} skills across ${data.setups.length} setups -> src/data/skills.json`
);
if (data.upstreamTracked)
  console.log(`  ${data.upstreamTracked} skill(s) tracked for upstream sync`);
if (skipped.length) {
  const hidden = skipped.filter(s => s.reason === "internal").length;
  const errors = skipped.filter(s => s.reason !== "internal");
  if (hidden) console.log(`  ${hidden} internal skill(s) hidden`);
  if (errors.length)
    console.log(
      `  Skipped ${errors.length} with issues:\n    ${errors.map(s => `${s.rel} (${s.reason})`).join("\n    ")}`
    );
}
