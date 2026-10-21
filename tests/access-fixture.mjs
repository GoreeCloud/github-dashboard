import {webcrypto} from "node:crypto";
const ORIGIN="https://fixture-team.cloudflareaccess.com";
const AUD="fixture-dashboard-audience";
let pair;
async function keyPair(){
  pair ||= await webcrypto.subtle.generateKey(
    {name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},
    true,["sign","verify"]);
  return pair;
}
const b64=obj=>Buffer.from(JSON.stringify(obj)).toString("base64url");
export async function syntheticAccess({claims={},keyId="fixture-key"}={}){
 const keys=await keyPair();
 const header={alg:"RS256",kid:keyId,typ:"JWT"};
 const now=Math.floor(Date.now()/1000);
 const payload={type:"app",iss:ORIGIN,aud:[AUD],iat:now-60,nbf:now-60,exp:now+300,...claims};
 const signed=b64(header)+"."+b64(payload);
 const signature=Buffer.from(await webcrypto.subtle.sign("RSASSA-PKCS1-v1_5",keys.privateKey,new TextEncoder().encode(signed))).toString("base64url");
 const token=signed+"."+signature;
 const jwk={...await webcrypto.subtle.exportKey("jwk",keys.publicKey),kid:keyId,alg:"RS256",use:"sig"};
 return {
  request:new Request("https://dashboard.invalid/api/governance",{headers:{"Cf-Access-Jwt-Assertion":token}}),
  env:{CF_ACCESS_TEAM_DOMAIN:ORIGIN,CF_ACCESS_AUD:AUD},
  certs:{keys:[jwk]},
  token,
  certsResponse:()=>new Response(JSON.stringify({keys:[jwk]}),{status:200,headers:{"content-type":"application/json"}})
 };
}
