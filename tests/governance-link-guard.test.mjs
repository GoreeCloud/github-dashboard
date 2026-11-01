import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sanitizeGovernanceLinks } from "../public/governance-link-guard.js";

function fixture(href, text = "Repo") {
  const anchor = {
    className: "item-link",
    textContent: text,
    href,
    target: "",
    rel: "",
    getAttribute: name => name === "href" ? href : null,
    replaceWith(node) { this.replacement = node; },
  };
  const doc = { createElement: tag => ({ tagName: tag.toUpperCase(), className: "", textContent: "" }) };
  const root = { querySelectorAll: selector => selector === "a.item-link" ? [anchor] : [] };
  return { anchor, doc, root };
}

test("governance links keep trusted GoreeCloud destinations with safe tab policy", () => {
  const safe = "https://github.com/GoreeCloud/github-dashboard/issues/13";
  const f = fixture(safe);
  assert.equal(sanitizeGovernanceLinks(f.root, f.doc), 0);
  assert.equal(f.anchor.href, safe);
  assert.equal(f.anchor.rel, "noopener noreferrer");
  assert.equal(f.anchor.target, "_blank");
  assert.equal(f.anchor.replacement, undefined);
});

test("governance replaces unsafe API links with noninteractive text", () => {
  for (const href of ["javascript:alert(1)", "#", "https://other.example/repo",
    "https://github.com/OtherOwner/repo", "https://github.com.evil.test/GoreeCloud/repo"]) {
    const f = fixture(href, "Repository name");
    assert.equal(sanitizeGovernanceLinks(f.root, f.doc), 1, href);
    assert.equal(f.anchor.replacement.tagName, "SPAN");
    assert.equal(f.anchor.replacement.textContent, "Repository name");
    assert.equal(f.anchor.replacement.className, "item-link");
  }
});

test("governance bootstrap installs the link guard before the renderer", () => {
  const code = fs.readFileSync(new URL("../public/governance-bootstrap.js", import.meta.url), "utf8");
  const guard = code.indexOf('import "./governance-link-guard.js"');
  assert.ok(guard >= 0);
  assert.ok(guard < code.indexOf('import "./governance.js"'));
});
