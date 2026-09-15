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

## Cross-repo label sync (thin callers)

The canonical taxonomy is defined once here. Every maintained
repository runs it through a thin caller of the reusable workflow
`.github/workflows/label-sync-reusable.yml`, using its own
`GITHUB_TOKEN` (`issues: write`) — no cross-repo PAT anywhere:

```yaml
name: label-sync

on:
  schedule:
    - cron: '17 3 * * 1'  # weekly convergence; dispatch manually for immediacy
  workflow_dispatch:
    inputs:
      dry-run:
        description: 'Preview without writing'
        required: false
        default: false
        type: boolean

jobs:
  sync:
    # yamllint disable rule:line-length
    uses: HorneroOS/.github/.github/workflows/label-sync-reusable.yml@<full-SHA>  # governance-vX.Y
    # yamllint enable rule:line-length
    with:
      engine-ref: <same-full-SHA>
      dry-run: ${{ inputs.dry-run }}
    permissions:
      contents: read
      issues: write
```

Propagation is pull-based: taxonomy edits converge everywhere within a
week, or immediately via manual dispatch. The installer repository is
excluded (read-only handoff, no caller).

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
