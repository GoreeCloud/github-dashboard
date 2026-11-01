// Repository data is untrusted for navigation, even when the upstream is GitHub.
// Keep dashboard links on the expected public GoreeCloud source origin.
export function allowedGitHubLink(value) {
  if (typeof value !== "string" || value.length > 4096) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "github.com" || url.port
      || url.username || url.password || url.search || url.hash) return null;
    const match = /^\/GoreeCloud(?:\/([A-Za-z0-9_.-]{1,100})(?:\/.*)?)?\/?$/i.exec(url.pathname);
    if (!match || match[1] === "." || match[1] === "..") return null;
    return url.href;
  } catch {
    return null;
  }
}
