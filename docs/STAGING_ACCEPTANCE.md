# GitHub Dashboard — Private Staging Acceptance

**State:** Development / Forge. This document is a checklist, not evidence of a live deployment.

## Safety boundary

- Use only the GoreeCloud GitHub identity and an explicitly identified private staging target. Preserve production and `main` unchanged.
- The source repository can remain public. Dashboard operational data and read-only GitHub credentials must remain protected by verified authentication on every host, including previews.
- Do not commit, paste, capture or expose OAuth client secrets, session keys, GitHub tokens or private repository payloads.
- A green CI workflow, configuration readiness response or static screenshot does not establish live sign-in, native platform support or release approval.

## Prerequisites before staging deployment

1. Verify the target hosting account, project, environment and **actual HTTPS staging origin** independently. Do not guess a URL.
2. Register a separate GitHub OAuth App in the authorized GoreeCloud GitHub account for this staging origin, with exact callback `STAGING_ORIGIN/api/auth/callback`. Do not use production credentials or a wildcard callback.
3. Store `GITHUB_OWNER=GoreeCloud`, `GITHUB_OAUTH_BASE_URL`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_SESSION_KEY` (32 random bytes, base64url), `GITHUB_OAUTH_ALLOWED_USER_IDS` (approved immutable numeric IDs) and least-privilege read-only `GITHUB_TOKEN` as hosting-environment values or secrets. Never store real values in the public source.
4. Validate staging and all reachable preview/bypass routes before permitting access to any private repository data. Confirm private caching is disabled and that private API responses are `no-store`.
5. Identify the previous known-good staging deployment/revision and verify that a rollback can restore it. Do not overwrite a production environment.

## Automated tests — synthetic only

```bash
npm test
npm run check
npm install --no-save --package-lock=false playwright-core
GC_CHROMIUM_PATH=/path/to/chromium npm run test:browser:session
```

The last command checks signed-out API suppression, 401 session rejection on all three views, and removal of synthetic Attention Queue data after denial. It requires a local Chromium executable. No real credentials are needed.

## Live staging acceptance (not completed)

- Confirm unauthenticated Overview, Governance, Attention Queue, and direct protected API access cannot disclose private data. Confirm `/api/ready` stays 503 when essential credentials are missing.
- Test the exact HTTPS GitHub OAuth callback with an allowlisted GoreeCloud account, a non-allowlisted account, expired/forged state, mismatched origin and preview URLs.
- Confirm HttpOnly/Secure host-only session cookies, logout origin checking, cookie expiration and revocation policy. Check duplicate callbacks and interrupted exchanges.
- Confirm read-only repository data, Actions partial coverage, rate limits, GitHub failure/timeouts, no sensitive browser headers, no public cache, and sanitized server logs.
- Run keyboard, screen-reader, reduced-motion, contrast, forced-colors, Light/Dark/Deep Dark and responsive checks at 390×844, 820×1180, 1280×900 and 1600×1000. Audit rendered screenshots and actual interactions, not only fixture tests.
- Verify staging rollback after a controlled safe deployment and retain nonsecret evidence tied to the exact commit and environment.
- Do not merge, release, call Stable or claim native operating-system support until all applicable gates are actually satisfied.

## Current observed evidence (October 21, 2026)

- Draft PR #7 is based on Draft PR #6. Exact-head published checks passed at `60f03202da37d0fae9fbe748cc600d62bb3b6d01` before this new checklist/test-runner increment.
- Prior local suite: 127 passing Node tests, 0 failures, and four repository validation groups passed.
- Seven local synthetic Chromium session scenarios passed, including private-data removal from Attention Queue after a 401. A screenshot-led signed-out UI audit found an incorrect refresh-available label; the updated guard now shows sign-in-required refresh status on Overview and Governance, with a rechecked 390px screenshot and browser assertions. Full accessibility acceptance remains pending.
- **Not verified:** OAuth App registration, real OAuth sign-in, private staging host, deployed secrets, live data permissions, preview isolation, accessible rendered production experience and rollback.

## Verified public UI-only preview — October 21, 2026

URL: https://goreecloud-github-dashboard-staging.pages.dev/ — **public, not private authenticated staging**. It is non-indexed and explicitly marked Development Preview. Do not input credentials here.

An isolated Cloudflare Pages project was created within the authorized GoreeCloud account, without touching the existing website or production. Direct-upload branch `staging` uses PR #7 source revision `5bedb2e7eff6fc61aad0e5d983cf41172c010954`, plus local staging-only banner/CSS, robots.txt and `_headers` overlays (not committed to the product source). Current deployment ID: `097ef223-7fc0-4e9a-a890-8f603d1bed4b`; previous: `25011eba-aac9-401e-a873-ceefa84bc57b`. Snapshot presence is not proof of rollback acceptance.

Live probes verified 200 for the three UI views and health, 503 for readiness, OAuth login and session, and both private APIs. Pages served `X-Robots-Tag: noindex`, `Cache-Control: no-store` and CSP/security headers; the protected API had `private, no-store`. A browser audit verified 390px mobile and 1280px desktop. A staging-only banner/sidebar overlap was fixed and the final 1280px layout had no horizontal overflow.

**Important:** robots directives do not protect access. OAuth App registration, server-side confidential credentials, account allowlist, genuine authenticated/denied sign-in, preview isolation, accessibility acceptance, and rehearsed rollback remain pending. Configure none of the live data secrets until the host is appropriately access controlled. Proposed future OAuth callback, subject to final approval: `https://goreecloud-github-dashboard-staging.pages.dev/api/auth/callback`.

