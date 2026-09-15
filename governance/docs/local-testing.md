# Local testing

Validate the org defaults before pushing.

## YAML parses

```sh
python3 -c "
import glob, yaml
for f in glob.glob('.github/ISSUE_TEMPLATE/*.yml') + ['governance/labels.yml', '.github/workflows/label-sync.yml']:
    yaml.safe_load(open(f))
    print('ok', f)
"
```

## Form labels ⊆ taxonomy

```sh
cd governance/label-sync
npm ci
npm run validate
```

This rebuilds the TypeScript validator (`tsc`, strict) and checks that
every label referenced by the three issue forms exists in
`governance/labels.yml`.

## TypeScript tooling

```sh
cd governance/label-sync
npm ci
npm run check   # strict tsc --noEmit
npm run build   # emit to dist/
```

## Markdown lint (when available)

```sh
markdownlint '**/*.md'
```

Keep lines reasonably short, use fenced code blocks with language tags,
and keep headings ordered.

## Label sync dry run (no writes)

```sh
cd governance/label-sync
GITHUB_TOKEN=<token> GITHUB_REPOSITORY=HorneroOS/.github \
  DRY_RUN=1 npm run sync
```

The real workflow (`.github/workflows/label-sync.yml`) runs the same
commands with `issues: write` permission and no `DRY_RUN`. It is
additive: creates and updates only, never deletes.

## Inheritance-trap check

```sh
ls .github/ISSUE_TEMPLATE  # only HorneroOS/.github should have one
```

No other HorneroOS repository should contain an `ISSUE_TEMPLATE`
directory (see `inheritance-trap.md`).
