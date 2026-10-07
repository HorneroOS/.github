# Contributing to HorneroOS

Thanks for helping build HorneroOS. Contributions are welcome across the
desktop, configuration, documentation, installer and system-composition work.
HorneroOS is pre-release software; check the current product catalogue and
release notes before describing a capability as supported.

## Find the right place

Start with the [official website](https://horneroos.com/) and
[documentation](https://horneroos.com/docs/). Use the
[repository map](governance/docs/repository-map.md) to identify the owner,
source of truth, and cross-repository dependencies before opening work. The
[public Installer Project](https://github.com/orgs/HorneroOS/projects/1) is the
single planning surface for install readiness; it does not replace issues in
their owning repositories.

The short routing table is:

| Work | Repository |
| --- | --- |
| Editions, package composition, release definitions | [hornero](https://github.com/HorneroOS/hornero) |
| Desktop shell, settings, bars and interactions | [shell](https://github.com/HorneroOS/shell) |
| Declarative configuration, themes and wallpapers | [config](https://github.com/HorneroOS/config) |
| Login screen | [greeter](https://github.com/HorneroOS/greeter) |
| Installation workflow | [installer](https://github.com/HorneroOS/installer) |
| User and contributor documentation | [docs](https://github.com/HorneroOS/docs) |
| Official website and showcase | [website](https://github.com/HorneroOS/website) |
| System and graphical acceptance | [qa](https://github.com/HorneroOS/qa) |
| Organization-wide contribution defaults and governance | [.github](https://github.com/HorneroOS/.github) |

Before opening work, search the owning repository's issues and pull requests
for an existing discussion. For a cross-repository change, identify the source
of truth and describe any required coordination in the PR.

## Make a reviewable contribution

1. Branch from the repository's current `main` and target `main`.
2. Keep each PR focused on one user-visible outcome or closely related set of
   changes.
3. Explain the problem, resulting behavior and any meaningful limitation.
4. Run the checks documented by that repository and include the commands and
   results in the PR description.
5. Update user documentation and product data when behavior, maturity,
   installation or compatibility changes.
6. Use screenshots or reproducible QA evidence for visual and interaction
   changes where practical.

Use English for source comments, commits, issues, pull requests and maintained
documentation so contributors can collaborate across language communities.
User-facing product copy may follow the language conventions of its surface.

Do not commit secrets, personal data, machine-specific paths or private user
configuration. Do not claim support from a package list or static check alone;
the product owner and available acceptance evidence determine maturity.

## Pull requests and conduct

Use the repository's pull-request template. Review feedback should address
behavior, evidence, maintainability, accessibility and security. Participation
follows the organization [Code of Conduct](CODE_OF_CONDUCT.md).

For installation and release work, clearly distinguish development builds,
provisional media, previews and supported releases. Never encourage using
unvalidated media on a machine containing important data.
