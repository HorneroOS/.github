# HorneroOS PR-governance Danger engine (TypeScript)

Shared, deterministic Danger engine that enforces the HorneroOS PR contract
across every repository. TypeScript only — strict `tsc`, typed policy schema.
Plain JS is not used anywhere here and would need a concrete justification.

## Layout

```text
governance/danger/
├── src/                 # pure typed policy functions + dangerfile entry
│   ├── types.ts         # Finding / RepoPolicy / PRContext
│   ├── title.ts         # conventional title + merge-commit blocks (fail)
│   ├── sections.ts      # heading-based body sections (warn, never checkboxes)
│   ├── size.ts          # large-PR + docs/trivial changelog exemption
│   ├── bots.ts          # bot authors skip human checklist, keep safety checks
│   ├── drafts.ts        # drafts downgrade hygiene fails to warns
│   ├── visual-evidence.ts
│   ├── personal-paths.ts        # forbidden paths (fail) + risky areas (warn)
│   ├── generated-counterparts.ts# missing derivative (fail)
│   ├── breaking-change.ts       # missing migration notes (warn)
│   ├── linked-issue.ts          # missing issue link (warn)
│   ├── pins.ts                  # floating action pins (fail)
│   ├── policy.ts                # `.github/hornero-governance.yml` schema
│   ├── index.ts                 # evaluatePR orchestrator
│   └── dangerfile.ts            # Danger entry (async-safe, no floating promises)
├── tests/fixtures/      # 12 core scenarios (plus repo-specific ones per repo)
└── hornero-governance.example.yml
```

## Rule severity

- **fail** (deterministic blocks only): bad title, merge commits, forbidden
  paths, missing generated counterpart, unpinned actions.
- **warn** (needs human judgement): missing sections, large PR, visual change
  without evidence, missing docs/issue link, risky area, breaking change
  without migration notes.
- **message**: available commands, VM reminder, docs links.

Bots skip the human checklist but keep every safety check. Drafts reduce
hygiene (fails downgrade to warns) except safety blocks. Fork-safe: callers
trigger on `pull_request` (never `pull_request_target` + checkout + exec),
least-privilege permissions, and the engine never executes PR code.

## Versioning (`governance-*` tags) and upgrade path

1. Engine changes merge to `main` of `HorneroOS/.github`, then a maintainer
   tags the release: `git tag governance-vX.Y.Z && git push origin governance-vX.Y.Z`.
2. The reusable workflow (`.github/workflows/pr-governance.yml`) is consumed
   by call-site workflows pinned to a full commit SHA with a version comment:
   `uses: HorneroOS/.github/.github/workflows/pr-governance.yml@<SHA> # governance-vX.Y.Z`.
   Callers also pass the same SHA as `with: engine-ref: <SHA>` so the
   workflow checks out the versioned engine source next to the caller repo.
   Danger runs with cwd at the caller repo (diff + repo policy come from
   there); the engine checkout is code-only and never executes PR code.
3. To upgrade: bump the SHA + version comment (both `uses:` and
   `engine-ref:`) in the caller, run the caller's CI, and confirm Danger
   posts the expected findings. Never float on a branch.

## Develop

```sh
npm ci          # reproducible install (package-lock.json)
npm run build   # strict tsc
npm test        # build + node --test over tests/fixtures
```

Node is pinned in `.nvmrc`, `engines`, and the reusable workflow input
(`22.22.0`).
