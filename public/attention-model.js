export const PRIORITY = Object.freeze({critical: 0, warning: 1, info: 2});

export function normalizeAttention(item) {
  if (!item || typeof item !== "object") return null;
  const repository = typeof item.repository === "string" ? item.repository.trim() : "";
  if (!repository) return null;
  const severity = Object.hasOwn(PRIORITY, item.severity) ? item.severity : "info";
  const reasons = Array.isArray(item.reasons)
    ? item.reasons.filter(x => typeof x === "string" && x.trim()).slice(0, 8)
    : [];
  const score = Number(item.activityScore);
  const time = Date.parse(item.updatedAt);
  return {
    repository,
    url: typeof item.url === "string" ? item.url : "",
    severity,
    reasons,
    activityScore: Number.isFinite(score) ? score : 0,
    updatedAt: Number.isFinite(time) ? new Date(time).toISOString() : null
  };
}
export function attentionCounts(items) {
  const totals = { critical: 0, warning: 0, info: 0, total: 0 };
  for (const item of Array.isArray(items) ? items : []) {
    const row = normalizeAttention(item);
    if (row) { totals[row.severity]++; totals.total++; }
  }
  return totals;
}
export function filterAttention(items, {query="", severity="all", sort="priority"}={}) {
  const needle = String(query).trim().toLowerCase();
  const wanted = Object.hasOwn(PRIORITY, severity) ? severity : "all";
  const rows = (Array.isArray(items) ? items : []).map(normalizeAttention).filter(Boolean)
    .filter(row => (wanted === "all" || row.severity === wanted)
      && (!needle || [row.repository, ...row.reasons].some(value => value.toLowerCase().includes(needle))));
  rows.sort((a,b) => {
    const primary = sort === "activity" ? b.activityScore-a.activityScore
      : sort === "recent" ? Date.parse(b.updatedAt || 0)-Date.parse(a.updatedAt || 0)
      : PRIORITY[a.severity]-PRIORITY[b.severity];
    return primary || PRIORITY[a.severity]-PRIORITY[b.severity] || a.repository.localeCompare(b.repository);
  });
  return rows;
}
export function allowedRepositoryUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com"
      || url.username || url.password || url.port
      || !/^\/GoreeCloud\/[A-Za-z0-9_.-]+(?:\/.*)?$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
