# Project Specifications — GitHub Dashboard

> **Canonical authority:** `GoreeCloud/github-dashboard`  
> **Migration:** Canonicalized from Google Drive source `1h0-dc8XqSgF4XmoypcRiHwB62ijDxZx9` on 2026-09-27.  
> **Authority boundary:** GitHub is authoritative for repository state and this file is authoritative for project specifications. Historical evidence belongs in `PROJECT-RECORD.md`.

Document Metadata
Document Owner: LaDamian Goree
Version: v0.1
Status: Draft
Created: August 21, 2026
Classification: Internal
Document Type: Software Project Specification and Implementation Blueprint
Project Name: GoreeCloud GitHub Dashboard
Release Lifecycle: Forge
Project Status: Active Forge / Development Deployment — Read-only dashboard foundation, Repository Attention, CI Health, explicit partial-data state, API-budget visibility, bounded request timeouts, refresh discipline, fail-closed API contracts, current fourteen-file application/service repository-baseline governance observation, declaration-only Platform Contract evidence, classic protection/ruleset/workflow-reference evidence, Platform Contract 2.0, and GLAZE UI V1.6 source targeting implemented; Draft PR #1 open; exact-head CI green; rendered, platform-system, deployment, Seal, Anchor, and production acceptance pending
Repository: GoreeCloud/github-dashboard
Repository Visibility: Public / Open Source
Development Model: Original GoreeCloud-owned software development
Approved License: MIT
Source Version: 0.3.0-dev
Design Language: GLAZE UI V1.6 / 1.6.0 — Current Shared Consumer Target; source targeting implemented; repository-local rendered, accessibility, performance, and production acceptance pending
Planned Hosting Model: Cloudflare Pages with server-side Pages Functions behind an authenticated private-access layer
Production Deployment: Not approved
Authoritative Repository-State Source: GitHub
Authoritative Record: Yes
Related Records
- Repository CHANGELOGS.md — GitHub Dashboard
- GitHub-Repository-Index.xlsx
- Table of Contents.docx
- Standard — Glaze UI Design Language
- Standard — Application Branding and User Interface Design
- Standard — Application and Service Production Readiness
- Standard — Application and Service Release Lifecycle
- Standard — Privacy by Default
- Standard — Sensitive Information Separation
- Standard — Code Structure and Documentation
- Standard — Security Updates and Vulnerability Management
- Standard — Open-Source and Self-Hosted Preference
- Repository and Source Control Policy
- Policy — API Keys
- Policy — Privacy and Data Protection
- Rules — Document Creation
- Instructions — Continuous Enhancement and Improvement
## 1. Project Definition
I am developing GoreeCloud GitHub Dashboard as a standalone, public/open-source, first-party application whose deployed operational dashboard remains private and authenticated for the GoreeCloud GitHub repository portfolio. I will use it to consolidate recent repository changes, changelog visibility, repository activity, pull requests, issues, releases, and repository-health information without turning another application into a second source of truth.
GitHub remains authoritative for repository state. The dashboard may aggregate, normalize, rank, cache, and present GitHub information, but it must not silently become authoritative for repository metadata, commits, pull requests, issues, releases, workflow state, or source history.
## 2. Role and Purpose
Role: Public/Open-Source Application with Private Authenticated Read-Only GoreeCloud Repository Operations Deployment
I will use the dashboard to answer routine operational questions quickly, including what changed recently, which repositories are most active, where open work exists, which repositories have current changelogs or releases, and which projects may need attention.
My objectives are to provide:
- Recent changes across GoreeCloud repositories.
- Top 10 repositories ranked by current operational activity rather than popularity alone.
- Total, public, and private repository counts.
- Open pull-request and issue visibility.
- Changelog discovery and concise release-history summaries.
- Latest release visibility.
- A searchable repository directory.
- Repository-health and attention signals as the project matures.
- A responsive Glaze UI experience designed for phone, tablet, desktop, and Wide Desktop use.
## 3. Product Decision
I approve the GitHub Dashboard as a separate GoreeCloud application and repository. I will not embed its primary implementation inside GoreeCloud Manager merely because Manager is also an administrative interface.
The dashboard may later integrate with Manager through a link, summary card, or supported API boundary, but its source, release lifecycle, deployment, security model, and product identity remain independently governed.
## 4. Release Lifecycle
The current canonical GoreeCloud lifecycle stage is Forge, with deployment state development and qualification state not-started.
This classification reflects the verified state: the source foundation exists, exact-head automated validation passes, and core dashboard capabilities are implemented, but rendered browser/device acceptance, final product identity, private-access deployment, live GitHub credential provisioning, deployment validation, monitoring, rollback validation, and production approval remain incomplete.
I will not advance the project to Weave, Seal, or Anchor merely because source CI passes. Lifecycle transition and production acceptance must follow the applicable GoreeCloud release-lifecycle, Platform Contract 2.0, and production-readiness requirements.
## 5. Current Source Foundation
The current development branch is agent/dashboard-foundation and Draft PR #1 is titled Build GoreeCloud GitHub Dashboard foundation.
The current validated exact source head is 483775cc9d135442a7fa20a910999f4fccec63b6.
Exact-head GitHub Actions foundation run #119 / 36340205861 completed successfully on that revision; the independent GoreeCloud Platform Contract 2.0 run #82 / 36340205883 also passed on the same head. The verified source foundation includes bounded repository aggregation, request/rate-limit resilience, Coverage Detail, fail-closed security, current fourteen-file application/service repository-baseline observation, declaration-only Platform Contract evidence derived from the existing bounded manifest read, classic-protection/ruleset/workflow-reference evidence, bounded Platform Contract application/service applicability classification, and current repository governance records. The declaration channel adds no GitHub endpoint or permission and does not perform full peer manifest validation or computed conformance.
- Recent commit aggregation.
- Top 10 activity-ranked repositories.
- Public, private, and total repository counts.
- Aggregate open-work information.
- Searchable repository directory.
- Open pull requests and issues.
- Repository-local changelog discovery.
- Latest release visibility.
- Manual refresh behavior with a visible 30-second post-success cooldown, a 10-second failure retry floor, and a bootstrap-loaded capture-phase guard that prevents cooldown-bypassing manual clicks.
- Light and dark appearance support.
- Loading and upstream-failure states.
- Cloudflare Pages Functions integration.
- Server-side GitHub credential boundary.
- Strict browser security headers.
- Unit tests, fail-closed API contract tests, deterministic representative GitHub aggregation fixtures, and repository validation.
- Architecture and deployment documentation.
- Repository Attention with explainable critical, review, and informational signals for the Top 10 active repositories.
- Best-effort latest GitHub Actions status with fail-soft permission/error isolation.
- Explicit complete/partial data-coverage state and normalized GitHub core/search rate-limit metadata.
- Per-repository checked/unavailable metadata for bounded recent-commit, changelog, release, and workflow reads so repository-specific upstream failures cannot be silently omitted while coverage is represented as complete.
- Server-side unavailable-repository identity is retained only to distinguish unavailable CI/changelog evidence from confirmed absence when deriving attention signals; the browser receives aggregate coverage counts rather than a separate unavailable-repository list.
- Every GitHub request is protected by an AbortController-backed 8-second default timeout. Internal override values are clamped between 250 milliseconds and 20 seconds, timeout timers are always cleared, and forwarded upstream abort listeners are removed during cleanup.
- MIT license, CODEOWNERS, security policy, and repository-local changelog.
## 6. GitHub Authority and Read-Only Integration
I require the production dashboard integration to remain read-only unless a separate future project decision explicitly authorizes a narrowly scoped write capability.
The current application does not define GitHub mutation routes. The runtime GitHub credential must use the narrowest practical read permissions required for the selected dashboard features. GitHub repository metadata, commits, pull requests, issues, releases, changelogs, and supported workflow information are read from GitHub and normalized into dashboard-safe response objects.
The dashboard must never require a broad administrative token merely for convenience.
## 7. Private Repository Data Boundary
The repository portfolio includes private information. The source repository may remain public/open source, but I therefore treat the deployed dashboard and its authenticated API responses as private whenever they display private repository names, activity, issues, pull requests, changelogs, release information, or other non-public metadata.
GITHUB_TOKEN must remain server-side only. It must not be embedded in browser JavaScript, HTML, generated static assets, logs, screenshots, ordinary documentation, or source-controlled environment files.
The current source includes ACCESS_GATE_CONFIRMED as a fail-closed deployment interlock. The API refuses to return private dashboard data until that value is explicitly enabled.
ACCESS_GATE_CONFIRMED is not authentication. I may enable it only after an authenticated private-access layer has been configured and verified for the deployed application.
## 8. Intended Deployment Architecture
The intended deployment path is:
Authorized user
→ authenticated private-access layer
→ Cloudflare Pages
→ Cloudflare Pages Function
→ GitHub API
Static browser assets must not contain reusable GitHub credentials. The Pages Function performs authenticated GitHub reads on the server side and returns normalized dashboard data to an already authorized user session.
No production deployment, Cloudflare Access policy, domain, DNS record, runtime secret, or production environment is approved by this specification as currently implemented.
## 9. Dashboard Information Architecture
The primary dashboard sections are:
- Overview — portfolio counts and high-level operational status.
- Recent Changes — bounded recent commit activity from active repositories.
- Top 10 Repositories — activity-ranked repositories with useful operational metadata.
- Changelog Radar — discovered repository-local changelog files and concise summaries.
- Latest Releases — recent release information where available.
- Pull Requests — recently updated open pull requests.
- Issues — recently updated open issues.
- Repository Directory — searchable repository list with visibility, language, update age, description, and open-work context.
Future additions should improve operational usefulness rather than duplicate GitHub indiscriminately. Appropriate candidates include CI health, repository attention signals, stale-work detection, release-readiness indicators, security-maintenance status, and bounded trend summaries.
## 10. Top 10 Activity Ranking
The Top 10 view is an operational ranking, not a popularity leaderboard.
Recent repository pushes are the primary ranking signal. Open-work activity and small popularity signals may contribute, while archived and disabled repositories are excluded. The ranking algorithm must remain understandable, deterministic, bounded, and documented so that a repository does not appear important merely because of historical stars or repository size.
## 11. Changelog Model
The dashboard prefers the current GoreeCloud repository-native CHANGELOGS.md record and retains legacy CHANGELOG.md, docs/CHANGELOG.md, and changelog.md fallbacks for repositories not yet migrated.
The dashboard may extract a concise summary of the first meaningful release section, but the authoritative source remains the repository file itself. The user interface must link back to the authoritative GitHub source rather than presenting an extracted summary as a separate historical record.
The private goreecloud-changelogs application is a separate GoreeCloud project and must not be made an undocumented dependency of this dashboard.
## 12. Glaze UI and Form-Factor Contract
The application must target GLAZE UI V1.6 / 1.6.0, the current shared consumer baseline. The GoreeCloud Glaze UI source repository remains authoritative for shared release state. The dashboard's V1.6 source target is implemented, but shared-library qualification does not certify this consumer; exact-revision rendered, accessibility, resilience, interaction-state, representative performance, layout/density, responsive, and production acceptance remain required for its supported form factors.
The dashboard must provide purpose-built compositions for supported form factors rather than one generic layout scaled to different screen sizes.
The current intended supported form factors are:
- Phone / Compact — touch-first mobile composition.
- Tablet / Medium — tablet-appropriate use of additional canvas.
- Desktop / Expanded — persistent desktop navigation and efficient pointer/keyboard workspace.
- Wide Desktop — expanded information density without uncontrolled line length or stretched mobile components.
TV is explicitly unsupported in the initial project scope.
Before visual production acceptance, representative task flows must be evaluated at the governing Glaze UI acceptance sizes, including 390 × 844, 820 × 1180, 1280 × 900, and 1600 × 1000 for the supported classes.
## 13. Accessibility and Resilience
The application must preserve keyboard navigation, visible focus, logical reading order, appropriate contrast, clear loading and error states, reduced-motion behavior, increased-contrast behavior, forced-colors resilience, and usable table/content overflow.
Visual depth, translucency, gradients, blur, and motion must support hierarchy without becoming necessary for comprehension. Solid-surface fallbacks must remain usable when visual effects are unavailable or inappropriate.
## 14. Product Identity
GoreeCloud GitHub Dashboard requires a unique canonical application or service identity before visual production acceptance.
The current source intentionally remains text-first because no canonical dashboard icon or service mark has been approved. I will not invent or silently promote a generic GoreeCloud symbol as the dashboard identity.
When a canonical identity is approved, its source artwork and reproducible derivatives must be maintained in the dashboard repository or another explicitly documented canonical GoreeCloud identity repository, and web favicon/application assets must derive from that source.
## 15. Security Controls
The dashboard must remain fail-closed where private information could otherwise be exposed.
Required security properties include:
- Read-only GitHub integration by default.
- Least-privilege server-side credentials.
- No reusable secrets in source control or ordinary documentation.
- Authenticated private access before private data is enabled.
- Content Security Policy.
- Frame-ancestor denial.
- MIME sniffing protection.
- Restrictive referrer and permissions policies.
- Private/no-store handling for authenticated API responses where appropriate.
- Sanitized error responses that do not expose credentials or unnecessary backend internals.
- Bounded upstream fan-out and timeout/error handling.
## 16. Performance and GitHub API Discipline
The dashboard must respect GitHub API rate limits and avoid unnecessary repository-wide fan-out on every browser interaction.
I will use bounded pagination, bounded concurrency, selective detail fetches, normalized responses, and appropriate short-lived server-side or edge caching where it can be introduced without weakening privacy or freshness requirements.
A manual refresh control may request newer data, but refresh behavior must not become an uncontrolled rate-limit bypass. The current browser implementation starts a visible 30-second cooldown after a successful refresh and a 10-second retry floor after a failed refresh. This browser guard reduces accidental repeated fan-out but is not server-side rate limiting, authentication, authorization, or abuse prevention; any future enforceable throttling must be implemented server-side within the authenticated private-access boundary.
## 17. Testing and Validation
Automated validation currently covers activity ranking, archived-repository penalties, Top 10 exclusions, repository normalization, public/private summary counting, changelog extraction, workflow normalization, rate-limit normalization, CI-priority attention ordering, stale-repository attention, coverage-aware repository attention, per-repository recent-change partial failures, fail-soft rate-limit behavior, bounded request-timeout behavior, manual-refresh cooldown policy, cooldown deadline and remaining-time calculations, refresh-guard/bootstrap integrity, fail-closed API contract behavior, protected JSON/private-no-store API error responses, mutation-style HTTP method rejection, deterministic representative private-repository aggregation, GitHub owner filtering, raw-field and synthetic-credential non-passthrough, Actions and changelog permission-denial semantics, confirmed optional 404 absence semantics, fail-soft rate-limit endpoint loss, sanitized core GitHub failure behavior, required repository files, Repository Attention and CI Health surface presence, partial-data and rate-limit API output, CSP compatibility, responsive source requirements, deployment interlock presence, security headers, ignored local secrets, blank example credentials, committed-secret detection, Coverage Detail surface/model invariants, and JavaScript syntax.
Passing source CI is necessary but not sufficient for production acceptance.
The deterministic fixture foundation now covers representative successful private-repository aggregation, owner filtering, permission-denied optional reads, confirmed optional 404 absence, rate-limit endpoint loss, and sanitized core permission failures. The next validation expansion should add richer multi-repository and pagination fixtures, additional search-rate-limit and upstream failure scenarios, live permission and rate-limit behavior, live timeout behavior against representative network failure conditions, cache behavior if caching is introduced, and rendered browser/device acceptance evidence. Fail-closed API behavior for missing credentials, an unconfirmed private-access gate, mutation-style methods, and protected error responses remains covered automatically.
## 18. Production Readiness Gates
The following gates remain open:
- Representative rendered phone, tablet, desktop, and Wide Desktop acceptance, including refresh cooldown behavior for pointer, keyboard, and touch interaction.
- Final canonical product identity and required favicon/application assets.
- Authenticated private-access configuration and verification.
- Least-privilege GitHub runtime credential provisioning.
- Live GitHub API validation against representative public and private repositories.
- Cloudflare Pages deployment validation.
- Security-header verification on the deployed environment.
- Rate-limit and upstream-failure validation.
- Monitoring and independent outage visibility appropriate to the deployment.
- Rollback verification.
- Documentation readback and status synchronization.
- Explicit production approval.
## 19. Immediate Development Priorities
I will continue development in the following order:
## 1. Complete remaining GLAZE UI V1.6 / 1.6.0 repository-local rendered acceptance across the supported Phone, Tablet, Desktop, and Wide Desktop form factors, including accessibility, resilience, representative performance, motion, material/depth, layout/density, and interaction-state behavior.
## 2. Validate the new Repository Attention, CI Health, partial-data, and API-budget surfaces against representative live public and private repositories.
## 3. Preserve the current private no-store cache boundary. Shared caching has been evaluated and deferred until authenticated deployment provides a verified authorization-aware identity partition, explicit freshness semantics, isolation tests, and rollback evidence.
## 4. Prepare deterministic rendered-acceptance evidence for the governing Phone, Tablet, Desktop, and Wide Desktop sizes without claiming visual acceptance until actual rendered evidence is captured.
## 5. Establish the unique canonical dashboard identity through the approved GoreeCloud identity process.
## 6. Prepare the authenticated private deployment only after source, live-data, and visual acceptance are sufficiently mature.
## 7. Add deployment monitoring, rollback verification, and final production-readiness evidence before lifecycle promotion.
## 20. Non-Goals and Boundaries
The dashboard is not a replacement for GitHub, source control, repository-local documentation, GoreeCloud Changelogs, GoreeCloud Manager, or an unrestricted GitHub administration console.
The dashboard must not expose private repository information through a public static bundle. It must not perform repository writes merely because a credential could technically allow them. It must not store active GitHub tokens in Google Drive documentation, source code, browser storage, or other ordinary records.
## 21. Current Decision Summary
I approve continued development of GoreeCloud GitHub Dashboard as a public/open-source, standalone, original GoreeCloud application in GoreeCloud/github-dashboard, with the operational deployment remaining private and authenticated.
The project remains in Forge with deployment state development. Draft PR #1 is the current implementation review surface. Exact-head source validation is green at 483775cc9d135442a7fa20a910999f4fccec63b6 through foundation run #119 / 36340205861; Platform Contract 2.0 run #82 / 36340205883 also passes on the same head. The governance view observes the current fourteen-file application/service repository baseline when an explicit Platform Contract application/service declaration establishes applicability and now also exposes bounded declaration-only manifest fields from the same read. That declaration evidence is not full schema validation or computed conformance. Absent, unreadable, oversized, malformed, unknown, or non-application/service declarations remain unclassified for the application/service baseline channel. The application is not production accepted or deployed.
I will continue improving operational visibility, repository health, CI awareness, rate-limit resilience, Glaze UI quality, accessibility, testing, documentation, and private deployment readiness while preserving GitHub as the authoritative repository platform and keeping the dashboard read-only by default.
Superseding Native-Build and Platform Integration Mandate
This specification is governed by the platform-wide requirement that this application be built natively from the ground up as original GoreeCloud-owned software. Earlier maintained-fork or upstream-product implementation language is transitional only. Narrow critical foundations may be retained only when independently replacing them would materially increase security, cryptographic, protocol, standards, codec, rendering, operating-system, runtime, or interoperability risk; WireGuard and mature cryptographic or encryption primitives are canonical examples. Such exceptions must remain limited to the minimum technical foundation and must not preserve upstream product architecture, UI, branding, workflows, or general application logic.
This application must remain current with the applicable GoreeCloud Platform Contract, current Glaze UI consumer target, and all nine Integral Platform Systems: GoreeCloud Manager, Privacy Shield, Wardveil Security, Everkeep, Glaze UI, GoreeCloud Mesh, GoreeCloud Identity, GoreeCloud Policy, and GoreeCloud Observability. Missing, incomplete, superseded, outdated, unverified, or unaccepted required integration blocks Anchor qualification.

## Migration control

The former Google Drive project specification is a migration source only after this repository copy is verified on the default branch. It must not remain a competing authoritative project specification.
