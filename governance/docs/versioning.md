# Versioning

Governance automation is versioned so repositories opt into upgrades
deliberately instead of absorbing breaking changes silently.

## Tags

- Governance releases use `governance-*` tags (for example
  `governance-v1`, `governance-v2`) on the repository that hosts the
  reusable workflow.
- Tags are cut from `main` after the defaults half and the Danger-engine
  half have both landed and been validated.

## Consuming a release

Thin caller workflows in each repository reference the reusable workflow
pinned to a full commit SHA with a version comment, for example:

```yaml
uses: HorneroOS/.github/.github/workflows/pr-governance.yml@<full-SHA> # governance-v1
```

- Pin the SHA (immutable), not the moving tag.
- Keep the `# governance-vN` comment so the intended version is visible.
- Bump by updating the SHA + comment in a focused PR.

## This change (org-defaults half)

This half ships the issue forms, PR template, label taxonomy, additive
sync, and docs. It intentionally does NOT include the Danger
PR-governance engine or the reusable `workflow_call`:

- Do not merge-gate on checks that do not exist yet.
- The Danger engine (TypeScript, strict `tsc`, typed policy schema) lands
  separately and will be versioned with the first `governance-*` tag.
