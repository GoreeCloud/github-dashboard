import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("private dashboard has a deliberate locked-state experience without fabricated data",()=>{
 const html=read("public/index.html"),css=read("public/locked-state.css");
 assert.match(html,/id="locked-overview"/);
 assert.match(html,/Private GitHub data is not connected|private GitHub data is not connected/);
 assert.ok(html.includes('href="/governance.html"'));
 assert.ok(html.includes('href="/attention.html"'));
 assert.ok(css.includes(':root:not([data-authentication="signed-in"])'));
 assert.ok(css.includes('data-authentication="required"'));
 assert.ok(css.includes('data-authentication="unavailable"'));
 assert.ok(!html.includes("Sample repositories: 10"),"do not invent live metrics");
});

test("locked content is styled as an accessible responsive feature overview",()=>{
 const html=read("public/index.html"),css=read("public/locked-state.css");
 assert.ok(html.includes('href="/locked-state.css"'));
 assert.ok(html.includes('aria-label="Dashboard capabilities"'));
 assert.ok(css.includes("@media(max-width:599px)"));
 assert.ok(css.includes("@media(forced-colors:active)"));
});
