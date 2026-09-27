# GoreeCloud GitHub Dashboard — User Manual

## Status and audience

This manual covers the current Forge/development source for authorized GoreeCloud users and developers. Production deployment is not approved.

## Access

The source repository is public/open source. Any live deployment capable of displaying non-public repository data must be private and authenticated. Never paste a reusable GitHub token into the browser; runtime credentials belong only in server-side secret storage.

## Main dashboard

- **Overview** — portfolio counts and refresh/data status.
- **Recent changes** — bounded commit activity.
- **Top repositories** — operational activity ranking.
- **Repository attention** — explainable review signals.
- **CI health** — best-effort latest workflow state.
- **Coverage detail** — complete/partial/unavailable source coverage.
- **Changelog radar** — detected repository-local changelogs.
- **Latest releases** — latest GitHub Release where available.
- **Open pull requests / issues** — recently updated work.
- **Repository directory** — searchable inventory.

## Refreshing

Use **Refresh** to request current data. Successful refreshes impose a 30-second manual-refresh cooldown; failed refreshes impose a 10-second retry floor. This is API-discipline UI behavior, not authentication or server-side rate limiting.

## Governance view

Open **Governance** to inspect read-only evidence for selected files, application/service documentation, classic branch protection, active rulesets, and required-workflow references. These are observations, not compliance or lifecycle verdicts.

The current peer documentation channel is a historical six-file subset. The current fourteen-file repository baseline is not yet fully observed by this view.

## Appearance

Use the appearance control to cycle `System → Light → Dark → Deep Dark → System`. System follows the operating-system preference; Deep Dark is explicit. The selected appearance may be stored locally in the browser.

## Coverage states

- **Complete** — the represented bounded read completed.
- **Partial** — some bounded reads were unavailable.
- **Unavailable** — the source could not be observed.
- Absence is reported only when a supported probe completed without finding the item.

## Changelogs

The dashboard prefers `CHANGELOGS.md` and falls back to legacy `CHANGELOG.md`, `docs/CHANGELOG.md`, and `changelog.md` paths for interoperability. The linked repository file remains authoritative.

## Troubleshooting

A generic deployment-not-ready response means an operator must verify server-side configuration and the authenticated access boundary. The readiness endpoint intentionally does not reveal which prerequisite is missing.

Do not broaden GitHub token permissions automatically when optional evidence is unavailable. Use the least privilege required by an approved feature.

## Privacy and security

Do not copy private dashboard output into public issues, logs, screenshots, or documentation without explicit approval. See [PRIVACY POLICY.md](PRIVACY%20POLICY.md) and [SECURITY.md](SECURITY.md).
