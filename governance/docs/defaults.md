# Org defaults

This repository ([`HorneroOS/.github`](https://github.com/HorneroOS/.github))
provides organization-wide defaults that every HorneroOS repository inherits
automatically unless it defines its own file of the same kind.

## What is provided

- **Issue forms** (`.github/ISSUE_TEMPLATE/`): exactly three structured
  forms — `bug-report.yml`, `feature-request.yml`, `documentation.yml` —
  plus `config.yml` with `blank_issues_enabled: false` and contact links to
  Discussions, documentation, the contributing guide, and the security
  policy.
- **Pull request template** (`.github/PULL_REQUEST_TEMPLATE.md`): Summary,
  Type (`feat`/`fix`/`docs`/`refactor`/`chore`), Why, Scope, Validation
  (exact per-repo commands), Evidence, Risks & rollback, Related issues,
  and a small checklist (English, conventional title at most 100
  characters, no secrets, focused PR, docs updated, validation green).
- **Label taxonomy** (`governance/labels.yml`): the canonical `type:*`,
  `area:*`, `status:*`, and `priority:*` labels. Small on purpose.
- **Additive label sync** (`governance/label-sync/` + the `label-sync`
  workflow): creates missing canonical labels and refreshes
  descriptions/colors; never deletes repository-specific labels.

## Conventions

- English everywhere: code, issues, PRs, docs.
- Conventional commits / PR titles (`type: subject`, at most 100
  characters).
- Focused PRs: one concern per PR, small reviewable diffs.
- Merge only green, where ownership permits. (The installer repository is
  read-only for governance rollout: handoff documentation only, no writes.)

## What this half does NOT do

The deterministic Danger PR-governance engine (TypeScript, reusable
`workflow_call`, pinned by SHA) lands as a separate change. This half adds
no merge gates and changes no repository besides `.github` itself.
