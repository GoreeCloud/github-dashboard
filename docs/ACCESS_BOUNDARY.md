# GitHub Dashboard — Cloudflare Access boundary

**Status:** Source-level verifier in isolated development PR; authenticated production acceptance is **not** established. This document does not authorize release.

## Private deployment configuration

1. Protect the complete dashboard host with a Cloudflare Access **self-hosted application** and an identity allow policy restricted to authorized GoreeCloud maintainers. Do not expose repository data through an unprotected alternative host, route, or Pages preview.
2. Store `GITHUB_TOKEN` as a **server-side** read-only Cloudflare secret and restrict the accessible GitHub repositories and scopes. The browser never receives this token.
3. Configure `CF_ACCESS_TEAM_DOMAIN` as your validated `https://<team>.cloudflareaccess.com` origin, and `CF_ACCESS_AUD` as this specific Access application's audience (AUD) tag. The verifier rejects arbitrary domains, paths, ports and insecure origins.
4. Only after validating upstream access policies and preventing bypass routes, set the existing server-side `ACCESS_GATE_CONFIRMED=true` interlock. This interlock alone is **never** sufficient: every Dashboard/Governance API GET additionally requires a signed `Cf-Access-Jwt-Assertion` JWT.
5. The verifier reads signing keys from the trusted Cloudflare team JWKS endpoint `/cdn-cgi/access/certs`, matches `kid`, and validates the **RS256 cryptographic signature**, exact issuer, audience, app token type and expiration/not-before timestamps. Invalid or missing tokens receive 403; missing verifier configuration or unavailable certs receive fail-closed responses. JWKS is fetched per authorized API request; production performance and key-rotation behavior require representative testing.

## Acceptance checks (required, not yet completed)

- Verify authorized interactive sign-in and denial of unauthenticated/incognito requests, expired/replayed assertions and audience mismatch on the actual deployment URL, including previews and direct hostnames.
- Verify no private API output or GitHub token in browser storage, HTML, error responses, logs, caches or cross-origin responses.
- Verify GET-only behavior, private no-store caching, effective least-privilege token permissions, Cloudflare Access policy enforcement and policy/keys rotation.
- Verify failure modes for Access outage and invalid JWTs, monitoring without logging claims or token values, and safe rollback to the closed/private state.
- Complete representative keyboard, screen-reader, visual, deployment and recovery gates.

## Safe automated evidence

`tests/access.test.mjs` generates synthetic RSA keys and Access-shaped tokens. It tests valid signatures, forgery, missing/configuration-denied access, wrong audience and issuer, expired/not-yet-valid claims, unexpected team domains, and signing-key outages. The Dashboard and Governance endpoint contract tests assert the fail-closed behavior. These tests **do not** use live identity provider credentials or prove deployment acceptance.

Reference: Cloudflare official [Validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) and [Application token](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/) documentation.
