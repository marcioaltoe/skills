import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("subdirectory sync distributes the license and refreshes a license-only change", t => {
  const root = mkdtempSync(join(tmpdir(), "skills-license-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "scripts"));
  copyFileSync(
    new URL("./sync-skills.mjs", import.meta.url),
    join(root, "scripts/sync-skills.mjs")
  );
  const entry = {
    repo: "example/skills",
    path: "skills/example",
    ref: "main",
    update: "auto",
    "local-path": "skills/05-implementation-loop/example",
    "license-path": "LICENSE-MIT",
  };
  writeFileSync(join(root, "skills-registry.json"), JSON.stringify({ skills: { example: entry } }));
  const mock = join(root, "mock-fetch.mjs");
  writeFileSync(
    mock,
    `
    const version = process.env.TEST_LICENSE_VERSION;
    globalThis.fetch = async url => {
      const path = new URL(url).pathname;
      let value;
      if (path.endsWith('/contents/skills')) value = [{name:'example',type:'dir',sha:'folder'}];
      else if (path.endsWith('/git/trees/folder')) value = {tree:[{type:'blob',path:'SKILL.md',sha:'skill',mode:'100644'}]};
      else if (path.endsWith('/contents/LICENSE-MIT')) {
        if (version === 'missing') return new Response('missing license', {status:404});
        value = {type:'file',sha:'license-' + version};
      }
      else if (path.endsWith('/git/blobs/skill')) value = {encoding:'base64',content:Buffer.from('---\\nname: example\\ndescription: Example\\n---\\n').toString('base64')};
      else if (path.endsWith('/git/blobs/license-' + version)) value = {encoding:'base64',content:Buffer.from('MIT notice ' + version + '\\n\\n').toString('base64')};
      else throw new Error('Unexpected network request: ' + path);
      return new Response(JSON.stringify(value));
    };
  `
  );
  const run = version =>
    spawnSync(process.execPath, ["--import", mock, "scripts/sync-skills.mjs"], {
      cwd: root,
      encoding: "utf8",
      env: { PATH: process.env.PATH, GITHUB_TOKEN: "test-token", TEST_LICENSE_VERSION: version },
    });
  const first = run("1");
  assert.equal(first.status, 0, first.stderr);
  const skill = join(root, entry["local-path"]);
  assert.equal(readFileSync(join(skill, "LICENSE"), "utf8"), "MIT notice 1\n");
  const lock = () =>
    JSON.parse(readFileSync(join(root, "skills-registry.lock.json"))).skills.example;
  assert.equal(lock().folderSha, "folder");
  assert.equal(lock().licenseSha, "license-1");

  const second = run("2");
  assert.equal(second.status, 0, second.stderr);
  assert.equal(readFileSync(join(skill, "LICENSE"), "utf8"), "MIT notice 2\n");
  assert.equal(lock().licenseSha, "license-2");
  assert.match(readFileSync(join(root, "sync-report.md"), "utf8"), /modified.*LICENSE/);
  const third = run("2");
  assert.equal(third.status, 0, third.stderr);
  assert.match(third.stdout, /updated=0.*unchanged=1/);

  // A failed notice lookup leaves the complete previous skill and lock intact.
  const failed = run("missing");
  // Entry failures are reported while other entries may still sync successfully.
  assert.equal(failed.status, 0, failed.stderr);
  assert.match(failed.stdout, /updated=0.*errors=1/);
  assert.match(readFileSync(join(root, "sync-report.md"), "utf8"), /## Errors/);
  assert.equal(readFileSync(join(skill, "LICENSE"), "utf8"), "MIT notice 2\n");
  assert.equal(lock().licenseSha, "license-2");
});
