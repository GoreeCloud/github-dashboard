import {completeOAuth,clearState} from "../../lib/oauth.js";
const error=(code,status)=>new Response(JSON.stringify({error:"GitHub sign-in could not be completed.",code}),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":clearState()}});
export async function onRequestGet({request,env}){
 const x=await completeOAuth(request,env);
 if(!x.location)return error(x.code,x.status);
 const headers=new Headers({Location:x.location,"Cache-Control":"no-store","Referrer-Policy":"no-referrer"});
 headers.append("Set-Cookie",clearState());headers.append("Set-Cookie",x.cookie);
 return new Response(null,{status:303,headers});
}
export function onRequest(ctx){return ctx.request.method==="GET"?onRequestGet(ctx):error("method_not_allowed",405);}
