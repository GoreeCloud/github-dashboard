import { allowedGitHubLink } from "./github-link-policy.js";

// Governance data is a lower-trust navigation source. Reject unsafe links
// without changing their visible labels or exposing private data.
export function sanitizeGovernanceLinks(root, documentRef = globalThis.document) {
  if (!root?.querySelectorAll || !documentRef?.createElement) return 0;
  let rejected = 0;
  for (const anchor of root.querySelectorAll("a.item-link")) {
    const safe = allowedGitHubLink(anchor.getAttribute("href"));
    if (!safe) {
      const label = documentRef.createElement("span");
      label.className = anchor.className;
      label.textContent = anchor.textContent;
      anchor.replaceWith(label);
      rejected++;
      continue;
    }
    anchor.href = safe;
    anchor.rel = "noopener noreferrer";
    anchor.target = "_blank";
  }
  return rejected;
}

if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
  const root = document.getElementById("main") || document.body;
  if (root) {
    sanitizeGovernanceLinks(root);
    const observer = new MutationObserver(() => sanitizeGovernanceLinks(root));
    observer.observe(root, { childList: true, subtree: true });
    // A capture guard protects the short window before mutation observers run.
    document.addEventListener("click", (event) => {
      const anchor = event.target?.closest?.("a.item-link");
      if (!anchor || allowedGitHubLink(anchor.getAttribute("href"))) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      sanitizeGovernanceLinks(root);
    }, true);
  }
}
