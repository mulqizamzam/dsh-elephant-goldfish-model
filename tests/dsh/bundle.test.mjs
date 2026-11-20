/**
 * DSH Bundle Smoke Tests for dsh-elephant-goldfish-model
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Test file is at tests/dsh/bundle.test.mjs -> plugin root is 3 levels up
const testDir = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(testDir, "../../");

function parseCordisYaml(text) {
  const lines = text.split("\n");
  const result = { insert: [] };
  let current = null;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("- id:")) {
      current = { id: t.slice(5).trim() };
      result.insert.push(current);
    } else if (t.startsWith("name:") && current) {
      current.name = t.slice(5).trim().replace(/['"]/g, "");
    } else if (t === "config:" && current) {
      current.config = {};
    } else if (t.startsWith("providerName:") && current?.config) {
      current.config.providerName = t.slice(14).trim();
    } else if (t.startsWith("bundledSkillDir:") && current?.config) {
      current.config.bundledSkillDir = t.slice(17).trim();
    } else if (t.startsWith("includeDefaultRoots:") && current?.config) {
      current.config.includeDefaultRoots = t.slice(21).trim() === "false";
    }
  }
  return result;
}

describe("dsh-elephant-goldfish-model bundle", () => {
  let pkg;

  before(async () => {
    pkg = JSON.parse(await readFile(join(pkgRoot, "package.json"), "utf8"));
  });

  it("package.json has valid dsh.bundle.patch field", () => {
    assert.ok(pkg.dsh?.bundle?.patch, "dsh.bundle.patch must be defined");
    assert.equal(pkg.dsh.bundle.patch, "./cordis.patch.yml");
  });

  it("package.json targets DSH 0.2.1-rc.2", () => {
    assert.equal(pkg.engines?.dsh, "0.2.1-rc.2");
  });

  it("package.json has bugs.url", () => {
    assert.ok(pkg.bugs?.url, "bugs.url must be defined");
    assert.ok(pkg.bugs.url.includes("github.com"), "bugs.url should reference GitHub");
  });

  it("index.mjs exports correct name", async () => {
    const mod = await import(join(pkgRoot, "index.mjs"));
    assert.equal(mod.name, "dsh-elephant-goldfish-model");
  });

  it("index.mjs exports version matching package.json", async () => {
    const mod = await import(join(pkgRoot, "index.mjs"));
    assert.equal(mod.version, pkg.version);
  });

  it("index.mjs exports dshTarget matching engines.dsh", async () => {
    const mod = await import(join(pkgRoot, "index.mjs"));
    assert.equal(mod.dshTarget, "0.2.1-rc.2");
  });

  it("cordis.patch.yml registers skill-filesystem provider", async () => {
    const yaml = await readFile(join(pkgRoot, "cordis.patch.yml"), "utf8");
    const doc = parseCordisYaml(yaml);
    assert.ok(Array.isArray(doc.insert), "root must have insert array");
    const entry = doc.insert.find((e) => e.id === "dsh-elephant-goldfish-model-skills");
    assert.ok(entry, "must have dsh-elephant-goldfish-model-skills entry");
    assert.equal(entry.name, "@deepseek-ai/dsh-skill-filesystem");
    assert.equal(entry.config?.providerName, "dsh-elephant-goldfish-model");
    assert.ok(entry.config?.bundledSkillDir?.includes("skills"), "bundledSkillDir references skills/");
    assert.equal(entry.config?.includeDefaultRoots, false, "includeDefaultRoots must be false");
  });

  it("all 8 EGM skills exist with valid frontmatter and size < 24KB", async () => {
    const skills = await readdir(join(pkgRoot, "skills"));
    const expected = [
      "egm-bootstrap", "egm-brainstorm", "egm-draft", "egm-drift-report",
      "egm-lite", "egm-resolve", "egm-review", "egm-review-loop",
    ];
    for (const name of expected) {
      const skillMd = join(pkgRoot, "skills", name, "SKILL.md");
      const content = await readFile(skillMd, "utf8");
      assert.ok(content.startsWith("---"), `${name}/SKILL.md missing frontmatter`);
      assert.match(content, /^name:/m, `${name} missing name`);
      assert.match(content, /^description:/m, `${name} missing description`);
      const size = Buffer.byteLength(content, "utf8");
      assert.ok(size <= 24000, `${name} is ${size}B, exceeds 24000 limit`);
    }
    const actual = new Set(
      skills.filter((d) => {
        try {
          const fs = await import("node:fs/promises");
          await fs.access(join(pkgRoot, "skills", d, "SKILL.md"));
          return true;
        } catch { return false; }
      })
    );
    const missing = expected.filter((n) => !actual.has(n));
    assert.deepEqual(missing, [], `Missing skills: ${missing.join(", ")}`);
  });

  it("agents directory has 10 persona files", async () => {
    const agents = await readdir(join(pkgRoot, "agents"));
    const mdFiles = agents.filter((f) => f.endsWith(".md"));
    assert.equal(mdFiles.length, 10, `expected 10 agent personas, got ${mdFiles.length}`);
  });

  it("document standards directory has 5 standards", async () => {
    const stds = await readdir(join(pkgRoot, "resources/document_standards"));
    const mdFiles = stds.filter((f) => f.endsWith(".md"));
    assert.equal(mdFiles.length, 5, `expected 5 standards, got ${mdFiles.length}`);
  });

  it("CHANGELOG.md exists", async () => {
    await readFile(join(pkgRoot, "CHANGELOG.md"), "utf8");
  });

  it("SECURITY.md exists", async () => {
    await readFile(join(pkgRoot, "SECURITY.md"), "utf8");
  });

  it("docs/dsh.md has installation guide", async () => {
    const content = await readFile(join(pkgRoot, "docs/dsh.md"), "utf8");
    assert.ok(content.includes("Instalasi") || content.includes("Install"), "dsh.md should have install section");
  });
});
