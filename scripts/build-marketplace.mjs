// Generates .claude-plugin/marketplace.json from skills-registry.json.
// The vercel-labs/skills CLI reads this manifest (getPluginGroupings) and groups
// skills by plugin name. This repo still publishes the manifest for grouping, but
// docs recommend explicit phase paths because the root picker is large.
//
// Run: `node scripts/build-marketplace.mjs` (re-run when skills-registry.json changes).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "marcioaltoe/skills";

// Friendly collection labels — keep in sync with COLLECTION_LABELS in web/scripts/build-index.mjs.
const LABELS = {
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
      "Curated agent skills grouped by workflow phase. Prefer installing a phase path or a single skill.",
  },
  plugins,
};

mkdirSync(join(root, ".claude-plugin"), { recursive: true });
const formattedManifest = JSON.stringify(manifest, null, 2).replace(
  /"skills": \[\n        "([^"]+)",\n        "([^"]+)"\n      \]/g,
  (match, first, second) => {
    const inline = `"skills": ["${first}", "${second}"]`;
    return inline.length + 6 <= 100 ? inline : match;
  }
);
writeFileSync(join(root, ".claude-plugin/marketplace.json"), `${formattedManifest}\n`);

const total = plugins.reduce((n, p) => n + p.skills.length, 0);
console.log(
  `Wrote .claude-plugin/marketplace.json: ${plugins.length} collections, ${total} skills`
);
console.log(`  Install a phase: bunx skills add ${REPO}/skills/05-implementation-loop`);
