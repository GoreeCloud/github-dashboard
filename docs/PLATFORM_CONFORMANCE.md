# Mandatory Native and Platform Conformance

GoreeCloud GitHub Dashboard is original GoreeCloud-owned software. Under the canonical lifecycle it is in **Forge**, with deployment_state development, and remains deliberately **nonconformant**. Anchor eligibility requires substantive, evidence-backed evaluation of exactly nine Integral Platform Systems; labels, badges, manifests, or UI copy do not constitute integration.

## Platform Contract 2.0

The repository declares its machine-readable platform state in root goreecloud.platform.yaml using GoreeCloud Platform Contract 2.0. The migration from historical Contract 0.2 is explicit: the prior seven-system declaration remains historical evidence only, while the current manifest adds GoreeCloud Policy and GoreeCloud Observability, uses the canonical Seed → Lab → Forge → Weave → Seal → Anchor → Sunset → Archive lifecycle, and keeps lifecycle separate from deployment and qualification state.

The exact-head validation workflow pins the reviewed central implementation at GoreeCloud/GoreeCloud revision 32cfe6395f6e4bc4872a99e8d0c666ea0b1ed7b8. It validates the exact pull-request head, computes conformance, validates the result schema, and asserts that Forge remains nonconformant and not Anchor-eligible.

A passing structural manifest or computed Forge result proves only the checks encoded by the validator. It does not establish runtime acceptance, deployment, production approval, platform-system acceptance, Seal qualification, or Anchor eligibility.

## Current conformance state

| Integral Platform System | Current state | Evidence / boundary |
| --- | --- | --- |
| GoreeCloud Manager | Applicable — Blocked | The dashboard is a separate operational product. No accepted Manager capability, inventory, remediation, approval, or operational-visibility contract is consumed or exposed. |
| Privacy Shield | Applicable — Blocked | Private API responses are private, no-store; browser output is normalized and minimized. No accepted Privacy Shield policy/service integration is established. |
| Wardveil Security | Applicable — Blocked | Fail-closed deployment interlock, server-side credential boundaries, security headers, sanitized errors, timeouts, and read-only routes exist. These controls do not establish Wardveil acceptance. |
| Everkeep | Applicable — Blocked | Git preserves source history and deployment/rollback documentation exists. No Everkeep-managed backup/restore or recovery acceptance exists for deployment configuration or operational state. |
| Glaze UI | Applicable — Nonconformant | Source now targets current approved GLAZE UI V1.6 / 1.6.0. Repository-local rendered, accessibility, resilience, form-factor, performance, and production acceptance remains pending; see docs/GLAZE_UI_CONFORMANCE.md. |
| GoreeCloud Mesh | Applicable — Blocked | The dashboard calls GitHub directly from the server-side aggregation boundary. No Mesh registration, capability, dependency, event, or evidence transport is implemented. |
| GoreeCloud Identity | Applicable — Blocked | Production is intended to sit behind authenticated private access, but no GoreeCloud Identity authentication, authorization, session, role, or delegated-authority contract is implemented or accepted. |
| GoreeCloud Policy | Applicable — Blocked | The governance view observes evidence but does not consume an accepted Policy contract, decision/version/freshness record, explanation, or enforcement result. Observation does not become policy authority. |
| GoreeCloud Observability | Applicable — Blocked | Health/readiness and API-budget signals exist, but no accepted Observability signal contract, telemetry pipeline, correlation model, freshness evidence, or operational-evidence integration is established. |

## Continuity boundary

The dashboard owns no durable user repository dataset; GitHub remains authoritative for repository data. Anchor acceptance still requires recoverable deployment/configuration state, validated clean reconstruction and rollback, and Everkeep-compatible recovery evidence where applicable. Secrets remain outside source control and require separately governed secure recovery.

## Lifecycle boundary

Forge is the evidence-backed current state because the application has a committed implementation but still has substantial integration, migration, and acceptance work before Weave. Weave must be entered only when integration, convergence, hardening, migration, and release-completeness work demonstrably dominate. Seal requires an exact frozen candidate identity. Anchor requires passing qualification, current platform evidence, and release evidence.

## Native application boundary

Small technically necessary foundational dependencies may be used when independent reimplementation would reduce correctness, security, standards compliance, interoperability, or maintainability. They must not become the product shell or define GoreeCloud GitHub Dashboard identity.
