#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = process.cwd();
const setupsDir = join(root, "setups");
const indexFile = join(setupsDir, "_index.txt");
const registryFile = join(root, "skills-registry.json");

const errors = [];
const setupSlugPattern = /^[a-z0-9][a-z0-9-]*$/;

function readLines(file) {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line, index) => ({ value: line.trim(), line: index + 1 }))
    .filter(({ value }) => value && !value.startsWith("#"));
}

function isSafeRelativePath(value) {
  if (!value || value.startsWith("/") || value.includes("\\")) return false;
  return value.split("/").every(part => part && part !== "." && part !== "..");
}

if (!existsSync(setupsDir)) {
  errors.push("Missing setups/ directory.");
}

if (!existsSync(indexFile)) {
  errors.push("Missing setups/_index.txt.");
}

if (!existsSync(registryFile)) {
  errors.push("Missing skills-registry.json.");
}

let registryByPath = new Map();
if (existsSync(registryFile)) {
  const registry = JSON.parse(readFileSync(registryFile, "utf8")).skills ?? {};
  registryByPath = new Map(
    Object.entries(registry)
      .filter(([, entry]) => entry["local-path"])
      .map(([slug, entry]) => [entry["local-path"], slug])
  );
}

const setups = [];
const indexedSlugs = new Set();

if (existsSync(indexFile)) {
  for (const { value, line } of readLines(indexFile)) {
    const separator = value.indexOf("|");
    const slug = separator === -1 ? value : value.slice(0, separator);
    const description = separator === -1 ? "" : value.slice(separator + 1).trim();

    if (!slug || !description) {
      errors.push(`setups/_index.txt:${line} must use "slug|description".`);
      continue;
    }

    if (!setupSlugPattern.test(slug)) {
      errors.push(`setups/_index.txt:${line} has invalid setup slug "${slug}".`);
    }

    if (indexedSlugs.has(slug)) {
      errors.push(`setups/_index.txt:${line} duplicates setup slug "${slug}".`);
    }

    indexedSlugs.add(slug);
    setups.push({ slug, description });
  }
}

if (existsSync(setupsDir)) {
  const txtFiles = readdirSync(setupsDir)
    .filter(file => file.endsWith(".txt") && file !== "_index.txt")
    .map(file => basename(file, ".txt"));

  for (const slug of txtFiles) {
    if (!indexedSlugs.has(slug)) {
      errors.push(`setups/${slug}.txt exists but is not listed in setups/_index.txt.`);
    }
  }
}

let totalEntries = 0;
for (const setup of setups) {
  const file = join(setupsDir, `${setup.slug}.txt`);
  if (!existsSync(file)) {
    errors.push(`Missing setups/${setup.slug}.txt listed by setups/_index.txt.`);
    continue;
  }

  const seenPaths = new Set();
  const seenNames = new Set();

  for (const { value, line } of readLines(file)) {
    totalEntries += 1;

    if (!isSafeRelativePath(value)) {
      errors.push(`setups/${setup.slug}.txt:${line} has unsafe path "${value}".`);
      continue;
    }

    if (!value.startsWith("skills/")) {
      errors.push(`setups/${setup.slug}.txt:${line} must start with "skills/": "${value}".`);
    }

    if (seenPaths.has(value)) {
      errors.push(`setups/${setup.slug}.txt:${line} duplicates path "${value}".`);
    }
    seenPaths.add(value);

    const skillName = basename(value);
    if (seenNames.has(skillName)) {
      errors.push(`setups/${setup.slug}.txt:${line} duplicates skill name "${skillName}".`);
    }
    seenNames.add(skillName);

    if (!existsSync(join(root, value, "SKILL.md"))) {
      errors.push(`setups/${setup.slug}.txt:${line} points to missing skill "${value}".`);
    }

    if (!registryByPath.has(value)) {
      errors.push(
        `setups/${setup.slug}.txt:${line} is not present as local-path in skills-registry.json: "${value}".`
      );
    }
  }
}

if (errors.length) {
  console.error(`Setup validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${setups.length} setup(s) with ${totalEntries} skill reference(s).`);
