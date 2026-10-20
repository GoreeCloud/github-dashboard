// Manual synthetic-only browser regression; install playwright-core locally, provide GC_CHROMIUM_PATH.
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import {chromium} from "playwright-core";
const root=new URL("../public/",import.meta.url).pathname;
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,"http://localhost");
 if(u.pathname==="/favicon.ico"){res.writeHead(204);return res.end();}
 if(u.pathname.startsWith("/api/")){
   res.writeHead(503,{"content-type":"application/json","cache-control":"no-store"});
   return res.end(JSON.stringify({error:"Controlled integration fixture is unavailable"}));
 }
 const file=u.pathname==="/"?"/index.html":u.pathname;
 if(!/^\/[a-z0-9._/-]+$/i.test(file)||file.includes("..")){res.writeHead(404);return res.end();}
 try{
 const bytes=await fs.readFile(path.join(root,file));
 res.writeHead(200,{"content-type":file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":"text/html"});
 res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
let browser;const results=[];
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.GC_CHROMIUM_PATH,args:["--no-sandbox"]});
 for(const route of ["/","/governance.html"]){
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:"light"});
   const page=await context.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base+route,{waitUntil:"networkidle"});
   const css=await page.evaluate(()=>{
    const d=document.documentElement,st=getComputedStyle(d),body=getComputedStyle(document.body);
    return {mode:d.dataset.mode,accent:d.dataset.accent,gc:st.getPropertyValue("--gc-canvas").trim(),
      canvas:st.getPropertyValue("--canvas").trim(),bg:body.backgroundColor,
      screen:d.clientWidth,scroll:d.scrollWidth,nav:!!document.querySelector('.nav-list a[href="/attention.html"]'),offenders:[...document.querySelectorAll("*")].filter(e=>e.getBoundingClientRect().right>d.clientWidth+1).slice(0,12).map(e=>({tag:e.tagName,class:e.className,id:e.id,right:Math.round(e.getBoundingClientRect().right)}))};
   });
   assert.equal(css.accent,"lagoon");
   assert.equal(css.mode,"light");
   assert.equal(css.gc,"#ecf0f8");
   assert.equal(css.canvas,css.gc);
   assert.ok(css.scroll<=css.screen,"layout overflow "+route+" "+width+" "+JSON.stringify(css));
   assert.ok(css.nav);
   await page.locator("#theme-toggle").click();
   const next=await page.evaluate(()=>({mode:document.documentElement.dataset.mode,canvas:getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim()}));
   assert.equal(next.mode,"light");
   await page.locator("#theme-toggle").click();
   const dark=await page.evaluate(()=>({mode:document.documentElement.dataset.mode,canvas:getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim()}));
   assert.equal(dark.mode,"dark");
   assert.equal(dark.canvas,"#10131e");
   await page.locator("#theme-toggle").click();
   assert.equal(await page.locator("html").getAttribute("data-mode"),"deep-dark");
   await page.evaluate(()=>{document.documentElement.style.fontSize="200%";document.body.style.fontSize="32px";});
   const zoom=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll("*")].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1).slice(0,10).map(e=>({tag:e.tagName,cls:e.className,right:Math.round(e.getBoundingClientRect().right)}))}));
   assert.ok(zoom.scroll<=zoom.width,"200% text reflow "+route+" "+width+" "+JSON.stringify(zoom));
   assert.deepEqual(errors,[],"runtime errors "+route+" "+width);
   results.push({route,width,passed:true,light:css.gc,dark:dark.canvas});
   await context.close();
  }
 }
 console.log(JSON.stringify({outcome:"PASS",checks:results},null,2));
}catch(e){console.log(JSON.stringify({outcome:"FAIL",error:e.message,checks:results},null,2));process.exitCode=1}
finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
