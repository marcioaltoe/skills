#!/usr/bin/env node

// Cross-consistency checks between skills/, skills-registry.json,
// skills-registry.lock.json, and each SKILL.md frontmatter. Complements
// check-setups.mjs (setup presets) and the skills CLI listing (frontmatter
// parseability), which validate their own surfaces only.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const root = process.cwd();
const skillsDir = join(root, "skills");
const registryFile = join(root, "skills-registry.json");
const lockFile = join(root, "skills-registry.lock.json");

const errors = [];
const warnings = [];
const updateModes = new Set(["off", "auto", "manual"]);

for (const [file, label] of [
  [skillsDir, "skills/ directory"],
  [registryFile, "skills-registry.json"],
  [lockFile, "skills-registry.lock.json"],
]) {
  if (!existsSync(file)) {
    console.error(`Missing ${label}.`);
    process.exit(1);
  }
}

const registry = JSON.parse(readFileSync(registryFile, "utf8"));
const entries = registry.skills ?? {};
const lock = JSON.parse(readFileSync(lockFile, "utf8")).skills ?? {};
const vocabulary = new Set(registry.tagVocabulary ?? []);

const skillFolders = [];
for (const collection of readdirSync(skillsDir)) {
  const collectionPath = join(skillsDir, collection);
  if (!statSync(collectionPath).isDirectory()) continue;
  for (const name of readdirSync(collectionPath)) {
    const folderPath = join(collectionPath, name);
    if (!statSync(folderPath).isDirectory()) continue;
    skillFolders.push({
      name,
      collection,
      path: `skills/${collection}/${name}`,
      hasSkillMd: existsSync(join(folderPath, "SKILL.md")),
    });
  }
}
const foldersByPath = new Map(skillFolders.map(folder => [folder.path, folder]));

// Registry entries against the skill tree.
const registryPaths = new Set();
for (const [slug, entry] of Object.entries(entries)) {
  const localPath = entry["local-path"];
  if (!localPath) {
    errors.push(`registry "${slug}" is missing local-path.`);
    continue;
  }

  if (registryPaths.has(localPath)) {
    errors.push(`registry "${slug}" duplicates local-path "${localPath}".`);
  }
  registryPaths.add(localPath);

  const folder = foldersByPath.get(localPath);
  if (!folder || !folder.hasSkillMd) {
    errors.push(`registry "${slug}" points to missing skill "${localPath}".`);
  }

  if (basename(localPath) !== slug) {
    errors.push(`registry "${slug}" key does not match folder name "${basename(localPath)}".`);
  }

  const collection = localPath.split("/")[1];
  if (entry.collection !== collection) {
    errors.push(
      `registry "${slug}" collection "${entry.collection}" does not match folder collection "${collection}".`
    );
  }

  if (!entry.author) {
    errors.push(`registry "${slug}" is missing author.`);
  }

  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    errors.push(`registry "${slug}" is missing tags.`);
  } else {
    for (const tag of entry.tags) {
      if (!vocabulary.has(tag)) {
        errors.push(`registry "${slug}" uses tag "${tag}" that is not in tagVocabulary.`);
      }
    }
  }

  if (entry.repo && !updateModes.has(entry.update)) {
    errors.push(`registry "${slug}" is vendored but has no valid update mode (off|auto|manual).`);
  }
  const licensePath = entry["license-path"];
  if (
    licensePath !== undefined &&
    (!entry.repo ||
      typeof licensePath !== "string" ||
      !licensePath ||
      licensePath.startsWith("/") ||
      licensePath.includes("\\") ||
      licensePath.split("/").some(part => !part || part === "." || part === ".."))
  ) {
    errors.push(`registry "${slug}" license-path must name an upstream repository-relative file.`);
  }
  if (licensePath && !existsSync(join(root, localPath, "LICENSE"))) {
    errors.push(`registry "${slug}" is missing its distributed upstream LICENSE.`);
  }
  if (licensePath && !lock[slug]?.licenseSha) {
    errors.push(`registry "${slug}" is missing its locked upstream licenseSha.`);
  }
  const patches = entry["local-patches"];
  if (patches !== undefined) {
    if (!entry.repo || !Array.isArray(patches) || patches.length === 0) {
      errors.push(`registry "${slug}" local-patches must be a non-empty list on a vendored skill.`);
    } else {
      for (const [index, patch] of patches.entries()) {
        const { file, find, replace } = patch ?? {};
        if (
          [file, find, replace].some(value => typeof value !== "string" || !value) ||
          file.startsWith("/") ||
          file.split("/").includes("..")
        ) {
          errors.push(
            `registry "${slug}" local-patches[${index}] needs a relative file plus non-empty find and replace.`
          );
          continue;
        }
        // The sync applies patches only when upstream changes, so the local
        // copy must already carry each one.
        const patchedFile = join(root, localPath, file);
        const content = existsSync(patchedFile) ? readFileSync(patchedFile, "utf8") : "";
        if (!content.includes(replace) || (!replace.includes(find) && content.includes(find))) {
          errors.push(
            `registry "${slug}" local-patches[${index}] is not applied to ${localPath}/${file}.`
          );
        }
      }
    }
  }
}

