# Mandatory Native and Platform Conformance

GoreeCloud GitHub Dashboard is original GoreeCloud-owned software. Under the canonical lifecycle it is in **Forge**, with deployment_state development, and remains deliberately **nonconformant**. Anchor eligibility requires substantive, evidence-backed evaluation of exactly nine Integral Platform Systems; labels, badges, manifests, or UI copy do not constitute integration.

## Platform Contract 2.1 — versioned GC UI successor

This development candidate opts in to the separate GC UI successor Contract 2.1 from [GoreeCloud/GoreeCloud](https://github.com/GoreeCloud/GoreeCloud). The exact-head evaluation workflow pins reviewed upstream revision `1499491159250d5f15dad4e2835fbeee2fda9ce9`, preserving independent source/evaluator provenance. Nine systems remain required, Forge remains nonconformant, and Anchor remains unqualified.

**Current CI blocker (October 31, 2026):** The named Platform Contract 2.1 reusable workflow at the pinned GoreeCloud/GoreeCloud revision cannot currently be fetched from GitHub. The current upstream default branch does not contain that validator. The Platform Contract check fails before any validation jobs run; earlier passing checks do not validate the present candidate. See [issue #13](https://github.com/GoreeCloud/github-dashboard/issues/13). Do not remove this mandatory gate, present the foundation test workflow as an equivalent contract check, or advance release qualification until an authoritative, independently reviewed validator is restored and exact-head validation passes.

The GC UI version target is the *scoped* `foundations-v1.0.1` semantic token and browser theme release. This declaration is not complete component, accessibility, authenticated-runtime or production acceptance. Historic Contract 2.0 results are separate evidence, not current design authority.

## Five-MIPS Anchor gate versus historical nine-field declaration

The founder's current [Mandatory Integrated Platform Systems requirement](https://drive.google.com/file/d/1mzBTnWag2ca8wsRg9uHl4IXOkjkoTT9o/view?usp=drivesdk), updated October 25, 2026, defines **five** MIPS for Anchor eligibility: GoreeCloud UI, GoreeShield, Wardveil, GoreeCloud Identity, and GoreeCloud Mesh. Each must have a verified integration or a defensible documented non-applicability finding before Anchor.

The historical `goreecloud.platform.yaml` Contract 2.1 candidate declares **nine** `platform_systems` fields from the earlier platform model. The nine-field declaration is retained as historical development-source evidence pending a separately reviewed schema and compatibility decision. Do **not** mistake a nine-field declaration test or a hypothetical restored legacy evaluator for verification of the current five-MIPS Anchor gate. In particular, `privacy_shield` cannot silently be renamed or asserted to satisfy GoreeShield without verified mapping and integration evidence.

**Required reconciliation:** establish a founder-aligned, versioned contract schema and validator for the current five MIPS without erasing unrelated platform-system evidence; document any retained additional contracts separately; test the actual app integrations and release gate. Until then, this candidate stays Forge/nonconformant. Track under [issue #13](https://github.com/GoreeCloud/github-dashboard/issues/13).

## Current conformance state

| Integral Platform System | Current state | Evidence / boundary |
| --- | --- | --- |
| GoreeCloud Manager | Applicable — Blocked | The dashboard is a separate operational product. No accepted Manager capability, inventory, remediation, approval, or operational-visibility contract is consumed or exposed. |
| Privacy Shield | Applicable — Blocked | Private API responses are private, no-store; browser output is normalized and minimized. No accepted Privacy Shield policy/service integration is established. |
| Wardveil Security | Applicable — Blocked | Fail-closed deployment interlock, server-side credential boundaries, security headers, sanitized errors, timeouts, and read-only routes exist. These controls do not establish Wardveil acceptance. |
| Everkeep | Applicable — Blocked | Git preserves source history and deployment/rollback documentation exists. No Everkeep-managed backup/restore or recovery acceptance exists for deployment configuration or operational state. |
| GoreeCloud UI | Applicable — Nonconformant | GC UI Foundations tokens and a native web consumer shell are implemented in the development branch. Full component and assistive-technology acceptance, authenticated runtime and production verification remain pending; see docs/GC_UI_MIGRATION.md. |
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
