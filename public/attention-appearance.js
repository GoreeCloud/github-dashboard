import {appearanceIcon,appearanceLabel,nextAppearance,normalizeAppearance} from "./theme-policy.js";

const STORAGE_KEY = "goreecloud-github-dashboard-theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");
const button = document.getElementById("appearance");

function storedMode(){
 try { return normalizeAppearance(localStorage.getItem(STORAGE_KEY)); }
 catch { return "system"; }
}
let mode = storedMode();
function render(){
 const dark = mode === "dark" || mode === "deep-dark" || (mode === "system" && media.matches);
 document.documentElement.dataset.mode = mode === "deep-dark" ? "deep-dark" : dark ? "dark" : "light";
 if(!button)return;
 button.textContent = appearanceIcon(mode);
 const next = nextAppearance(mode);
 const label = "Appearance: "+appearanceLabel(mode)+". Switch to "+appearanceLabel(next)+".";
 button.setAttribute("aria-label",label);
 button.title = label;
 button.dataset.appearance = mode;
}
button?.addEventListener("click",()=>{
 mode=nextAppearance(mode);
 try {localStorage.setItem(STORAGE_KEY,mode);} catch {}
 render();
});
media.addEventListener?.("change",render);
render();
