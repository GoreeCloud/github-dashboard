import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(p)=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("dashboard and governance consume pinned GC UI foundations",()=>{
 const tokens=read("public/gc-ui-foundations.css");
 assert.ok(tokens.includes("GoreeCloud/gc-ui"));
 assert.ok(tokens.includes("3ffe26a1c62f59a2ee3c9478dcb31ecc0f9cf444"));
 for(const token of ["--gc-canvas:","--gc-surface:","--gc-brand:","--gc-text:"])
  assert.ok(tokens.includes(token),token);
 for(const path of ["public/index.html","public/governance.html"]){
  const html=read(path);
  const foundation=html.indexOf('href="/gc-ui-foundations.css"');
  const adapter=html.indexOf('href="/gc-ui-adapter.css"');
  assert.ok(foundation>=0&&adapter>foundation,path);
  assert.ok(html.includes('data-accent="lagoon"'));
 }
});
test("legacy-layout adapter uses GC semantic values and preserves mobile reflow",()=>{
 const css=read("public/gc-ui-adapter.css");
 for(const name of ["--canvas:var(--gc-canvas)","--surface:var(--gc-surface)","--text:var(--gc-text)","--accent:var(--gc-brand)","--border:var(--gc-outline)"])
  assert.ok(css.includes(name),name);
 assert.ok(css.includes("@media(max-width:420px)"));
 assert.ok(css.includes(".topbar{flex-wrap:wrap"));
 assert.ok(css.includes("@media(forced-colors:active)"));
 assert.ok(css.includes(".sidebar{box-shadow:var(--gc-shadow-card)}"));
});
test("shared four-state controller sends explicit semantic mode to GC UI",()=>{
 const source=read("public/appearance-controller.js");
 assert.ok(source.includes("document.documentElement.dataset.mode ="));
 assert.ok(source.includes('window.matchMedia?.("(prefers-color-scheme: dark)")'));
 assert.ok(source.includes('addEventListener?.("change"'));
 assert.ok(source.includes('mode === "system"'));
});

test("GC UI bridge keeps semantic styles last and acceptance pending",()=>{
 const bridge=read("public/gc-ui-bridge.js");
 assert.ok(bridge.includes("document.head.append(adapter)"));
 assert.ok(bridge.includes('dataset.gcUiAcceptance="pending"'));
 for(const p of ["public/bootstrap.js","public/governance-bootstrap.js"]){
  const source=read(p);
  assert.ok(source.includes('import "./gc-ui-bridge.js"'));
  assert.ok(!source.includes("glaze-ui.js"));
 }
});
