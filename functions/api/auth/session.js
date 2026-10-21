import {verifySession} from "../../lib/oauth.js";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"private, no-store, max-age=0"}});
export async function onRequestGet({request,env}){
 const auth=await verifySession(request,env);
 if(auth.code==="oauth_not_configured")return json({authenticated:false,provider:"github",code:auth.code},503);
 return json({authenticated:Boolean(auth.ok),provider:"github",...(auth.ok?{login:auth.login}:{})});
}
export function onRequest(ctx){return ctx.request.method==="GET"?onRequestGet(ctx):json({code:"method_not_allowed"},405);}
