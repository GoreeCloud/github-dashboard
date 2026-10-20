/* Development-only GC UI consumer bridge.
 * Run after the inherited shell loader. Keep GC UI token overrides last.
 * This does not certify full design-system or platform acceptance.
 */
const adapter = document.querySelector('link[rel="stylesheet"][href="/gc-ui-adapter.css"]');
if(adapter) document.head.append(adapter);
document.documentElement.dataset.gcUiAuthority = "GoreeCloud/gc-ui";
document.documentElement.dataset.gcUiAcceptance = "pending";
const footer = document.querySelectorAll(".page-footer span");
if(footer.length >= 2){
 const view = window.location.pathname.endsWith("/governance.html") ? "governance observation" : "read-only GitHub integration";
 footer[1].textContent = "GC UI Foundations · acceptance pending · "+view;
}
