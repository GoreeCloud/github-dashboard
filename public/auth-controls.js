// Centralized, same-origin GitHub session gate for every dashboard view.
let cachedSession;
let accountArea;

function sessionStatus() {
 if (!cachedSession) {
  cachedSession = fetch("/api/auth/session", {credentials:"same-origin",cache:"no-store"})
   .then(async response => {
    if(!response.ok)return {unavailable:true};
    const value=await response.json();
    if(!value||typeof value!=="object"||typeof value.authenticated!=="boolean")return {unavailable:true};
    return {authenticated:value.authenticated,login:typeof value.login==="string"?value.login.slice(0,80):"GitHub user"};
   })
   .catch(() => ({unavailable:true}));
 }
 return cachedSession;
}

function renderSession(state) {
 document.documentElement.dataset.authentication=state.unavailable?"unavailable":state.authenticated?"signed-in":"required";
 if (!accountArea) return;
 accountArea.replaceChildren();
 const label=document.createElement("span");label.className="auth-status";
 if (state.unavailable) {
  label.textContent="GitHub sign-in unavailable";accountArea.append(label);return;
 }
 if (state.authenticated) {
  label.textContent="Signed in · "+(state.login||"GitHub user");
  const button=document.createElement("button");button.type="button";button.className="auth-action";button.textContent="Sign out";
  button.addEventListener("click",async()=>{
   button.disabled=true;
   try {
    const response=await fetch("/api/auth/logout",{method:"POST",credentials:"same-origin",cache:"no-store"});
    if(response.ok){invalidateAuthentication();window.location.reload();}
    else{button.disabled=false;label.textContent="Sign-out failed";}
   }catch{button.disabled=false;label.textContent="Sign-out unavailable";}
  });
  accountArea.append(label,button);
  return;
 }
 label.textContent="Private data requires GitHub sign-in";
 const link=document.createElement("a");link.href="/api/auth/login";link.className="auth-action";link.textContent="Sign in with GitHub";
 accountArea.append(label,link);
}

export async function authenticationStatus() {
 const state=await sessionStatus();
 return state?.authenticated===true && !state.unavailable
  ? {authenticated:true}
  : {authenticated:false,unavailable:Boolean(state?.unavailable)};
}

// Called only after a private API denies the current browser session.
export function invalidateAuthentication() {
 cachedSession=Promise.resolve({authenticated:false});
 renderSession({authenticated:false});
}

async function renderAccount() {
 const host=document.querySelector(".hero-meta")||document.querySelector(".intro-actions");
 if (!host) return;
 accountArea=document.createElement("div");accountArea.className="auth-controls";
 accountArea.setAttribute("aria-label","Account");accountArea.setAttribute("role","status");
 host.prepend(accountArea);
 renderSession(await sessionStatus());
}
void renderAccount();
