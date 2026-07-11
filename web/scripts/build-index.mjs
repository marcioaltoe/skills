// Builds the catalog index consumed by the Astro site.
// Parses every skills/<collection>/<name>/SKILL.md frontmatter into a single
// JSON document (skills + facet counts). The single category axis is the repo's
// real collection folder. Author, curated tags, and upstream provenance come
// from skills-registry.json (one entry per skill). Tags have two sources:
//   - tags        : our curated classification (skills-registry.json) — the default
//   - authorTags  : the skill's own frontmatter metadata.tags — opt-in in the UI
//
// Run standalone: `node scripts/build-index.mjs`
// Runs automatically via the `prebuild` / `predev` npm hooks.

import { readFileSync, writeFileSync, mkdirSync, existsSync, globSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", ".."); // web/scripts -> web -> repo root
const outFile = join(here, "..", "src", "data", "skills.json");
const registryFile = join(repoRoot, "skills-registry.json");

// Also the source of astro.config.mjs `site`/`base`; keep the two in sync.
const REPO = "marcioaltoe/skills";
const installFor = path => `bunx skills add ${REPO}/${path}`;

// Friendly labels for the repo's installable collections (the single category axis).
const COLLECTION_LABELS = {
  "00-setup": "00 Setup",
  "01-discovery": "01 Discovery",
  "02-planning": "02 Planning",
  "03-engineering-design": "03 Engineering Design",
  "04-issue-decomposition": "04 Issue Decomposition",
  "05-implementation-loop": "05 Implementation Loop",
  "06-review-repair": "06 Review & Repair",
  "07-evidence-delivery": "07 Evidence & Delivery",
  "08-release": "08 Release",
  "09-learning-loop": "09 Learning Loop",
  "10-marketing": "10 Marketing",
};

// Single skills registry: per skill { author, tags, local-path, [repo, path, ref], collection }.
let registry = {};
if (existsSync(registryFile)) {
  try {
    registry = JSON.parse(readFileSync(registryFile, "utf8")).skills ?? {};
  } catch (err) {
    console.warn(`Warning: could not parse ${registryFile}: ${err.message}`);
  }
}

const files = globSync("skills/**/SKILL.md", { cwd: repoRoot })
  .map(file => file.replaceAll("\\", "/"))
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
  // The registry is keyed by folder (slug); fall back to the frontmatter name.
  const reg = registry[folder] ?? registry[name] ?? {};
  // Our curated classification — the default tag set.
  const ourTags = Array.isArray(reg.tags)
    ? reg.tags.map(t => String(t).trim()).filter(Boolean)
    : [];
  const fmAuthor = pick("author") != null ? String(pick("author")).trim() : null;

  const dir = `skills/${collection}/${folder}`;

  skills.push({
    name,
    slug: folder,
    collection,
    collectionLabel: COLLECTION_LABELS[collection] ?? collection,
    tags: ourTags,
    authorTags,
    version: pick("version") != null ? String(pick("version")) : null,
    author: reg.author ?? fmAuthor,
    description,
    path: dir,
    githubUrl: `https://github.com/${REPO}/tree/main/${dir}`,
    install: installFor(dir),
    upstream: reg.repo ? { repo: reg.repo, path: reg.path ?? null, ref: reg.ref ?? "main" } : null,
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

// Setup presets — read here (the only place that resolves the repo root) so the
// prerendered setups page consumes the generated index instead of the filesystem.
const setupsDir = join(repoRoot, "setups");
const nonCommentLines = raw =>
  raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
let setups = [];
if (existsSync(join(setupsDir, "_index.txt"))) {
  setups = nonCommentLines(readFileSync(join(setupsDir, "_index.txt"), "utf8")).map(line => {
    const separator = line.indexOf("|");
    const slug = separator === -1 ? line : line.slice(0, separator);
    const description = separator === -1 ? "" : line.slice(separator + 1).trim();
    const setupFile = join(setupsDir, `${slug}.txt`);
    const paths = existsSync(setupFile) ? nonCommentLines(readFileSync(setupFile, "utf8")) : [];
    return { slug, description, paths };
  });
}

const data = {
  generatedAt: new Date().toISOString(),
  repo: REPO,
  total: skills.length,
  upstreamTracked: skills.filter(s => s.upstream).length,
  collections,
  tags,
  tagsAll,
  skills,
  setups,
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
