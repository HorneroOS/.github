# HorneroOS organization profile and community defaults

This repository powers the [HorneroOS organization profile](profile/README.md)
and supplies community-health files to repositories that do not define their
own. The public product is a pre-release, Arch-based operating system family:
its Desktop is Wayland-first, with Hornero Shell at the center of the user
experience. Current maturity lives in the
[edition catalogue](https://github.com/HorneroOS/hornero/blob/main/editions/catalogue.yaml)
and release notes, not in this repository.

## Start with the product

- [Official website](https://horneroos.com/)
- [Visual showroom](https://horneroos.com/showroom/)
- [User and contributor documentation](https://horneroos.com/docs/)
- [Releases and maturity](https://github.com/HorneroOS/hornero/releases)
- [Organization profile](profile/README.md)

## Community files

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — choose the right repository and make
  a focused contribution.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) — expectations for participation.
- [`SECURITY.md`](SECURITY.md) — private vulnerability-reporting guidance.
- [`SUPPORT.md`](SUPPORT.md) — documentation, questions and issue routing.
- [Issue forms](.github/ISSUE_TEMPLATE/) and
  [pull-request template](.github/PULL_REQUEST_TEMPLATE.md) — structured
  reports and review context.

## Governance tooling

The [`governance/`](governance/) directory contains organization-wide labels,
their validation and synchronization, and the rules that keep inherited GitHub
defaults predictable. Read its [overview](governance/README.md) before changing
shared automation.

The files at this repository's root are inherited by organization repositories
only when a repository does not provide its own equivalent. Keep shared
guidance broadly applicable and leave component-specific instructions in the
owning repository.

## License

Community-health files and governance tooling are available under the
[MIT License](LICENSE).
