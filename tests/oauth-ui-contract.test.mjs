import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("GitHub OAuth sign-in is prominent, accessible, and provider-neutral",()=>{
 const js=read("public/auth-controls.js");
 const css=read("public/auth-controls.css");
 assert.ok(js.includes('host.prepend(accountArea)'));
 assert.ok(js.includes('accountArea.setAttribute("role","status")'));
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


test("private views gate API reads and clear stale data on session denial",()=>{
 const auth=read("public/auth-controls.js");
 assert.ok(auth.includes("export async function authenticationStatus()"));
 assert.ok(auth.includes("export function invalidateAuthentication()"));
 assert.ok(auth.includes('cachedSession=Promise.resolve({authenticated:false})'));
 for(const page of ["public/app.js","public/governance.js","public/attention.js"]){
  const js=read(page);
  assert.ok(js.includes("await authenticationStatus()"),page);
  assert.ok(js.includes("if(!auth.authenticated)"),page);
  assert.ok(js.includes("invalidateAuthentication()"),page);
  assert.ok(js.includes("response.status === 401")||js.includes("response.status===401"),page);
 }
});

test("signed-out pages cannot present refresh as available",()=>{
 const source=read("public/refresh-guard.js");
 assert.ok(source.includes("Sign in to refresh"));
 assert.ok(source.includes("data-authentication"));
});
