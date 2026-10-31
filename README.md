# GoreeCloud GitHub Dashboard

An original GoreeCloud project for a single, **privately authenticated, read-only view** of repository activity. The source repository is public; the intended operational dashboard is not a public GitHub activity mirror. **GitHub remains the authoritative source** for commits, pull requests, issues, releases, and workflow state.

> **Current status: development / foundation bootstrap.** The `main` branch contains project documentation and workflow configuration, **not a runnable or deployable dashboard application**. No production deployment is approved.

## Product scope

The planned dashboard brings together a repository directory, recent changes, changelog and release visibility, open work, and repository-health signals. Aggregated or incomplete data must remain clearly identified instead of being presented as an authoritative GitHub state.

These are **product goals**, not a list of features available to run from `main`.

## Where the implementation stands

- The application foundation is being developed separately in [draft PR #1](https://github.com/GoreeCloud/github-dashboard/pull/1). Draft code and its validation do **not** establish an accepted feature on `main`.
- Additional open proposals explore authenticated views and platform integration. They remain unmerged candidates unless independently verified and accepted.
- There is currently no `main`-branch installation command or production endpoint to publish. Do not provision credentials or deploy an unreviewed candidate as though it were released.

## Project documents

| Document | Purpose |
| --- | --- |
| [Project specifications](PROJECT-SPECIFICATIONS.md) | Requirements, architecture, access and acceptance boundaries |
| [Implemented features](IMPLEMENTED-FEATURES.md) | Conservative statement of the verified current repository state |
| [Planned features](PLANNED-FEATURES.md) | Roadmap and outstanding obligations |
| [Project record](PROJECT-RECORD.md) | Development history and source evidence; historical entries are not current approvals |
| [Platform conformance](docs/PLATFORM_CONFORMANCE.md) | Applicable interface and platform-conformance work |

## Access and release boundaries

The intended operational deployment must protect repository access behind authentication, keep credentials out of the client and repository, and distinguish incomplete API responses from healthy states. Source checks, design proposals, and documentation are **not substitutes** for rendered UI acceptance, security review, deployment validation, and explicit release approval.

To contribute, review the current specifications and open PRs first, then propose narrowly scoped changes with verifiable evidence. No application runtime is supplied by the default branch yet.
