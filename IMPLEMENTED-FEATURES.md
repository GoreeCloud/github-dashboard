# Implemented Features

These entries record source capabilities implemented in the authoritative repository state. Implementation does not by itself establish deployment, production, platform-system acceptance, Seal qualification, or Anchor lifecycle status.

| ID | Capability | Current source state |
| --- | --- | --- |
| IF-001 | Repository portfolio aggregation | Bounded GitHub repository enumeration and normalized dashboard-safe repository objects. |
| IF-002 | Recent changes | Bounded recent commit aggregation across active repositories. |
| IF-003 | Operational ranking | Deterministic Top 10 ranking based primarily on current operational activity. |
| IF-004 | Portfolio summary | Total/public/private counts and aggregate open-work visibility. |
| IF-005 | Repository directory | Searchable inventory with visibility, language, activity, and open-work context. |
| IF-006 | Open work | Recently updated open pull-request and issue summaries. |
| IF-007 | Changelog radar | `CHANGELOGS.md` is preferred; legacy changelog paths remain supported for interoperability. |
| IF-008 | Release radar | Best-effort latest GitHub Release discovery. |
| IF-009 | CI health | Best-effort latest GitHub Actions state with fail-soft permission/error handling. |
| IF-010 | Repository Attention | Explainable signals for CI failure, staleness, large open-work counts, changelog state, and unavailable evidence. |
| IF-011 | Coverage integrity | Explicit checked/unavailable metadata and Coverage Detail. |
| IF-012 | API discipline | Bounded pagination/fan-out, API-budget visibility where available, and bounded request timeouts. |
| IF-013 | Refresh discipline | 30-second successful-refresh cooldown and 10-second failed-refresh retry floor. |
| IF-014 | Health/readiness | Safe liveness and fail-closed configuration readiness endpoints. |
| IF-015 | Governance observation | Selected file evidence, classic protection, active rulesets, and bounded required-workflow references. |
| IF-016 | Applicability evidence | Conservative application/service classification from bounded Platform Contract declarations. |
| IF-017 | Appearance | Shared System / Light / Dark / Deep Dark controller. |
| IF-018 | Glaze source target | GLAZE UI V1.6 / 1.6.0 source target with acceptance pending. |
| IF-019 | Public-source safety | Secret/private-artifact detection and public-source/private-deployment boundary validation. |
| IF-020 | Private API boundary | Server-side credentials, read-only routes, security headers, sanitized errors, and private/no-store responses. |
| IF-021 | Platform declaration | Platform Contract 2.0 manifest covering all nine Integral Platform Systems in nonconformant Forge state. |
| IF-022 | Automated validation | Unit, fixture, contract, governance, appearance, source-policy, repository-policy, and exact-head Platform Contract checks. |

See [PLANNED-FEATURES.md](PLANNED-FEATURES.md) for incomplete and acceptance-gated work and [CHANGELOGS.md](CHANGELOGS.md) for chronology.
