# Repository attention queue — Development

The dedicated `/attention.html` view is an incremental adoption of [GoreeCloud UI](https://github.com/GoreeCloud/gc-ui). The presentation uses GC UI Canvas/Surface semantic tokens and Lagoon accent mapping, with adaptive layout and system light/dark modes. Reference authority: `gc-ui` revision `d4c485e515c0d8bc26a86aaf383e15520cac1536`; design-system conformance of this consumer is **not yet accepted**.

## Implemented scope

- GET-only data from the already protected `/api/dashboard`; browser code never receives or uses a GitHub token.
- Prioritized attention observations, repository/reason search, severity filter, activity/recency sorting and read-only repository links restricted to `https://github.com/GoreeCloud/...`.
- Coverage disclosure for the API-ranked sample, not a claim about all repositories.
- Bounded 30-second request timeout and API-friendly success/failure cooldowns.
- Semantic headings, labels, live status text, keyboard skip link and responsive summary controls.
- Navigation entry points on dashboard and governance, including mobile.
- Existing dashboard, access gate, cache-control, GitHub API permissions, and deployment settings remain unchanged.

## Scope and acceptance boundaries

This migration does **not** remove the existing legacy design runtime from the remainder of the dashboard. The new view is a partial GC UI adoption and is **not** a certified GC UI consumer, a production rollout, or a replacement for GitHub provider-native facts.

Before merge or release, require exact-head automated validation plus authenticated API integration, rendered mobile/tablet/desktop layout and reflow review, keyboard/screen-reader review, reduced-motion/forced-colors checks, safe deployment and rollback verification, and reconciliation of remaining legacy references. Do not report production acceptance without that evidence.
