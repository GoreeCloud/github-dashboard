import test from "node:test";
import assert from "node:assert/strict";
import {verifyCloudflareAccess} from "../functions/lib/access.js";
import {syntheticAccess} from "./access-fixture.mjs";
test("valid signed Cloudflare application assertion verifies against trusted JWKS",async()=>{
 const fixture=await syntheticAccess();
 const result=await verifyCloudflareAccess(fixture.request,fixture.env,{fetchImpl:async()=>fixture.certsResponse()});
 assert.deepEqual(result,{ok:true});
});
test("locked settings never trust a JWT header by itself",async()=>{
 const f=await syntheticAccess();
 const outcome=await verifyCloudflareAccess(f.request,{},{fetchImpl:async()=>{throw Error("should not fetch")}});
 assert.equal(outcome.status,503);
 assert.equal(outcome.code,"access_verification_unavailable");
});
test("missing, malformed, forged and expired assertions are rejected without credentials",async()=>{
 const f=await syntheticAccess();
 const fetchImpl=async()=>f.certsResponse();
 const noToken=await verifyCloudflareAccess(new Request("https://dashboard.invalid/"),f.env,{fetchImpl});
 assert.equal(noToken.status,403);
 const forged=new Request("https://dashboard.invalid/",{headers:{"cf-access-jwt-assertion":f.token.slice(0,-2)+"xx"}});
 assert.equal((await verifyCloudflareAccess(forged,f.env,{fetchImpl})).status,403);
 for(const claims of [
  {exp:Math.floor(Date.now()/1000)-1},
  {nbf:Math.floor(Date.now()/1000)+3600},
  {aud:["other-audience"]},
  {iss:"https://other.cloudflareaccess.com"},
  {type:"org"}
 ]){
  const invalid=await syntheticAccess({claims});
  assert.equal((await verifyCloudflareAccess(invalid.request,f.env,{fetchImpl})).status,403,JSON.stringify(claims));
 }
});
test("untrusted certs fetch failure is fail-closed",async()=>{
 const f=await syntheticAccess();
 const result=await verifyCloudflareAccess(f.request,f.env,{fetchImpl:async()=>new Response("nope",{status:503})});
 assert.equal(result.status,503);
 assert.equal(result.code,"access_verification_unavailable");
});
test("team domain is restricted to the official Cloudflare Access cert origin",async()=>{
 const f=await syntheticAccess();
 for(const domain of ["http://fixture-team.cloudflareaccess.com","https://fixture-team.cloudflareaccess.com.evil.test","https://fixture-team.cloudflareaccess.com/other","https://evil.test"]){
  const x=await verifyCloudflareAccess(f.request,{...f.env,CF_ACCESS_TEAM_DOMAIN:domain},{fetchImpl:async()=>{throw Error("invalid cert URL");}});
  assert.equal(x.status,503,domain);
 }
});
