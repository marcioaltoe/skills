// Generates .claude-plugin/marketplace.json from skills-registry.json so that
// `bunx skills add marcioaltoe/skills` presents the install picker grouped by
// collection (each collection becomes a "plugin" / track). The vercel-labs/skills
// CLI reads this manifest (getPluginGroupings) and groups skills by plugin name.
//
// Run: `node scripts/build-marketplace.mjs` (re-run when skills-registry.json changes).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "marcioaltoe/skills";

// Friendly collection labels — keep in sync with COLLECTION_LABELS in web/scripts/build-index.mjs.
const LABELS = {
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

const registry = JSON.parse(readFileSync(join(root, "skills-registry.json"), "utf8")).skills;

const byCollection = {};
for (const skill of Object.values(registry)) {
  const c = skill.collection;
  (byCollection[c] ??= []).push(`./${skill["local-path"]}`);
}

const plugins = Object.keys(byCollection)
  .sort((a, b) => (LABELS[a] ?? a).localeCompare(LABELS[b] ?? b))
  .map(c => ({
    name: LABELS[c] ?? c,
    description: `${LABELS[c] ?? c} collection (${byCollection[c].length} skills)`,
    skills: byCollection[c].sort(),
  }));

const manifest = {
  name: "marcioaltoe-skills",
  metadata: {
    description:
      "Curated agent skills, grouped by collection. Install a whole collection or pick individual skills.",
  },
  plugins,
};

mkdirSync(join(root, ".claude-plugin"), { recursive: true });
writeFileSync(
  join(root, ".claude-plugin/marketplace.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

const total = plugins.reduce((n, p) => n + p.skills.length, 0);
console.log(
  `Wrote .claude-plugin/marketplace.json: ${plugins.length} collections, ${total} skills`
);
console.log(`  Install a collection: bunx skills add ${REPO}  -> grouped picker`);
