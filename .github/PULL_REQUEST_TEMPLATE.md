# Pull request

Use a [conventional](https://www.conventionalcommits.org/) title
(`type: subject`, at most 100 characters), for example
`feat: add audio-output quick toggle`. Keep the PR focused: one concern
per PR, small reviewable diffs.

Fill in every section. Where a section genuinely does not apply, write
`N/A — <reason>` (or `None — <reason>`) instead of deleting it; the
governance checks look for these headings. Extension work follows the
HorneroOS/qa Premium Acceptance Matrix (HorneroOS/qa#81).

## Summary

<!-- One or two sentences: what does this change do? -->

## Type

<!-- One of: feat, fix, docs, refactor, chore. -->

## Why

<!-- Why is this needed? Link the motivating issue or discussion. -->

## Linked owning issue

<!-- The issue that owns this work, e.g. `Closes #<id>` or a full
cross-repository link such as `Closes HorneroOS/plugins#<id>`. Every
non-trivial PR must link its owning issue here. -->

## Duplicate-scope check

<!-- What did you search (issues, PRs, existing extensions/code) to
confirm this does not duplicate existing scope? Name the closest match
and how this PR differs, or state that no close match exists. -->

## Scope

<!-- What is in and out of scope? Note any follow-ups. -->

## Declared capabilities

<!-- Every capability or permission this change declares, adds, or uses
(network, filesystem, settings, session services, manifest entries).
`None` only when the change declares and uses no capabilities. -->

## Validation

<!-- How did you verify it? List the exact per-repo commands you ran,
e.g. `npm test`, `npm run lint`, `pytest -q`, and their results. -->

- [ ] Command: result:

## QA status

<!-- Exact QA status, split in two. `Ran:` lists only checks that
actually ran, with results (include Premium Acceptance Matrix scenarios
for extension work). `Pending:` lists everything not yet run. Never
record a check that did not run as passed. -->

Ran:
Pending:

## Evidence

<!-- Paste test/check output, screenshots, or links. UI changes require
screenshots of every affected surface (before/after where behavior or
layout changed), or `N/A — no UI change`. -->

## Tooltip & accessibility

<!-- Tooltip text and placement, accessible names, keyboard-only
operation, focus behavior, and reduced-motion handling, with evidence.
`N/A — <reason>` only when there is no interactive UI. -->

## Translation impact

<!-- New or changed user-visible strings and how they are exposed for
translation. `N/A — <reason>` when no user-visible strings change. -->

## Security notes

<!-- Privileges, network or file access, data retention, and secret
handling touched by this change. `None — <reason>` when there is no
security-relevant surface. -->

## Performance impact

<!-- Startup, CPU, and memory cost, including always-on cost while the
feature or extension is enabled. `N/A — <reason>` only when nothing
runs at runtime. -->

## Risks & rollback

<!-- What could break? How do we revert or roll forward? `None` is fine
when there is genuinely no risk. -->

## Related issues

<!-- Closes #<id>, Relates to #<id>, or `None`. -->

## Checklist

- [ ] Title is conventional (`type: subject`) and at most 100 characters.
- [ ] One concern per PR; diff is small and reviewable.
- [ ] Written in English.
- [ ] Owning issue linked above; duplicate-scope check completed.
- [ ] Declared capabilities listed, or explicitly `None`.
- [ ] Tests added or updated, and Validation above ran green (or N/A with a reason).
- [ ] QA status lists only checks that actually ran as ran; the rest are pending.
- [ ] Screenshots attached for UI changes, or `N/A — no UI change`.
- [ ] Tooltip/accessibility evidence included, or N/A with a reason.
- [ ] Translation impact stated, or N/A with a reason.
- [ ] Security notes and performance impact stated, or N/A/None with a reason.
- [ ] No secrets, credentials, or personal data committed.
- [ ] Documentation updated, or explicitly not needed.
