import test from "node:test";
import assert from "node:assert/strict";

test("session gate shares the same-origin probe and fails closed after denial",async()=>{
 const prevDoc=globalThis.document,prevFetch=globalThis.fetch;
 let calls=0;
 try{
  globalThis.document={querySelector:()=>null,documentElement:{dataset:{}}};
  globalThis.fetch=async (url,options)=>{
   calls++;
   assert.equal(url,"/api/auth/session");
   assert.equal(options.credentials,"same-origin");
   return Response.json({authenticated:true,login:"fixture"});
  };
  const gate=await import("../public/auth-controls.js?session-unit");
  assert.equal((await gate.authenticationStatus()).authenticated,true);
  assert.equal((await gate.authenticationStatus()).authenticated,true);
  assert.equal(calls,1);
  gate.invalidateAuthentication();
  assert.deepEqual(await gate.authenticationStatus(),{authenticated:false,unavailable:false});
  assert.equal(calls,1);
 }finally{globalThis.document=prevDoc;globalThis.fetch=prevFetch;}
});

test("session gate treats service errors as unavailable",async()=>{
 const prevDoc=globalThis.document,prevFetch=globalThis.fetch;
 try{
  globalThis.document={querySelector:()=>null,documentElement:{dataset:{}}};
  globalThis.fetch=async()=>Response.json({error:"unavailable"},{status:503});
  const gate=await import("../public/auth-controls.js?unavailable-unit");
  assert.deepEqual(await gate.authenticationStatus(),{authenticated:false,unavailable:true});
 }finally{globalThis.document=prevDoc;globalThis.fetch=prevFetch;}
});
