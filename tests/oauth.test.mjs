import test from "node:test";
import assert from "node:assert/strict";
import {oauthConfig,startOAuth,completeOAuth,verifySession,canLogout} from "../functions/lib/oauth.js";
import {fixtureEnv,sessionFixture,BASE,ID} from "./oauth-fixture.mjs";

test("OAuth configuration requires exact HTTPS origin, signing key and approved numeric user",()=>{
 const env=fixtureEnv();
 assert.equal(oauthConfig(env).ids.has(ID),true);
 for(const patch of [{GITHUB_OAUTH_BASE_URL:"http://dashboard.goreecloud.test"},{GITHUB_OAUTH_BASE_URL:BASE+"/other"},
  {GITHUB_OAUTH_SESSION_KEY:"wrong"},{GITHUB_OAUTH_ALLOWED_USER_IDS:""},{GITHUB_OAUTH_ALLOWED_USER_IDS:"GoreeCloud"}]){
  assert.equal(oauthConfig({...env,...patch}),null);
 }
});
test("OAuth sign-in redirects only to GitHub using CSRF state and secure host-only cookie",async()=>{
 const env=fixtureEnv();
 const x=await startOAuth(new Request(BASE+"/api/auth/login"),env);
 assert.equal(x.status,302);
 const url=new URL(x.location);
 assert.equal(url.origin,"https://github.com");
 assert.equal(url.pathname,"/login/oauth/authorize");
 assert.equal(url.searchParams.get("scope"),"read:user");
 assert.equal(url.searchParams.get("redirect_uri"),BASE+"/api/auth/callback");
 assert.ok(url.searchParams.get("state")?.length>=40);
 assert.equal(url.searchParams.get("code_challenge_method"),"S256");
 assert.equal(url.searchParams.get("code_challenge")?.length,43);
 const next=await startOAuth(new Request(BASE+"/api/auth/login"),env);
 assert.notEqual(new URL(next.location).searchParams.get("code_challenge"),url.searchParams.get("code_challenge"));
 assert.match(x.cookie,/__Host-gc_oauth_state=/);
 for(const flag of ["HttpOnly","Secure","SameSite=Lax","Path=/","Max-Age=300"])assert.ok(x.cookie.includes(flag),flag);
 assert.equal((await startOAuth(new Request("https://evil.test/api/auth/login"),env)).status,403);
});
test("verified GitHub account receives encrypted short-lived server session, no provider token",async()=>{
 const f=await sessionFixture();
 const auth=await verifySession(f.request,f.env);
 assert.equal(auth.ok,true);assert.equal(auth.id,ID);assert.equal(auth.login,"GoreeCloud");
 assert.match(f.result.cookie,/__Host-gc_session=/);
 assert.doesNotMatch(f.result.cookie,/synthetic-oauth-access-token|GoreeCloud/);
 assert.match(f.result.cookie,/HttpOnly; Secure; SameSite=Lax/);
 assert.equal((await verifySession(f.request,f.env,Math.floor(Date.now()/1000)+14401)).ok,false);
});
test("no session, corrupted cookie and rotated key are denied",async()=>{
 const f=await sessionFixture();
 assert.equal((await verifySession(new Request(BASE+"/api/dashboard"),f.env)).status,401);
 const bad=new Request(BASE+"/api/dashboard",{headers:{cookie:f.cookie.slice(0,-2)+"xx"}});
 assert.equal((await verifySession(bad,f.env)).status,401);
 const rotated={...f.env,GITHUB_OAUTH_SESSION_KEY:fixtureEnv().GITHUB_OAUTH_SESSION_KEY};
 assert.equal((await verifySession(f.request,rotated)).status,401);
 const revoked={...f.env,GITHUB_OAUTH_ALLOWED_USER_IDS:"1234567"};
 assert.equal((await verifySession(f.request,revoked)).status,401);
});

// Further cases are covered by API fixture tests.
test("callback rejects forged state, missing cookie and unapproved GitHub IDs",async()=>{
 const env=fixtureEnv(),started=await startOAuth(new Request(BASE+"/api/auth/login"),env);
 const state=new URL(started.location).searchParams.get("state");
 const initialCookie=started.cookie.split(";")[0];
 for(const [candidate,cookie] of [["forged",initialCookie],[state,""]]){
  const req=new Request(BASE+"/api/auth/callback?code=fixtureCode&state="+candidate,{headers:{cookie}});
  const rejected=await completeOAuth(req,env,{fetchImpl:async()=>{throw Error("exchange should not start")}});
  assert.equal(rejected.status,403);
 }
 const request=new Request(BASE+"/api/auth/callback?code=fixtureCode&state="+state,{headers:{cookie:initialCookie}});
 const denied=await completeOAuth(request,env,{fetchImpl:async url=>{
  if(url==="https://github.com/login/oauth/access_token")return new Response(JSON.stringify({token_type:"bearer",access_token:"synthetic-oauth-access-token"}));
  return new Response(JSON.stringify({id:1234,login:"Outside"}));
 }});
 assert.equal(denied.code,"oauth_user_not_allowed");
 assert.equal(denied.cookie,undefined);
});
test("logout is permitted only for same-origin form action",()=>{
 const env=fixtureEnv();
 assert.equal(canLogout(new Request(BASE+"/api/auth/logout",{method:"POST",headers:{origin:BASE}}),env),true);
 assert.equal(canLogout(new Request(BASE+"/api/auth/logout",{method:"POST",headers:{origin:"https://evil.test"}}),env),false);
 assert.equal(canLogout(new Request(BASE+"/api/auth/logout",{method:"POST",headers:{origin:BASE,"sec-fetch-site":"cross-site"}}),env),false);
});
test("private Dashboard and Governance APIs require the signed-in session",async()=>{
 const {onRequestGet:dashboard}=await import("../functions/api/dashboard.js");
 const {onRequestGet:governance}=await import("../functions/api/governance.js");
 const env={...fixtureEnv(),GITHUB_TOKEN:["synthetic","data","fixture"].join("-")};
 for(const [route,fn] of [["dashboard",dashboard],["governance",governance]]){
  const response=await fn({env,request:new Request(BASE+"/api/"+route)});
  assert.equal(response.status,401);
  assert.equal((await response.json()).code,"authentication_required");
  assert.match(response.headers.get("cache-control"),/no-store/);
 }
});


test("unauthenticated callers cannot probe missing GitHub data credentials",async()=>{
 const {onRequestGet:dashboard}=await import("../functions/api/dashboard.js");
 const {onRequestGet:governance}=await import("../functions/api/governance.js");
 const env=fixtureEnv();
 for(const [route,handler] of [["dashboard",dashboard],["governance",governance]]){
  const res=await handler({request:new Request(BASE+"/api/"+route),env});
  assert.equal(res.status,401);
  const body=await res.json();
  assert.equal(body.code,"authentication_required");
  assert.ok(!JSON.stringify(body).includes("github_not_configured"));
  assert.match(res.headers.get("cache-control"),/no-store/);
 }
});
