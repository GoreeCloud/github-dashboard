# GitHub OAuth authentication — Development

**Now:** GitHub OAuth for dashboard sign-in. **Future:** GoreeCloud Identity, only after its Stable release and independent integration acceptance. Cloudflare Access is optional additional protection, not required.

## Architecture
Use GitHub's confidential OAuth web authorization-code flow. The server creates short-lived CSRF state and a fresh PKCE S256 verifier bound together inside an encrypted HttpOnly state cookie. The authorization URL sends only the SHA-256 code challenge; the callback verifies the returned state and submits its original code verifier during the server-side code exchange. The server then verifies the user's immutable GitHub numeric ID against an explicit approved-user allowlist. The browser receives only a short-lived encrypted session cookie, not the OAuth access token.

The dashboard's independent, server-side, least-privilege read-only `GITHUB_TOKEN` continues to fetch repository data. Protected `/api/dashboard` and `/api/governance` requests must validate the session and current allowlist first. Authentication must never be based solely on GitHub display names or emails.

## Required owner-side setup
Register a GitHub OAuth App in the GoreeCloud GitHub account with an exact HTTPS callback URL ending `/api/auth/callback`. Configure `GITHUB_OAUTH_BASE_URL`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_SESSION_KEY` (32 random bytes encoded base64url), and `GITHUB_OAUTH_ALLOWED_USER_IDS` (numeric user IDs separated by commas) in the server-side environment. No sample secrets or approved-user grants belong in committed source. Keep `GITHUB_TOKEN` read-only and server-side. Do not enable public data access while settings or authentication verification are absent.

## Browser session behavior (Development)

All three private views wait for one shared same-origin session check before loading repository data. The browser shows a sign-in state without calling the protected APIs when unauthenticated. A private API 401 or 403 clears the previously rendered private observations and cached signed-in status. This does not revoke a stolen session cookie on another device: authoritative server-side revocation remains a separate acceptance gate.

## Release gates
Test login/denial, CSRF callback state, cookie integrity and expiration, authorization changes, same-origin logout, direct private API access, callback origin and preview-host bypasses, credential rotation, browser accessibility, staging and rollback. Until then, this is **Forge** development and not production accepted. Session revocation beyond short expiry needs explicit design.

## Identity succession
When GoreeCloud Identity becomes Stable, introduce its identity-provider adapter and rerun the same authorization tests. Do not migrate user access silently; the dashboard's private data authorization remains independent.

References: [GitHub OAuth web flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), [GitHub OAuth security best practices](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/best-practices-for-creating-an-oauth-app).

## Development-only acceptance evidence (2026-10-21)

The isolated source branch has automated OAuth route and session fixtures and a synthetic Chromium regression runner. The browser run exercises signed-out navigation at 320, 390, 768 and 1280 CSS pixels on overview/governance, 200% text reflow, theme switching, keyboard skip links, and signed-out/signed-in account controls at 390 CSS pixels, including the attention queue. A screenshot-led review confirmed the sign-in action is prominent and the unavailable refresh control is hidden while signed out.

These checks validate source behavior with synthetic responses only. They **do not** establish a live GitHub OAuth App, real callback exchange, production access control, assistive-technology acceptance, or deployment readiness.
