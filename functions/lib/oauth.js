// Confidential GitHub OAuth authentication. Browser cookies contain no GitHub tokens.
const S="__Host-gc_session",T="__Host-gc_oauth_state",TTL=14400;
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=b=>btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
function unb64(v){if(typeof v!=="string"||v.length>8192||!/^[A-Za-z0-9_-]+$/.test(v))throw Error("encoding");const s=v.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(s+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));}
export function oauthConfig(env){
 try{const u=new URL(env?.GITHUB_OAUTH_BASE_URL);
 if(u.protocol!=="https:"||u.username||u.password||u.port||u.pathname!=="/"||u.search||u.hash)return null;
 if(!/^[A-Za-z0-9_-]{8,120}$/.test(env?.GITHUB_OAUTH_CLIENT_ID||""))return null;
 if(typeof env?.GITHUB_OAUTH_CLIENT_SECRET!=="string"||env.GITHUB_OAUTH_CLIENT_SECRET.length<12)return null;
 const key=unb64(env.GITHUB_OAUTH_SESSION_KEY);if(key.length!==32)return null;
 const raw=env?.GITHUB_OAUTH_ALLOWED_USER_IDS;
 if(typeof raw!=="string"||!/^[0-9]+(?:\s*,\s*[0-9]+)*$/.test(raw.trim()))return null;
 const ids=new Set(raw.split(",").map(v=>Number(v.trim())));
 if(!ids.size||[...ids].some(n=>!Number.isSafeInteger(n)||n<=0))return null;
 return {origin:u.origin,clientId:env.GITHUB_OAUTH_CLIENT_ID,secret:env.GITHUB_OAUTH_CLIENT_SECRET,key,ids};
 }catch{return null;}
}
const key=c=>crypto.subtle.importKey("raw",c.key,"AES-GCM",false,["encrypt","decrypt"]);
async function seal(c,obj){const iv=crypto.getRandomValues(new Uint8Array(12));const data=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(c),enc.encode(JSON.stringify(obj))));return b64(iv)+"."+b64(data);}
async function open(c,v){if(typeof v!=="string"||v.length>4096||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v))return null;
 try{const [iv,data]=v.split(".").map(unb64);if(iv.length!==12)return null;return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv},await key(c),data)));}catch{return null;}}
function cv(req,name){for(const x of (req?.headers?.get("cookie")||"").split(";")){const entry=x.trim();if(entry.startsWith(name+"="))return entry.slice(name.length+1);}return null;}
const cookie=(n,v,age)=>n+"="+v+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+age;
export const clearState=()=>cookie(T,"",0);
export const clearSession=()=>cookie(S,"",0);
const originOK=(req,c)=>{try{return new URL(req.url).origin===c.origin;}catch{return false;}};
export async function startOAuth(req,env,now=Math.floor(Date.now()/1000)){
 const c=oauthConfig(env);if(!c)return {status:503,code:"oauth_not_configured"};
 if(!originOK(req,c))return {status:403,code:"oauth_origin_mismatch"};
 const state=b64(crypto.getRandomValues(new Uint8Array(32)));
 const url=new URL("https://github.com/login/oauth/authorize");
 url.searchParams.set("client_id",c.clientId);url.searchParams.set("redirect_uri",c.origin+"/api/auth/callback");
 url.searchParams.set("scope","read:user");url.searchParams.set("state",state);url.searchParams.set("allow_signup","false");
 return {status:302,location:url.toString(),cookie:cookie(T,await seal(c,{v:1,state,exp:now+300}),300)};
}
export async function completeOAuth(req,env,{fetchImpl=fetch,now=Math.floor(Date.now()/1000)}={}){
 const c=oauthConfig(env);if(!c)return {status:503,code:"oauth_not_configured"};
 if(!originOK(req,c))return {status:403,code:"oauth_origin_mismatch"};
 const q=new URL(req.url).searchParams,code=q.get("code"),state=q.get("state"),saved=await open(c,cv(req,T));
 if(!code||code.length>512||!/^[A-Za-z0-9_-]+$/.test(code)||!state||state.length>512||!saved||saved.v!==1||saved.exp<=now||saved.state!==state)return {status:403,code:"oauth_state_invalid"};
 try{
  const tokenResponse=await fetchImpl("https://github.com/login/oauth/access_token",{method:"POST",
   headers:{Accept:"application/json","Content-Type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({client_id:c.clientId,client_secret:c.secret,code,redirect_uri:c.origin+"/api/auth/callback"}),
   signal:AbortSignal.timeout(7000)});
  if(!tokenResponse.ok)return {status:502,code:"oauth_provider_unavailable"};
  const tokens=await tokenResponse.json();
  if(tokens?.token_type?.toLowerCase()!=="bearer"||typeof tokens.access_token!=="string"||tokens.access_token.length<10||tokens.access_token.length>4096)return {status:403,code:"oauth_exchange_denied"};
  const profile=await fetchImpl("https://api.github.com/user",{headers:{Authorization:"Bearer "+tokens.access_token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2026-03-10"},signal:AbortSignal.timeout(7000)});
  if(!profile.ok)return {status:403,code:"oauth_identity_denied"};
  const user=await profile.json();if(!Number.isSafeInteger(user?.id)||!c.ids.has(user.id))return {status:403,code:"oauth_user_not_allowed"};
  return {status:303,location:c.origin+"/",cookie:cookie(S,await seal(c,{v:1,id:user.id,login:typeof user.login==="string"?user.login.slice(0,80):"GitHub user",exp:now+TTL}),TTL)};
 }catch{return {status:502,code:"oauth_provider_unavailable"};}
}
export async function verifySession(req,env,now=Math.floor(Date.now()/1000)){
 const c=oauthConfig(env);if(!c)return {ok:false,status:503,code:"oauth_not_configured"};
 if(!originOK(req,c))return {ok:false,status:403,code:"oauth_origin_mismatch"};
 const x=await open(c,cv(req,S));
 if(!x||x.v!==1||!Number.isSafeInteger(x.id)||!c.ids.has(x.id)||!Number.isSafeInteger(x.exp)||x.exp<=now||x.exp>now+TTL)return {ok:false,status:401,code:"authentication_required"};
 return {ok:true,id:x.id,login:typeof x.login==="string"?x.login:"GitHub user"};
}
export function canLogout(req,env){const c=oauthConfig(env);return Boolean(c&&originOK(req,c)&&req.headers.get("origin")===c.origin&&(!req.headers.get("sec-fetch-site")||req.headers.get("sec-fetch-site")==="same-origin"));}
