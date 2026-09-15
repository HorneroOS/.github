# Governance

Organization defaults for HorneroOS repositories, owned by the
[`.github`](https://github.com/HorneroOS/.github) repository.

## Layout

- [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE/) — the only three
  org-default issue forms (bug, feature, docs) plus `config.yml`.
- [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md) —
  the default PR template.
- [`labels.yml`](labels.yml) — the canonical label taxonomy. Issue forms
  may reference only labels listed here.
- [`label-sync/`](label-sync/) — additive label-sync tooling (TypeScript,
  strict `tsc`, typed schemas) plus the form-label validator.
- [`docs/`](docs/) — how the defaults work and how to use them.

## Rules

1. Only three issue forms exist: bug, feature, docs. No skill, agent, or
   loop domain forms.
2. Forms reference only canonical labels from `labels.yml`.
3. Label sync is additive — it never deletes repository-specific labels.
4. All new governance tooling is TypeScript (strict `tsc`, typed schemas).
5. The Danger PR-governance engine lands separately; this half does not
   merge-gate anything. See [`docs/versioning.md`](docs/versioning.md).

Start with [`docs/defaults.md`](docs/defaults.md), then read
[`docs/inheritance-trap.md`](docs/inheritance-trap.md) before touching any
repository's `.github` directory.
