import {filterAttention, attentionCounts, allowedRepositoryUrl} from "./attention-model.js";
import {SUCCESS_COOLDOWN_SECONDS, FAILURE_RETRY_SECONDS} from "./refresh-policy.js";

const el = id => document.getElementById(id);
const state = {items:[],busy:false,deadline:0,interval:null};
const media = matchMedia("(prefers-color-scheme: dark)");
function appearance(){document.documentElement.dataset.mode=media.matches?"dark":"light";}
appearance();media.addEventListener?.("change",appearance);
function text(id,value){el(id).textContent=String(value);}
function node(tag,value,className=""){const n=document.createElement(tag);n.textContent=value;n.className=className;return n;}
function render(){
 const items=filterAttention(state.items,{query:el("query").value,severity:el("severity").value,sort:el("sort").value});
 text("result-count",items.length+" of "+state.items.length+" observed signals shown");
 const queue=el("queue");queue.replaceChildren();
 if(!items.length){queue.append(node("p",state.items.length?"No signals match your filters.":"No attention signals were returned.","empty"));return;}
 for(const item of items){
  const card=node("article","","queue-item"),heading=node("div","","queue-title");
  const url=allowedRepositoryUrl(item.url);
  const link=node(url?"a":"strong",item.repository);
  if(url){link.href=url;link.target="_blank";link.rel="noopener noreferrer";}
  const badge=node("span",item.severity==="critical"?"Critical":item.severity==="warning"?"Review":"Info","priority");
  badge.dataset.severity=item.severity;heading.append(link,badge);card.append(heading);
  if(item.reasons.length){const list=node("ul","","reasons");for(const reason of item.reasons)list.append(node("li",reason));card.append(list);}
  card.append(node("p","Activity score "+Math.round(item.activityScore)+" · Updated "+(item.updatedAt?new Date(item.updatedAt).toLocaleDateString():"unknown"),"item-meta"));
  queue.append(card);
 }
}
function setStatus(message,error=false){text("status",message);el("status").dataset.error=String(error);}
function control(){
 const seconds=Math.ceil((state.deadline-Date.now())/1000),button=el("reload");
 button.disabled=state.busy||seconds>0;
 button.textContent=state.busy?"Refreshing…":seconds>0?"Refresh in "+seconds+"s":"Refresh data";
 if(seconds<=0&&state.interval){clearInterval(state.interval);state.interval=null;}
}
function cooldown(seconds){state.deadline=Date.now()+1000*seconds;if(state.interval)clearInterval(state.interval);state.interval=setInterval(control,1000);control();}
async function refresh(){
 if(state.busy||Date.now()<state.deadline)return;
 state.busy=true;control();setStatus("Refreshing protected GitHub observations…");
 const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),30000);
 try{
  const response=await fetch("/api/dashboard",{method:"GET",cache:"no-store",credentials:"same-origin",headers:{Accept:"application/json"},signal:abort.signal});
  if(!response.ok)throw Error(response.status===503?"Private dashboard access is locked or not configured.":"Dashboard temporarily unavailable.");
  const data=await response.json();
  if(data?.mode!=="read-only"||!Array.isArray(data?.repositoryAttention))throw Error("Unexpected read-only dashboard response.");
  state.items=data.repositoryAttention;
  const totals=attentionCounts(state.items);
  for(const key of ["critical","warning","info"])text("count-"+key,totals[key]);
  text("count-all",totals.total);
  const coverage=data.dataHealth?.status==="complete"?"No reported upstream gaps":"Partial or unknown upstream coverage";
  text("coverage",coverage+" · ranked repository sample");
  const generated=Date.parse(data.generatedAt);
  setStatus("Last generated "+(Number.isFinite(generated)?new Date(generated).toLocaleString():"at unknown time")+" · "+coverage);
  render();cooldown(SUCCESS_COOLDOWN_SECONDS);
 }catch(error){
  const message=error?.name==="AbortError"?"Request timed out.":error instanceof Error?error.message:"Dashboard data unavailable.";
  setStatus(message+" Previously loaded signals remain visible.",true);cooldown(FAILURE_RETRY_SECONDS);
 }finally{clearTimeout(timeout);state.busy=false;control();}
}
for(const id of ["query","severity","sort"])el(id).addEventListener(id==="query"?"input":"change",render);
el("reload").addEventListener("click",refresh);
refresh();
