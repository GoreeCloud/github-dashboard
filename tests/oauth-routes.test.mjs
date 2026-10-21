import test from "node:test";
import assert from "node:assert/strict";
import {fixtureEnv,sessionFixture,BASE} from "./oauth-fixture.mjs";
import {onRequestGet as login} from "../functions/api/auth/login.js";
import {onRequestGet as callback} from "../functions/api/auth/callback.js";
import {onRequestGet as session} from "../functions/api/auth/session.js";
import {onRequest as logout} from "../functions/api/auth/logout.js";

test("login route has HTTPS GitHub redirect and host-only state cookie",async()=>{
 const result=await login({request:new Request(BASE+"/api/auth/login"),env:fixtureEnv()});
 assert.equal(result.status,302);
 assert.equal(new URL(result.headers.get("location")).hostname,"github.com");
 assert.match(result.headers.get("set-cookie"),/__Host-gc_oauth_state=/);
 assert.match(result.headers.get("cache-control"),/no-store/);
});
test("session route reveals sign-in state but not any provider token or numeric ID",async()=>{
 const f=await sessionFixture();
 const unauth=await session({request:new Request(BASE+"/api/auth/session"),env:f.env});
 assert.equal((await unauth.json()).authenticated,false);
 const auth=await session({request:new Request(BASE+"/api/auth/session",{headers:{cookie:f.cookie}}),env:f.env});
 const data=await auth.json();assert.deepEqual(data,{authenticated:true,provider:"github",login:"GoreeCloud"});
 assert.match(auth.headers.get("cache-control"),/no-store/);
});
test("logout route requires POST with same-origin request and clears the host cookie",async()=>{
 const f=await sessionFixture();
 const missingOrigin=logout({request:new Request(BASE+"/api/auth/logout",{method:"POST"}),env:f.env});
 assert.equal(missingOrigin.status,403);
 const response=logout({request:new Request(BASE+"/api/auth/logout",{method:"POST",headers:{Origin:BASE}}),env:f.env});
 assert.equal(response.status,200);
 assert.match(response.headers.get("set-cookie"),/Max-Age=0/);
 assert.match(response.headers.get("set-cookie"),/__Host-gc_session=/);
});
test("callback route denies invalid state and clears temporary cookie",async()=>{
 const f=await sessionFixture();
 const response=await callback({request:new Request(BASE+"/api/auth/callback?code=fake&state=wrong"),env:f.env});
 assert.equal(response.status,403);
 assert.match(response.headers.get("set-cookie"),/Max-Age=0/);
 assert.match(response.headers.get("cache-control"),/no-store/);
});
