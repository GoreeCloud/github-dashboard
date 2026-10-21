// Progressive navigation bridge for the new GC UI-based queue.
function appendLink(parent, label, className, href) {
  if (!parent || parent.querySelector('a[href="' + href + '"]')) return;
  const link = document.createElement("a");
  link.href = href;
  link.className = className;
  link.textContent = label;
  parent.append(link);
}
const href = "/attention.html";
appendLink(document.querySelector(".nav-list"), "Attention queue", "nav-item", href);
appendLink(document.querySelector(".hero-meta"), "Attention queue", "pill", href);
const mobile = document.querySelector(".mobile-nav");
if (mobile) {
  appendLink(mobile, "Queue", "", href);
  mobile.classList.add("has-attention");
  if (mobile.querySelectorAll("a").length >= 6) mobile.classList.add("has-six-destinations");
  if (!document.querySelector('link[data-attention-navigation]')) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "/attention-navigation.css";
    style.dataset.attentionNavigation = "true";
    document.head.append(style);
  }
}
