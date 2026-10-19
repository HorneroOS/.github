# GitHub Projects

Canonical map of the organization's public planning surfaces.
Every issue in every HorneroOS repository belongs to at least the
umbrella Roadmap project; specialized projects carry detail.
Projects are planning surfaces, not sources of truth: status
lives on issues, taxonomy in
[labels.yml](../labels.yml), product truth in the owning repo.

## The five projects

| Project | Scope | Owns detail for |
| --- | --- | --- |
| [1 · HorneroOS Installer](https://github.com/orgs/HorneroOS/projects/1) | Installation outcomes and acceptance; transition to Panda Foss's official installer | installer + blocking cross-repo work |
| [2 · HorneroOS Roadmap](https://github.com/orgs/HorneroOS/projects/2) | Umbrella: **every** organization issue (open and closed), grouped by M0–M5 milestone | cross-repo sequencing against [hornero#154](https://github.com/HorneroOS/hornero/issues/154) |
| [3 · HorneroOS Shell & Desktop](https://github.com/orgs/HorneroOS/projects/3) | Desktop experience | shell, greeter, config issues |
| [4 · HorneroOS Platform & Release](https://github.com/orgs/HorneroOS/projects/4) | Core platform, releases, acceptance | hornero, qa issues |
| [5 · HorneroOS Docs, Web & Governance](https://github.com/orgs/HorneroOS/projects/5) | Handbook, website, org governance | docs, website, .github issues |

The personal `ulises-jeremias/dotfiles` repo is out of scope: it
is not an organization repository.

## Shared conventions (mirroring project 1)

- **Fields**: `Status` (Todo, Ready, In Progress, In Review,
  Blocked, Done), `Horizon` (Now, Next, Later), `Workstream`
  (per-project vocabulary in each project README). Built-in
  Repository, Labels, Milestone, and linked-PR fields stay
  authoritative.
- **Horizon is triage order, not a date**: Now blocks a
  trustworthy product path, Next is the next accepted outcome,
  Later has no immediate dependency. Initial value derives from
  the priority label (high → Now, medium → Next, low → Later).
- **Views**: each project keeps `All items` plus `Roadmap`
  (table; group by Horizon in the UI) and `Execution` (board;
  group by Status in the UI). View grouping is not exposed by
  the GitHub API, so grouping is set once in the UI when a
  project is created — check it after creating a new project.
- **Coverage rule**: a new issue must be added to the Roadmap
  (#2) and its specialized project in the same triage pass.
  Installer-affecting work also goes to project #1. Prefer
  adding the existing issue over creating duplicate cards.
- **No second truths**: do not record acceptance, versions, or
  decisions only on a card. Link the issue/PR that proves them.

## Maintenance

- Maintainers set Status/Horizon during triage; closed issues
  move to Done (built-in workflows may do this automatically
  where enabled).
- When a repository or milestone line is created, extend this
  map and the relevant project README in the same PR.
- Periodically verify coverage: every open issue in the org
  should appear in project #2 and its specialized project
  (closed issues remain in #2 as history).
