/* GC UI consumer bootstrap: read-only navigation and truthful acceptance. */
function addNavigationLink(parent,label,cls,href,prepend=false){
 if(!parent||parent.querySelector('a[href="'+href+'"]'))return;
 const a=document.createElement("a");a.className=cls;a.href=href;a.textContent=label;
 if(prepend)parent.prepend(a);else parent.append(a);
}
const isGovernanceView=window.location.pathname.endsWith("/governance.html");
if(!isGovernanceView){
 addNavigationLink(document.querySelector(".nav-list"),"Governance","nav-item","/governance.html");
 addNavigationLink(document.querySelector(".hero-meta"),"Governance","pill","/governance.html",true);
}
const adapter=document.querySelector('link[rel="stylesheet"][href="/gc-ui-adapter.css"]');
if(adapter)document.head.append(adapter);
document.documentElement.dataset.gcUiAuthority="GoreeCloud/gc-ui";
document.documentElement.dataset.gcUiAcceptance="pending";
const footer=document.querySelectorAll(".page-footer span");
if(footer.length>=2){
 const purpose=isGovernanceView?"governance observation":"read-only GitHub integration";
 footer[1].textContent="GC UI Foundations · acceptance pending · "+purpose;
}
