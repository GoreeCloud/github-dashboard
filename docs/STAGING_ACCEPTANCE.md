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
