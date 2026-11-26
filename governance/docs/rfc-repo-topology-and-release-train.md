# RFC: Repository Topology & Release-Train Orchestration

- **Status:** Draft
- **Tracking issue:** HorneroOS/.github#37
- **Scope:** Organization repository layout (currently 10 repos) and cross-repo release coordination.

## Context

HorneroOS currently spans 10 repositories under the `HorneroOS` organization:

1. `hornero` (edition catalogue, package composition, release manifests, `horneroctl`)
2. `shell` (Hornero Shell QML/Quickshell runtime)
3. `config` (Hornero Signal tokens, themes, wallpapers, desktop defaults)
4. `plugins` (first-party shell extensions and curated catalogue)
5. `greeter` (SDDM login theme)
6. `installer` (provisional Calamares/Archiso workflow)
7. `qa` (system-level acceptance scenarios and VM evidence)
8. `docs` (canonical handbook and RFCs)
9. `website` (public site and web docs presentation)
10. `.github` (org profile, shared templates, governance automation)

With a small core team (1–2 active maintainers), cutting a coordinated Preview release (e.g. `v0.2.0-preview41`) requires touching multiple repos, bumping pinned SHAs/tags, syncing PKGBUILDs, and verifying cross-repo compatibility. This RFC compares two structural options to reduce coordination overhead without sacrificing ownership clarity.

---

## Option A: Consolidate 10 → 4 Repositories

Group tightly coupled surfaces into four repositories:

| Target Repo | Absorbs | Rationale |
| --- | --- | --- |
| `HorneroOS/hornero` | `hornero`, `config`, `installer`, `qa` | Single source of truth for OS composition, defaults, media, and acceptance tests. |
| `HorneroOS/shell` | `shell`, `plugins`, `greeter` | All graphical desktop surfaces and PluginKit consumers evolve atomically. |
| `HorneroOS/web` (or `website`) | `website`, `docs` | Eliminates docs-pin drift between handbook source and rendered site. |
| `HorneroOS/.github` | `.github` | Required by GitHub for org-wide defaults and profile. |

### Pros
- **Atomic cross-surface PRs:** A Hornero Signal token change, shell consumer update, and extension adjustment land in one PR and one CI run.
- **Zero pin-bump churn** between `config` ↔ `shell` ↔ `plugins` and `docs` ↔ `website`.
- **Simpler contributor onboarding:** Fewer repos to clone, search, and configure locally.
- **Lower CI maintenance:** 4 sets of workflows instead of 10.

### Cons
- **Migration cost:** Preserving git history (`git subtree` / `git filter-repo`), redirecting open issues/PRs, and updating AUR `PKGBUILD` source URLs and external links.
- **Ownership boundary blur:** `installer` has a distinct external maintainer relationship (Panda Foss's custom installer transition) that benefits from a separate repo boundary.
- **Noisier git history & CI triggers:** Path-filtered workflows are required so a docs edit does not trigger ISO or QML builds.

---

## Option B: Keep 10 Repositories + Automated Release-Train Orchestration

Retain the current 10-repo topology and automate cross-repo propagation with a release-train workflow hosted in `HorneroOS/hornero` (or `HorneroOS/.github`):

- **Automated pin-bump PRs:** On tag/release in `config`, `shell`, `plugins`, or `greeter`, a GitHub Actions workflow opens a batched PR against `hornero` updating release manifests and PKGBUILD pins.
- **Docs-to-website sync:** On push to `docs@main`, a workflow dispatches a pin update PR to `website`.
- **Unified release checklist & tagger:** A `release-train.yml` workflow validates that all pinned repos are green, cuts coordinated `vX.Y.Z-previewN` tags, publishes checksums/signatures, and updates the release notes.

### Pros
- **Zero disruptive migration:** No broken URLs, no git history rewrites, no AUR source-URL churn.
- **Clear ownership boundaries:** `installer`, `plugins`, `greeter`, and `qa` remain independently releasable with minimal blast radius.
- **Clean per-repo CI and issue trackers:** Each repo's CI stays fast and focused.

### Cons
- **Ongoing automation maintenance:** Requires maintaining a GitHub App or scoped token for cross-repo PR creation and debugging workflow-dispatch chains.
- **Multi-PR lag:** Breaking contract changes (e.g. Signal token renames or PluginKit API changes) still require sequenced PRs across repos.
- **Higher cognitive load for new contributors:** Still 10 repos to navigate.

---

## Comparison Summary

| Dimension | Option A (10 → 4 Consolidation) | Option B (Release-Train Automation) |
| --- | --- | --- |
| Upfront effort | High (history merge, URL/AUR/issue migration) | Medium (workflow + token setup) |
| Ongoing coordination cost | Low | Low–Medium |
| Atomic cross-surface changes | Yes | No (sequenced PRs) |
| Independent maintainer boundaries | Harder (`installer`, `plugins`) | Natural |
| Reversibility | Hard | Easy |

---

## Recommendation & Next Steps

Adopt **Option B first** as the low-risk, reversible baseline, while keeping a targeted **partial consolidation** (specifically `docs` + `website`, or `config` + `hornero`) on the table if pin-bump friction remains high after two Preview cycles:

1. **Immediate (Next Preview cycle):** Prototype `release-train` pin-bump automation in `HorneroOS/hornero` for `config`, `shell`, `plugins`, and `greeter`, plus `docs` → `website` sync.
2. **Measure:** Track manual steps and wall-clock time to cut `preview42` and `preview43`.
3. **Decide:** If release-train automation brings release overhead under 30 minutes with zero manual pin edits, keep the 10-repo layout. Otherwise, schedule a scoped consolidation of `docs` + `website` first before considering `shell` + `plugins`.