## UI-only preview update — October 21, 2026

A publicly reachable, non-indexed, no-secrets UI preview at https://goreecloud-github-dashboard-staging.pages.dev/ now includes the protected-overview source from Draft PR #8 (`4bbe7d7`) plus staging-only banner and privacy overlays. Cloudflare snapshot: `03a500c9-20f1-485f-9f60-ac75e1742c4d`; prior snapshot `097ef223-7fc0-4e9a-a890-8f603d1bed4b` retained. The branch is named `staging` within this isolated Pages project, not in GoreeCloud production.

Local Chromium verified signed-out screens at 390, 820, 1280px, zero private Dashboard API calls, and no horizontal overflow. The live preview also passed Chromium assertions at those widths for locked-state visibility and hidden metrics. Live UI/health returned 200 while readiness, session, dashboard and governance data endpoints returned 503; no OAuth or private data credentials were installed. Visual screenshots for phone and desktop were reviewed. This is NOT authenticated staging, a production release, or native OS acceptance. Real OAuth, private host HTTPS/identity, access enforcement and rollback rehearsal remain pending.

## Mobile protected-overview refinement — October 21, 2026

The latest public UI-only Cloudflare Pages snapshot is `603a5be8-dd60-49a2-8d11-f3476c2b6329` (based on product source `eee2362063e2c13e6d8e6e34dd647f6e9fa19034` plus the staging-only banner/noindex overlays). The previous snapshot `03a500c9-20f1-485f-9f60-ac75e1742c4d` remains available as a recovery candidate. The main GoreeCloud production website, `main`, and private credentials were unchanged.

For signed-out mobile screens, the repeated hero introduction is hidden, allowing the secure access explanation and its two practical navigation links to appear above the fold. Source and live UI were audited at 390, 820 and 1280px; the local browser made zero protected data calls for signed-out sessions, and hosted browser assertions confirmed private metrics remain hidden. Full local Node regression suite: 129 passed, zero failed. Both exact-head CI workflows passed for the source revision. Hosted routes `/`, `/governance`, and `/attention` serve UI, while `/api/ready`, `/api/auth/session`, `/api/dashboard`, and `/api/governance` continue returning HTTP 503 with no OAuth credentials. Actual authenticated staging and private hostname HTTPS remain unverified.
