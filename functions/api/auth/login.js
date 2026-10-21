import {startOAuth} from "../../lib/oauth.js";
const error=(code,status)=>new Response(JSON.stringify({error:"GitHub sign-in unavailable.",code}),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
export async function onRequestGet({request,env}){
 const x=await startOAuth(request,env);
 if(!x.location)return error(x.code,x.status);
 return new Response(null,{status:302,headers:{Location:x.location,"Set-Cookie":x.cookie,"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
}
export function onRequest(ctx){return ctx.request.method==="GET"?onRequestGet(ctx):error("method_not_allowed",405);}
