import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("GitHub OAuth sign-in is prominent, accessible, and provider-neutral",()=>{
 const js=read("public/auth-controls.js");
 const css=read("public/auth-controls.css");
 assert.ok(js.includes('host.prepend(area)'));
 assert.ok(js.includes('area.setAttribute("role","status")'));
 assert.ok(js.includes('link.textContent="Sign in with GitHub"'));
 assert.ok(js.includes('"/api/auth/session"'));
 assert.ok(js.includes('"/api/auth/logout"'));
 assert.ok(css.includes(".hero-meta>.auth-controls{order:-1}"));
 assert.ok(css.includes(".auth-controls a.auth-action"));
 assert.ok(css.includes('[data-authentication="required"] #refresh-button'));
 assert.ok(css.includes('[data-authentication="required"] #reload'));
 for(const page of ["public/index.html","public/governance.html","public/attention.html"]){
  assert.ok(read(page).includes('href="/auth-controls.css"'),page);
 }
 for(const entry of ["public/bootstrap.js","public/governance-bootstrap.js","public/attention.js"]){
  assert.ok(read(entry).includes('import "./auth-controls.js";'),entry);
 }
});
