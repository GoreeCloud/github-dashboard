// OAuth UI
async function renderAccount(){
 const host=document.querySelector(".hero-meta")||document.querySelector(".intro-actions");
 if(!host)return;
 const area=document.createElement("div");area.className="auth-controls";area.setAttribute("aria-label","Account");host.append(area);
 const label=document.createElement("span");label.className="auth-status";let state;
 try{const r=await fetch("/api/auth/session",{credentials:"same-origin",cache:"no-store"});state=r.ok?await r.json():{unavailable:true};}
 catch{state={unavailable:true};}
 if(state.unavailable){label.textContent="GitHub sign-in unavailable";area.append(label);return;}
 if(state.authenticated){
  label.textContent="Signed in · "+state.login;
  const button=document.createElement("button");button.type="button";button.className="auth-action";button.textContent="Sign out";
  button.addEventListener("click",async()=>{
   button.disabled=true;
   try{const r=await fetch("/api/auth/logout",{method:"POST",credentials:"same-origin",cache:"no-store"});
    if(r.ok)window.location.reload();else{button.disabled=false;label.textContent="Sign-out failed";}}
   catch{button.disabled=false;label.textContent="Sign-out unavailable";}
  });area.append(label,button);
 }else{
  label.textContent="Private data requires GitHub sign-in";
  const link=document.createElement("a");link.href="/api/auth/login";link.className="auth-action";link.textContent="Sign in with GitHub";
  area.append(label,link);
 }
}
void renderAccount();
