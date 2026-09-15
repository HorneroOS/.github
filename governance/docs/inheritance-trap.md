# Inheritance trap: never add a local `ISSUE_TEMPLATE` directory

GitHub's inheritance rule for issue templates is all-or-nothing: if a
repository contains **any** local `ISSUE_TEMPLATE` directory (for example
`.github/ISSUE_TEMPLATE/` or `docs/ISSUE_TEMPLATE/`), **all** org-default
forms are replaced — the repository gets only its local files.

## Consequences

- Do NOT create a local `ISSUE_TEMPLATE` directory to "add one more form"
  or "tweak one field". Doing so silently drops the org-default bug,
  feature, and docs forms for that repository.
- The same applies to `config.yml`: a local one replaces the org-default
  contact links and the `blank_issues_enabled: false` setting.
- There are no local `ISSUE_TEMPLATE` directories anywhere in HorneroOS
  repositories. Keep it that way.

## How to extend without breaking inheritance

- Need a repo-specific section in issues? Put it in the PR template's
  Scope/Validation sections, the repository README, or CONTRIBUTING —
  not in a new issue form.
- Need repo-specific labels? Keep them: label sync is additive and never
  deletes them. Just do not reference non-canonical labels from shared
  forms (validation fails the PR).
- Need repo-specific automation? Add a thin caller workflow in that
  repository that pins the versioned reusable workflow by SHA — never copy
  the engine.

## Checking for the trap

```sh
# From the org root of clones, or per repository:
ls .github/ISSUE_TEMPLATE docs/ISSUE_TEMPLATE ISSUE_TEMPLATE 2>/dev/null
```

Any output in a repository other than `HorneroOS/.github` itself means the
trap has sprung: remove the local directory so the org defaults apply
again.
