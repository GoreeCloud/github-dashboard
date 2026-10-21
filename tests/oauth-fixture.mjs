import {randomBytes} from "node:crypto";
export const ID=295260680,BASE="https://dashboard.goreecloud.test";
export function fixtureEnv(){
 return {GITHUB_OAUTH_BASE_URL:BASE,GITHUB_OAUTH_CLIENT_ID:"Ov23fixture-client",
 GITHUB_OAUTH_CLIENT_SECRET:["synthetic","client","secret","only"].join("-"),
 GITHUB_OAUTH_SESSION_KEY:randomBytes(32).toString("base64url"),
 GITHUB_OAUTH_ALLOWED_USER_IDS:String(ID)};
}
export async function sessionFixture(env=fixtureEnv()){
 const {startOAuth,completeOAuth}=await import("../functions/lib/oauth.js");
 const initial=await startOAuth(new Request(BASE+"/api/auth/login"),env);
 if(initial.status!==302)throw Error("Login did not begin");
 const u=new URL(initial.location);
 const request=new Request(BASE+"/api/auth/callback?code=fixtureCode123&state="+u.searchParams.get("state"),{headers:{cookie:initial.cookie.split(";")[0]}});
 const result=await completeOAuth(request,env,{fetchImpl:async target=>{
  if(target==="https://github.com/login/oauth/access_token")return new Response(JSON.stringify({token_type:"bearer",access_token:"synthetic-oauth-access-token"}),{status:200});
  if(target==="https://api.github.com/user")return new Response(JSON.stringify({id:ID,login:"GoreeCloud"}),{status:200});
  throw Error("unexpected OAuth test endpoint");
 }});
 if(result.status!==303)throw Error("OAuth callback not complete");
 const cookie=result.cookie.split(";")[0];
 return {env,cookie,login:initial,result,request:new Request(BASE+"/api/dashboard",{headers:{cookie}})};
}
