# `@horneroos/label-sync`

Additive organization label tooling (TypeScript, strict `tsc`, typed
schemas). It owns two jobs:

- `npm run validate` — checks that every label referenced by the
  org-default issue forms exists in `governance/labels.yml`.
- `npm run sync` — creates missing canonical labels in a target
  repository and refreshes descriptions/colors. It **never deletes**
  labels, so repository-specific labels are preserved.

## Requirements

- Node.js >= 22 (pinned in CI; see the label-sync workflow).
- `npm ci` from this directory (installs from `package-lock.json`).

## Validate (no credentials needed)

```sh
cd governance/label-sync
npm ci
npm run validate
```

## Sync (additive)

```sh
GITHUB_TOKEN=<token with issues:write> \
GITHUB_REPOSITORY=HorneroOS/<repo> \
LABELS_FILE=../labels.yml \
npm run sync
```

Set `DRY_RUN=1` to print the planned creates/updates without writing.

## Why TypeScript?

All new governance tooling is TypeScript under strict `tsc` with typed
schemas (`src/schema.ts`) so taxonomy drift fails fast at build or
validation time instead of silently shipping bad labels.
