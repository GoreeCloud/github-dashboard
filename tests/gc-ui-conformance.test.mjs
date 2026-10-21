import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=f=>fs.readFileSync(new URL("../"+f,import.meta.url),"utf8");
test("GC UI is sole active runtime and acceptance remains pending",()=>{
 const bridge=read("public/gc-ui-bridge.js"),shell=read("public/gc-ui-shell.css"),doc=read("docs/GC_UI_MIGRATION.md");
 assert.ok(bridge.includes('dataset.gcUiAcceptance="pending"'));
 assert.ok(doc.includes("GoreeCloud/gc-ui"));
 assert.ok(shell.includes("gc-surface"));
 assert.ok(!fs.existsSync(new URL("../public/glaze-ui.js",import.meta.url)));
 assert.ok(!fs.existsSync(new URL("../public/glaze-v1.6.css",import.meta.url)));
});
test("GC UI consumer supports tablet, touch and resilience",()=>{
 const shell=read("public/gc-ui-shell.css");
 for(const required of ["min-height: 48px","min-width: 600px","writing-mode: horizontal-tb","prefers-reduced-transparency","forced-colors: active"])assert.ok(shell.includes(required),required);
});
test("product records preserve implementation versus acceptance",()=>{
 const features=read("FEATURES.md"),benefits=read("BENEFITS.md"),obj=read("COMPETITIVE-OBJECTIVES.md"),platform=read("docs/PLATFORM_CONFORMANCE.md");
 assert.match(features,/Implemented in Forge source/);assert.match(features,/Partial or acceptance-gated/);
 assert.match(features,/Not currently implemented or approved/);assert.match(benefits,/Benefits not yet claimed/);
 assert.match(obj,/does not become a second repository-state authority/);
 for(const name of ["GoreeCloud Manager","Privacy Shield","Wardveil Security","Everkeep","GoreeCloud UI","GoreeCloud Mesh","GoreeCloud Identity","GoreeCloud Policy","GoreeCloud Observability"])assert.ok(platform.includes(name),name);
});
