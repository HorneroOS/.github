# HorneroOS repository map and Installer project guide

This page explains where product truth and implementation live across the
[HorneroOS organization](https://github.com/HorneroOS). It is intended as a
shared orientation for maintainers and contributors, including the people
leading installer work. Repository maintainers own changes in their repository;
this map clarifies boundaries and cross-repository dependencies.

## The product in one view

```text
HorneroOS/hornero  defines editions, capabilities, package composition, and releases
        │
        ├── HorneroOS/config   provides portable system and desktop defaults
        ├── HorneroOS/shell    provides the Wayland-first Hornero desktop shell
        ├── HorneroOS/greeter  provides the SDDM login experience
        └── HorneroOS/installer consumes product composition for installation
                    │
                    └── HorneroOS/qa validates integrated system outcomes

HorneroOS/docs     owns the canonical handbook
HorneroOS/website  presents the product, showcase, and web documentation experience
HorneroOS/.github  owns organization-wide contribution and governance defaults
```

The diagram describes responsibility, not a build sequence. Each repository's
README and CI remain authoritative for its implementation and checks.

## Repository ownership

| Repository | Owns | Does not own |
| --- | --- | --- |
| [`hornero`](https://github.com/HorneroOS/hornero) | Product composition: the edition catalogue, compositor choices and maturity, package sets, release manifests, `horneroctl`, and integration contracts. `editions/catalogue.yaml` is the source of truth consumed by installation and QA. | The Shell's UI, reusable desktop configuration, SDDM theme implementation, or installer UI. |
| [`config`](https://github.com/HorneroOS/config) | Portable, declarative desktop/system defaults, appearances and wallpaper catalogues, and the materialization tooling for those defaults. | A person's machine-specific dotfiles, Shell UI, or edition/release composition. |
| [`shell`](https://github.com/HorneroOS/shell) | Hornero Shell runtime and interactions: bars, Launcher, Dashboard, Control Center, notifications, lock surfaces, theme/wallpaper presentation, and Shell-owned assets and integrations. | Edition/package truth, compositor-wide configuration, or OS management commands; it consumes contracts and defaults owned elsewhere. |
| [`greeter`](https://github.com/HorneroOS/greeter) | Hornero's SDDM login theme, its runtime assets, media packs, and packaging. | The desktop session, Shell, or edition catalogue. |
| [`installer`](https://github.com/HorneroOS/installer) | The current provisional Calamares install workflow and the provisional Archiso bootable medium. It consumes a pinned Hornero catalogue rather than maintaining its own edition list. | The canonical product catalogue, system defaults, or the official custom-installer design owned by Panda Foss. |
| [`qa`](https://github.com/HorneroOS/qa) | System-level acceptance scenarios, disposable-environment orchestration, and reproducible evidence for integrated Hornero states. | Unit/component tests owned by each code repository or product behavior itself. |
| [`docs`](https://github.com/HorneroOS/docs) | The canonical user, contributor, troubleshooting, and architecture handbook. The website imports reviewed documentation content from here. | Product implementation or a second copy of package/catalogue truth. |
| [`website`](https://github.com/HorneroOS/website) | The official public site, visual showcase, product storytelling, and web presentation/search/navigation for documentation. | The canonical handbook content or implementation contracts. |
| [`.github`](https://github.com/HorneroOS/.github) | Organization profile, shared community-health files, issue/PR intake, canonical label definitions, and governance automation/documentation. | Product code, edition composition, installer architecture, or the Installer roadmap itself. |

Use the detailed source in the owning repository when a short description in
this map and implementation appear to differ. For current maturity, read the
catalogue and release state in `hornero`; for current installation readiness,
read the Installer Project and provisional installer documentation.

## Installer ownership and the public Project

The single public cross-repository planning surface is the
[HorneroOS Installer Project](https://github.com/orgs/HorneroOS/projects/1).
It tracks outcomes required for a trustworthy HorneroOS installation and the
transition from the provisional installer to the official path. It is not a
new source-code repository or a second product catalogue.

[Panda Foss](https://github.com/PandaFoss) owns the design and implementation
of the custom official installer. The Calamares implementation and Archiso
profile in
[`HorneroOS/installer`](https://github.com/HorneroOS/installer) are provisional
bridge work. The Project records product outcomes, dependencies, and acceptance
evidence; it does not prescribe Panda's implementation. Its README is the live
source for the current validation boundary. The public source location for the
custom installer is linked there when its owner chooses that integration point.

The Project stays intentionally small:

- GitHub's default **All items** view remains available alongside the two
  curated views below.
- **Roadmap** groups open work by Horizon: **Now** blocks a trustworthy install
  path, **Next** is the next acceptance outcome, and **Later** is planned work
  without an immediate dependency. These are ordering buckets, not dates.
- **Execution** shows open issues and pull requests by **Status**. The status
  options are Todo, Ready, In Progress, In Review, Blocked, and Done; closed
  issues and merged pull requests leave the open-item view.
- **Workstream** describes the installation concern: Install flow & recovery,
  Boot & storage, Release & supply chain, or Official installer transition.
  GitHub's built-in Repository, Labels, Assignees, Milestone, and linked pull
  requests remain the authoritative issue metadata.
- GitHub automatically adds new open issues from `HorneroOS/installer` and
  applies the Project's normal initial/completion status workflows. Relevant
  issues in other repositories are added explicitly; their code and issue stay
  with their owning repository.

Add an existing cross-repository issue when it materially blocks or enables an
installer milestone. Link related issues and pull requests rather than making
duplicate cards or moving work into `installer`. Keep completed history in the
owning repository; the Project is for current planning and meaningful
milestones, not a dump of merged work.

## How to coordinate a cross-repository change

1. Identify the behavior and the repository that owns its source of truth.
2. Make the implementation and tests in that repository; involve other owners
   only where their contracts or behavior change.
3. Link dependent issues and pull requests. Add an existing issue to the
   Installer Project only when it affects installation readiness.
4. Update `hornero` product data when an edition, package composition, or
   maturity changes. Update `qa` evidence when an acceptance claim changes,
   `docs` when user guidance changes, and `website` when public presentation
   needs to reflect that truth.
5. Keep organization-wide forms, labels, and contribution rules here in
   `.github`. Do not add a repository-local `ISSUE_TEMPLATE` directory to
   override the shared forms; see the [inheritance rule](inheritance-trap.md).

For the contribution sequence, branch/PR conventions, and review expectations,
see [CONTRIBUTING.md](../../CONTRIBUTING.md). For the live installer state and
acceptance criteria, use the [Project](https://github.com/orgs/HorneroOS/projects/1).