for (const folder of skillFolders) {
  if (!folder.hasSkillMd) {
    errors.push(`${folder.path} has no SKILL.md; remove the folder or add the skill.`);
    continue;
  }
  if (!registryPaths.has(folder.path)) {
    errors.push(`${folder.path} exists but has no skills-registry.json entry.`);
  }
}

// Lockfile against registry provenance.
for (const [slug, entry] of Object.entries(entries)) {
  if (!entry.repo) continue;
  const locked = lock[slug];
  if (!locked) {
    errors.push(`registry "${slug}" is vendored but missing from skills-registry.lock.json.`);
    continue;
  }
  for (const field of ["repo", "path", "ref"]) {
    if (locked[field] !== entry[field]) {
      errors.push(
        `lockfile "${slug}" ${field} "${locked[field]}" does not match registry "${entry[field]}".`
      );
    }
  }
}

for (const slug of Object.keys(lock)) {
  if (!entries[slug]) {
    errors.push(`lockfile "${slug}" has no skills-registry.json entry.`);
  } else if (!entries[slug].repo) {
    errors.push(`lockfile "${slug}" is locked but the registry entry has no repo.`);
  }
}

// SKILL.md frontmatter against folder and registry.
const unquote = value => value?.trim().replace(/^(['"])(.*)\1$/, "$2");
const seenNames = new Map();
for (const folder of skillFolders) {
  if (!folder.hasSkillMd) continue;
  const raw = readFileSync(join(root, folder.path, "SKILL.md"), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    errors.push(`${folder.path}/SKILL.md has no frontmatter block.`);
    continue;
  }

  const frontmatter = match[1];
  const name = unquote(frontmatter.match(/^name:\s*(.+)$/m)?.[1]);
  if (!name) {
    errors.push(`${folder.path}/SKILL.md is missing name.`);
  } else {
    if (name !== folder.name) {
      errors.push(`${folder.path}/SKILL.md name "${name}" does not match its folder.`);
    }
    if (seenNames.has(name)) {
      errors.push(`duplicate skill name "${name}" in ${seenNames.get(name)} and ${folder.path}.`);
    }
    seenNames.set(name, folder.path);
  }

  if (!/^description:/m.test(frontmatter)) {
    errors.push(`${folder.path}/SKILL.md is missing description.`);
  }

  const entry = entries[folder.name];
  if (entry && entry.author === "Marcio Altoé" && !entry.repo) {
    for (const field of ["category", "tags", "version", "author", "source"]) {
      if (!new RegExp(`^\\s+${field}:`, "m").test(frontmatter)) {
        errors.push(`${folder.path}/SKILL.md (authored) is missing metadata ${field}.`);
      }
    }
  }
}

// Vocabulary hygiene: tags declared but used by no skill.
const usedTags = new Set(Object.values(entries).flatMap(entry => entry.tags ?? []));
const unusedTags = [...vocabulary].filter(tag => !usedTags.has(tag));
if (unusedTags.length) {
  warnings.push(`tagVocabulary has ${unusedTags.length} unused tag(s): ${unusedTags.join(", ")}.`);
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length) {
  console.error(`Registry validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${Object.keys(entries).length} registry entr(ies) against ${skillFolders.length} skill folder(s) and ${Object.keys(lock).length} lock entr(ies).`
);
