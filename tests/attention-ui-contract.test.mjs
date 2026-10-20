import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = file => fs.readFileSync(new URL("../" + file, import.meta.url), "utf8");

test("attention UI uses protected read-only same-origin API only",()=>{
 const app=read("public/attention.js");
 assert.ok(app.includes('fetch("/api/dashboard"'));
 assert.ok(app.includes('credentials:"same-origin"'));
 assert.ok(app.includes('cache:"no-store"'));
 assert.ok(app.includes("AbortController"));
 assert.ok(app.includes("SUCCESS_COOLDOWN_SECONDS"));
 assert.ok(app.includes("FAILURE_RETRY_SECONDS"));
 assert.doesNotMatch(app,/GITHUB_TOKEN|api\.github\.com|Authorization\s*:/);
});
test("GC UI attention page has labeled accessible controls",()=>{
 const page=read("public/attention.html");
 const css=read("public/attention.css");
 const tokens=read("public/attention-tokens.css");
 for(const marker of ['href="#main"','id="query"','id="severity"','id="sort"','aria-live="polite"','/attention-tokens.css']) assert.ok(page.includes(marker),marker);
 assert.ok(tokens.includes("--gc-canvas"));
 assert.ok(tokens.includes("--gc-surface"));
 assert.ok(css.includes("prefers-reduced-motion"));
 assert.ok(css.includes("forced-colors"));
 assert.doesNotMatch(page,/glaze/i);
});
test("dashboard and governance both expose queue navigation",()=>{
 for(const entry of ["public/bootstrap.js","public/governance-bootstrap.js"]){
  assert.ok(read(entry).includes('import "./attention-navigation.js"'),entry);
 }
 const nav=read("public/attention-navigation.js");
 assert.ok(nav.includes('href = "/attention.html"'));
 assert.ok(nav.includes(".mobile-nav"));
 assert.ok(read("public/attention-navigation.css").includes("repeat(5,minmax(0,1fr))"));
});

test("appearance follows persisted four-state dashboard mode without legacy runtime",()=>{
 const app=read("public/attention.js");
 const appearance=read("public/attention-appearance.js");
 const page=read("public/attention.html");
 assert.ok(app.includes('import "./attention-appearance.js"'));
 assert.ok(appearance.includes("goreecloud-github-dashboard-theme"));
 assert.ok(appearance.includes("nextAppearance(mode)"));
 assert.ok(appearance.includes('mode === "deep-dark"'));
 assert.ok(appearance.includes('addEventListener?.("change",render)'));
 assert.ok(page.includes('id="appearance"'));
 assert.ok(read("public/attention-tokens.css").includes('[data-mode="deep-dark"]'));
 assert.doesNotMatch(appearance,/glaze/i);
});
