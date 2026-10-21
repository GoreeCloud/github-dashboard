/* Server-only Cloudflare Access application JWT verification.
 * No request identity is trusted until RS256 signature, issuer, audience,
 * expiration and not-before claims have all been checked.
 */
const deny=Object.freeze({ok:false,status:403,code:"private_access_denied"});
const unavailable=Object.freeze({ok:false,status:503,code:"access_verification_unavailable"});

function teamOrigin(value){
  if(typeof value!=="string" || value.length>240)return null;
  const raw=value.trim().toLowerCase();
  const url=new URL(raw.startsWith("https://")?raw:"https://"+raw);
  if(url.protocol!=="https:" || !/^[a-z0-9][a-z0-9-]*\.cloudflareaccess\.com$/.test(url.hostname)
    || url.username || url.password || url.port || url.pathname!=="/" || url.search || url.hash)return null;
  return url.origin;
}

export function accessConfigurationReady(env){
  try {return Boolean(teamOrigin(env?.CF_ACCESS_TEAM_DOMAIN) && typeof env?.CF_ACCESS_AUD==="string" && /^[A-Za-z0-9_.-]{6,256}$/.test(env.CF_ACCESS_AUD));}
  catch {return false;}
}

function decodePart(value){
  if(typeof value!=="string" || value.length>8192 || !/^[A-Za-z0-9_-]+$/.test(value))throw Error("invalid token part");
  const b64=value.replace(/-/g,"+").replace(/_/g,"/");
  const bytes=atob(b64+"=".repeat((4-b64.length%4)%4));
  return Uint8Array.from(bytes, char=>char.charCodeAt(0));
}

export async function verifyCloudflareAccess(request,env,{fetchImpl=fetch,now=Math.floor(Date.now()/1000)}={}){
  let origin;
  try{origin=teamOrigin(env?.CF_ACCESS_TEAM_DOMAIN)}catch{return unavailable;}
  const aud=env?.CF_ACCESS_AUD;
  if(!origin || typeof aud!=="string" || !/^[A-Za-z0-9_.-]{6,256}$/.test(aud))return unavailable;
  const token=request?.headers?.get("cf-access-jwt-assertion");
  if(typeof token!=="string" || token.length>12288)return deny;
  const parts=token.split(".");
  if(parts.length!==3)return deny;
  try{
    const header=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(decodePart(parts[0])));
    const claims=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(decodePart(parts[1])));
    if(header?.alg!=="RS256" || typeof header.kid!=="string" || header.kid.length>256 || !/^[A-Za-z0-9_.-]+$/.test(header.kid))return deny;
    if(claims?.iss!==origin || !Array.isArray(claims.aud) || !claims.aud.includes(aud) || claims.type!=="app")return deny;
    if(typeof claims.exp!=="number" || !Number.isSafeInteger(claims.exp) || claims.exp<=now)return deny;
    if(claims.nbf!==undefined && (typeof claims.nbf!=="number" || claims.nbf>now))return deny;
    if(claims.iat!==undefined && (typeof claims.iat!=="number" || claims.iat>now+60))return deny;
    const response=await fetchImpl(origin+"/cdn-cgi/access/certs",{
      method:"GET",headers:{Accept:"application/json"},cache:"no-store",
      signal:AbortSignal.timeout(5000)
    });
    if(!response.ok)return unavailable;
    const length=Number(response.headers.get("content-length")||0);
    if(length>131072)return unavailable;
    const jwks=await response.json();
    if(!Array.isArray(jwks?.keys) || jwks.keys.length>25)return unavailable;
    const jwk=jwks.keys.find(k=>k.kid===header.kid && k.kty==="RSA" && (k.alg===undefined || k.alg==="RS256") && (!k.key_ops || k.key_ops.includes("verify")));
    if(!jwk)return deny;
    const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
    const valid=await crypto.subtle.verify({name:"RSASSA-PKCS1-v1_5"},key,decodePart(parts[2]),new TextEncoder().encode(parts[0]+"."+parts[1]));
    return valid?{ok:true}:deny;
  }catch{return deny;}
}
