import assert from 'node:assert/strict';
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright-core";
const root=new URL("../public/",import.meta.url).pathname;
const server=http.createServer(async(req,res)=>{
 const route=new URL(req.url,"http://localhost").pathname;
 if(route.startsWith("/api/")){res.writeHead(503);res.end();return;}
 const file=route==="/"?"/index.html":route;
 if(!file.startsWith("/")||file.includes("..")){res.writeHead(404);res.end();return;}
 try{
  const data=await fs.readFile(path.join(root,file));
  const mime=file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":"text/html";
  res.writeHead(200,{"Content-Type":mime});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.GC_CHROMIUM_PATH,args:["--no-sandbox"]});
 for(const signedIn of [false,true]){
  for(const route of ["/","/governance.html","/attention.html"]){
   const context=await browser.newContext({viewport:{width:390,height:844}});
   const page=await context.newPage();let privateCalls=0;
   const errors=[];page.on("pageerror",error=>errors.push(error.message));
   await page.route("**/api/auth/session",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({authenticated:signedIn,login:"Fixture"})}));
   await page.route("**/api/dashboard",r=>{privateCalls++;return r.fulfill({status:401,contentType:"application/json",body:'{"code":"authentication_required"}'});});
   await page.route("**/api/governance",r=>{privateCalls++;return r.fulfill({status:401,contentType:"application/json",body:'{"code":"authentication_required"}'});});
   await page.goto(base+route,{waitUntil:"domcontentloaded"});
   await page.locator('html[data-authentication="required"]').waitFor({timeout:12000});
   await page.locator('a.auth-action[href="/api/auth/login"]').waitFor();
   assert.equal(privateCalls,signedIn?1:0,route+" protected request count");
   if(route!=="/attention.html") assert.equal(await page.locator("#refresh-state").innerText(),"Sign in to refresh");
   assert.deepEqual(errors,[],route+" script errors");
   console.log("PASS",route,signedIn?"denied-session":"signed-out","calls",privateCalls);
   await context.close();
  }
 }
 {
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.clock.install({time:new Date("2026-10-21T12:00:00Z")});
  await page.route("**/api/auth/session",r=>r.fulfill({status:200,contentType:"application/json",body:'{"authenticated":true,"login":"Fixture"}'}));
  let calls=0;
  await page.route("**/api/dashboard",r=>{
   calls++;
   const item={repository:"Private fixture",severity:"warning",reasons:["Synthetic alert"],url:"https://github.com/GoreeCloud/github-dashboard",activityScore:5,updatedAt:"2026-10-20T00:00:00Z"};
   const payload=calls===1?{mode:"read-only",repositoryAttention:[item],dataHealth:{status:"complete"},generatedAt:"2026-10-21T12:00:00Z"}:{code:"authentication_required"};
   return r.fulfill({status:calls===1?200:401,contentType:"application/json",body:JSON.stringify(payload)});
  });
  await page.goto(base+"/attention.html",{waitUntil:"domcontentloaded"});
  await page.locator(".queue-item").first().waitFor({timeout:12000});
  assert.match(await page.locator("#queue").innerText(),/Private fixture/);
  await page.clock.fastForward(31000);
  await page.locator("#reload").click();
  await page.locator('html[data-authentication="required"]').waitFor();
  assert.doesNotMatch(await page.locator("#queue").innerText(),/Private fixture/);
  assert.equal(await page.locator("#count-all").innerText(),"—");
  assert.equal(calls,2);
  await context.close();
  console.log("PASS attention private-data purge on expired session");
 }
} catch(error) {
 console.error("Browser acceptance failed",error);
 process.exitCode=1;
} finally {
 await browser?.close();
 await new Promise(done=>server.close(done));
}
