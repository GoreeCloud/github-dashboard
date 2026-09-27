# GoreeCloud GitHub Dashboard — Privacy Policy

## Scope

The source repository is public/open source. The operational dashboard is private and authenticated whenever it can display non-public GoreeCloud repository data. This policy describes the current Forge/development source; production privacy acceptance remains open.

## Data processed

Approved read-only views may process repository names/descriptions, commit metadata/messages, issues, pull requests, releases, changelog text, workflow state, branch/ruleset evidence, and derived operational signals. Private repository information remains private operational data unless separately approved for public release.

## Authority

GitHub is authoritative for repository data. The dashboard normalizes and presents evidence; it does not become a second repository database or transfer producer authority.

## Credentials

Reusable GitHub credentials remain server-side and must not appear in browser assets, public build output, screenshots, ordinary documentation, or source-controlled environment files.

## Storage and retention

Dashboard API responses use `private, no-store, max-age=0`. Shared private-data caching is disabled. The application does not currently own a durable user repository dataset. Browser storage may contain only the selected appearance preference.

## Telemetry

The current source does not require third-party analytics or advertising trackers. Future observability must be separately governed, privacy-minimized, purpose-limited, and accepted through the applicable platform boundaries.

## Access and disclosure

A deployment that can access private GitHub information must be protected by an authenticated private-access layer before `ACCESS_GATE_CONFIRMED=true` is enabled. Operators must avoid copying private output into public logs, issues, screenshots, or documentation.

## External services

The design uses GitHub APIs and plans Cloudflare Pages/Pages Functions plus authenticated private access. Those providers operate under their own service terms and controls.

## Acceptance boundary

No-store behavior, minimization, credential separation, and private-access requirements are source controls; they do not by themselves establish accepted Privacy Shield or Wardveil Security integration. Production privacy review must be repeated against the exact deployment configuration.
