# Deployment

## Production status

The project remains in the GoreeCloud **Development** lifecycle. Source validation is green for the current development work, but production deployment and acceptance are not approved. The source repository is intentionally **public/open source**; this guide defines the separate **private authenticated deployment boundary** for operational access. A public source repository does not imply that a live operational dashboard has been configured, accepted, or made public.

## Required architecture

Because the dashboard may expose private repository metadata, the deployed application must be protected by an authenticated private-access layer before the data API is unlocked. Public access to the source code is permitted; public access to authenticated operational data is not.

Recommended path:

```text
User -> GitHub OAuth sign-in -> Cloudflare Pages Function -> private server-side GitHub API credential
```

Do not deploy a public static site that calls GitHub directly with a private token. Do not place a GitHub token in browser JavaScript, HTML, a checked-in environment file, Pages build output, or client-visible runtime configuration.

## Environment values

Configure the following in the server-side Pages/Workers environment:

- `GITHUB_OWNER=GoreeCloud`
- `GITHUB_TOKEN` — secret, read-only, repository-scoped as narrowly as practical.
- GitHub OAuth credentials, exact callback base origin, encryption key and approved numeric GitHub user IDs (see [GitHub OAuth](GITHUB_OAUTH.md)).

For local work, store real secrets in `.dev.vars`; the repository ignores that file.

## GitHub credential permissions

Use the minimum read permissions needed by the current feature set. The dashboard reads:

- Repository metadata.
- Repository contents for changelog discovery.
- Commit history.
- Issues.
- Pull requests.
- Releases.
- GitHub Actions workflow runs, when the credential is permitted to read them.
- Authenticated rate-limit metadata.

GitHub Actions read access is optional but recommended for the CI Health surface. If Actions data cannot be read, the dashboard must remain usable and explicitly report partial coverage.

Do not grant the dashboard credential repository administration, contents write, issues write, pull-request write, workflow write, secrets, organization administration, or deletion permissions.

## Request timeout behavior

Every outbound GitHub request is protected by an AbortController-backed timeout. The current default is 8 seconds per request. The internal timeout value is clamped to a bounded range so future specialized calls or tests cannot accidentally create an unbounded request.

During deployment validation, verify both timeout paths:

- A core request timeout must produce a sanitized dashboard refresh error and must not leak the credential or raw authorization header.
- A repository-specific optional request timeout must preserve successful peer data and switch the dashboard to partial coverage rather than failing the complete page.

No production environment setting is required for the current timeout because the default is source-controlled and validated. A future configuration option should be added only if a demonstrated operational need justifies it.

## Manual refresh behavior

The browser applies a visible cooldown to the manual Refresh control. A successful refresh starts a 30-second cooldown; a failed refresh starts a 10-second retry floor. The browser entry point loads the refresh guard before the application module so capture-phase click handling can block cooldown-bypassing clicks before they reach the application refresh listener.

This guard is an operational user-interface safeguard, not server-side rate limiting. Direct authenticated API requests are not throttled by this browser control. If enforceable request throttling becomes necessary after live deployment observation, it must be designed and validated as a separate server-side control inside the authenticated private-access boundary.

## GitHub OAuth enablement sequence

1. Register a GitHub OAuth App under the authorized GoreeCloud GitHub account with an exact HTTPS callback ending `/api/auth/callback`.
2. Configure `GITHUB_OAUTH_BASE_URL`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_SESSION_KEY`, and `GITHUB_OAUTH_ALLOWED_USER_IDS` as described in [GitHub OAuth](GITHUB_OAUTH.md).
3. Confirm an unconfigured deployment returns `503` readiness and does not expose private API data.
4. Add the independent server-side least-privilege read-only `GITHUB_TOKEN`.
5. Verify authorized and unauthorized GitHub accounts, OAuth callback state, HTTPS origin, secure cookie handling and direct API denial in staging.
6. Verify login/logout, sign-in fallback, mobile UI, preview-host bypass resistance, safe logs and rollback before any production promotion.

Cloudflare Access can be an optional extra protection layer and is not an OAuth requirement.

## Validation before production approval

At minimum, validate:

- `npm test` and `npm run check` pass at the exact release-candidate head when the project reaches that lifecycle stage.
- The deployed operational site is inaccessible to unauthenticated users even though the source repository is public.
- The API fails closed if the GitHub token is removed.
- The API fails closed without a valid OAuth configuration or currently authorized encrypted session.
- Browser developer tools show no GitHub credential or authorization header.
- Private repository data is not cached publicly.
- Security headers are present.
- Phone 390 x 844, Tablet 820 x 1180, Desktop 1280 x 900, and Wide Desktop 1600 x 1000 representative task flows are reviewed for the supported targets.
- Keyboard focus, reduced motion, increased contrast, and forced-colors behavior remain usable.
- Repository Attention distinguishes critical, review, informational, and coverage-unavailable signals without implying unavailable evidence is a confirmed defect or confirmed absence.
- CI Health correctly shows success/failure/in-progress/no-run states where Actions read access exists.
- Missing Actions read permission degrades to explicit partial coverage rather than a complete dashboard outage.
- GitHub rate-limit metadata is shown when available and absent data is not silently represented as complete.
- Core and repository-specific request timeouts behave according to the documented failure hierarchy.
- The manual refresh cooldown is visible, keyboard-safe, touch-safe, and does not claim to be server-side rate limiting.
- Empty, GitHub-error, optional-data, timeout, cooldown, and rate-limit states are understandable and do not leak backend internals.
- Rollback to the prior Pages deployment is available.

TV is not an initial supported target and is not part of the initial acceptance claim.

## Rollback

Source rollback is performed through Git history. Deployment rollback should use the hosting platform's previous known-good deployment. If OAuth access cannot be verified, remove the OAuth client/allowlist configuration or the GitHub data credential; protected APIs will fail closed even when public static assets remain reachable.
