// A conservative local declaration check, NOT the canonical Platform Contract 2.1 evaluator.
// Keep this test distinct from the currently unavailable reusable contract workflow.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = fs.readFileSync(new URL("../goreecloud.platform.yaml", import.meta.url), "utf8");
function section(name, source = manifest) {
  const lines = source.split(/\r?\n/);
  const i = lines.indexOf(name + ":");
  assert.notEqual(i, -1, "Missing section: " + name);
  let end = i + 1;
  while (end < lines.length && (lines[end].startsWith(" ") || !lines[end].trim())) end++;
  return lines.slice(i + 1, end).join("\n");
}

test("the Forge declaration cannot silently claim qualified or released status", () => {
  assert.match(manifest, /^schema_version: "2\.1"$/m);
  assert.match(manifest, /^lifecycle: forge$/m);
  assert.match(section("lifecycle_metadata"), /^  deployment_state: development$/m);
  assert.match(section("lifecycle_metadata"), /^  qualification_state: not-started$/m);
  assert.match(section("conformance"), /^  status: nonconformant$/m);
  assert.match(section("conformance"), /^  validated_at: null$/m);
  assert.match(section("compatibility"), /^  platform_contract: "2\.1"$/m);
});

test("all nine declared platform-system boundaries remain explicit and blocked", () => {
  const systems = section("platform_systems");
  const names = ["manager", "privacy_shield", "wardveil_security", "everkeep",
    "gc_ui", "mesh", "identity", "policy", "observability"];
  const actual = [...systems.matchAll(/^  ([a-z_]+):\s*$/gm)].map(m => m[1]);
  assert.deepEqual(actual, names);
  for (const name of names) {
    const match = new RegExp("^  " + name + ":\\n([\\s\\S]*?)(?=^  [a-z_]+:|$(?![\\s\\S]))", "m").exec(systems);
    assert.ok(match, "Missing boundary: " + name);
    assert.match(match[1], /^    result: applicable-(?:blocked|nonconformant)$/m, name);
    assert.match(match[1], /^    evidence:\s*$/m, name);
    assert.match(match[1], /^      - (?:docs\/|SECURITY\.md)/m, name);
  }
});

test("declared release evidence points to actual local files", () => {
  for (const relativePath of [
    "docs/PLATFORM_CONFORMANCE.md", "docs/GC_UI_MIGRATION.md",
    "docs/OPERATIONAL_HEALTH.md", "docs/GOVERNANCE_CONTROL_PLANE.md",
    "docs/DEPLOYMENT.md", "SECURITY.md",
  ]) {
    assert.equal(fs.existsSync(new URL("../" + relativePath, import.meta.url)), true, relativePath);
  }
  assert.match(section("conformance"), /^  blockers:\s*$/m);
  assert.match(manifest, /^\s+- Authenticated private-access deployment, /m);
});
