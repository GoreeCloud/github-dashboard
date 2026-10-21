import {canLogout,clearSession} from "../../lib/oauth.js";
const json=(data,status,headers={})=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"private, no-store",...headers}});
export function onRequest({request,env}){
 if(request.method!=="POST")return json({code:"method_not_allowed"},405);
 if(!canLogout(request,env))return json({code:"logout_origin_denied"},403);
 return json({signedOut:true},200,{"Set-Cookie":clearSession()});
}
