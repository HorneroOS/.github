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

## Release cadence

Both the org defaults (issue forms, PR template, label taxonomy, additive
sync) and the Danger PR-governance engine (`governance/danger/`) are
versioned together under `governance-*` tags. Caller repositories upgrade
deliberately by bumping the pinned SHA and `# governance-vN` comment.
