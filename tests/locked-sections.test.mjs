import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=name=>fs.readFileSync(new URL("../public/"+name,import.meta.url),"utf8");
test("governance and attention have explicit protected-state content",()=>{
 const g=read("governance.html"),a=read("attention.html");
 for(const [page,id,title] of [[g,"locked-governance","locked-governance-title"],[a,"locked-attention","locked-attention-title"]]){
  assert.ok(page.includes('id="'+id+'"'));
  assert.ok(page.includes('aria-labelledby="'+title+'"'));
  assert.ok(page.includes('href="/locked-sections.css"'));
 }
 assert.ok(g.includes('class="governance-page"'));
 assert.ok(a.includes('class="attention-page"'));
 assert.match(a,/unavailable[^<]*not zero/);
});
test("locked-state gating hides unavailable details but keeps authenticated view",()=>{
 const css=read("locked-sections.css");
 assert.ok(css.includes(':root:not([data-authentication="signed-in"])'));
 for(const item of [".governance-page .stats-grid",".governance-page .repository-section",".attention-page .summary-grid",".attention-page .queue-panel","#locked-governance","#locked-attention"])assert.ok(css.includes(item));
 assert.ok(css.includes("@media(max-width:520px)"));
 assert.ok(css.includes("@media(forced-colors:active)"));
});
