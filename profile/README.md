# HorneroOS

**An Arch-based workstation operating-system family — Desktop · Studio ·
Gaming — with a visual language of its own: Hornero Signal.**

HorneroOS grows from more than eight years of Linux work: the real setup of
[Ulises Jeremias](https://github.com/ulises-jeremias), continuously used,
tested and refined on personal systems before the current AI OS wave. HorneroOS
turns that experience into a reproducible product. Ulises is the project's
principal maintainer. [Panda Foss](https://github.com/PandaFoss) contributes to
HorneroOS and is one of the maintainers of
[Anarchy Linux](https://gitlab.com/anarchyinstaller/installer); both are part of
the [HorneroOS organization](https://github.com/HorneroOS). Read more about the
project's [roots and design history](https://horneroos.com/roots/).

<p align="center">
  <img src="https://www.horneroos.com/captures/cap-theme-05.png" alt="Empty HorneroOS desktop over a Patagonian glacial lake and peaks at sunset, dark Signal bars top and bottom, hornero bird at lower right" width="960">
  <br>
  <sub>Patagonia, a Hornero Original — real capture. Photo credit on
  <a href="https://horneroos.com/themes/">Wallpapers</a>.</sub>
</p>

<p align="center">
  <a href="https://horneroos.com/">Explore HorneroOS</a> ·
  <a href="https://horneroos.com/editions/">Editions</a> ·
  <a href="https://horneroos.com/docs/">Documentation</a> ·
  <a href="https://github.com/HorneroOS/docs/blob/main/development/rfc-0001-hornero-signal.md">Hornero Signal RFC</a> ·
  <a href="https://github.com/HorneroOS/hornero/releases">Releases</a>
</p>

HorneroOS composes the system, the desktop and the everyday tools into one
product. Every edition shares a Wayland-first desktop built around Hornero
Shell; Hyprland is the supported default compositor, and Niri is
experimental.

- **Desktop** — the everyday workstation for development and daily work.
- **Studio** — Desktop plus a creative toolchain: PipeWire with JACK,
  Ardour, Blender, Krita, Kdenlive and OBS Studio.
- **Gaming** — Desktop plus 32-bit Vulkan, GameMode, Gamescope and
  MangoHud.

## Hornero Signal

Hornero Signal is the design language for every first-party surface: shell,
extensions, GTK and Qt apps, terminals, lock screen, login greeter, installer
and website. Its direction is a contemporary engineering workstation from an
alternate 1990s Argentina — broadcast control rooms, oscilloscope bezels,
test cards and technical drawing sheets — executed with modern restraint.

- **Work first.** Quiet, matte chrome. Amber marks what is live or primary;
  celeste marks focus and information.
- **Instrument, not toy.** Hairline rules, small radii, segmented meters,
  tabular numerals in IBM Plex, and Hornero Glyphs for icons.
- **Legible at a glance.** Every theme passes WCAG AA contrast checks, with
  a high-contrast mode and reduced motion built in.
- **Themes own colour.** Signal Night (the default), Signal Day, Signal High
  Contrast and regional Hornero Originals are authored palettes; the
  wallpaper never recolours the interface.

Signal replaces the Material 3 design system the shell inherited. It is
defined in [RFC 0001](https://github.com/HorneroOS/docs/blob/main/development/rfc-0001-hornero-signal.md)
and the [Signal Visual Language](https://github.com/HorneroOS/docs/blob/main/development/signal-visual-language.md),
and tracked in [HorneroOS/.github#28](https://github.com/HorneroOS/.github/issues/28).
Hornero Signal is live on `main` and ships in the `v0.2.0-preview41` Preview
release (including the AUR / Install-on-Arch path); shell surfaces continue to
be refined.

## Where the project stands

HorneroOS is pre-release software. The
[edition catalogue](https://github.com/HorneroOS/hornero/blob/main/editions/catalogue.yaml)
and release notes are the source of truth for maturity; package availability
alone does not mean an edition is supported.

| Product area | Current status |
| --- | --- |
| **HorneroOS Desktop** | Preview. Hyprland is the supported default compositor. |
| **HorneroOS Studio** | Preview. Installable from the Preview ISO; hardware validation is pending. |
| **HorneroOS Gaming** | Preview. Installable from the Preview ISO; hardware validation is pending. |
| **Niri desktop session** | Experimental. Capability and workflow coverage is still evolving. |
| **Server and Agents** | Planned. Not offered as installable editions. |
| **Hornero Signal** | Live on `main` and shipped in `v0.2.0-preview41`; shell surfaces continue to be refined. |
| **Installation & AUR** | `v0.2.0-preview41` is available via the AUR / Install-on-Arch path and signed Preview ISO media (SHA-256 + GPG; VM-tested on UEFI unencrypted). Legacy BIOS, encrypted installs and physical hardware remain under validation. |

See the [release page](https://horneroos.com/releases) and the
[installation status](https://horneroos.com/install) before trying a build.
Back up important data and use disposable hardware or a virtual machine for
preview media.

## Lineage and credits

Hornero Shell began as a Quickshell extraction from the maintainer's
dotfiles, whose runtime derives from
[Caelestia's shell](https://github.com/caelestia-dots/shell) by
[soramane](https://github.com/soramane). Its GPL-3.0 license and attribution
are preserved in the shell's `NOTICE`. The **Hornero Left** and **Hornero
Right** layouts are inspired by Caelestia's layout and say so. HorneroOS has
since replaced the runtime's design system, appearance pipeline and
interfaces with its own. IBM Plex (SIL OFL 1.1) and Tabler Icons (MIT) are
credited where they ship.

## Find your way around

For contribution routing and cross-repository source-of-truth boundaries,
see the [repository map](../governance/docs/repository-map.md).

For product and interface work, start with
[RFC 0001](https://github.com/HorneroOS/docs/blob/main/development/rfc-0001-hornero-signal.md)
and the [design language](https://github.com/HorneroOS/docs/blob/main/development/design-language.md)
in the docs repository (the website copy follows its pinned docs revision),
then check the [edition catalogue](https://horneroos.com/editions/) and the
[compositor capability guide](https://horneroos.com/docs/desktop/compositors/).

| Repository | What it owns |
| --- | --- |
| [hornero](https://github.com/HorneroOS/hornero) | Edition catalogue, package composition, release pins, `horneroctl` and system integration. |
| [shell](https://github.com/HorneroOS/shell) | Hornero Shell: bars, launcher, dashboard, notifications, Control Center, PluginKit and desktop interactions. |
| [config](https://github.com/HorneroOS/config) | Signal token schema and themes, desktop defaults, wallpapers, brand assets and system configuration. |
| [plugins](https://github.com/HorneroOS/plugins) | First-party shell extensions and the curated extension catalogue. |
| [greeter](https://github.com/HorneroOS/greeter) | SDDM login experience and its packaged visual assets. |
| [installer](https://github.com/HorneroOS/installer) | Provisional installation workflow and media; check its README for validation status. |
| [docs](https://github.com/HorneroOS/docs) | User, contributor and architecture documentation, including the design RFCs. |
| [website](https://github.com/HorneroOS/website) | The official product site, captures and documentation experience. |
| [qa](https://github.com/HorneroOS/qa) | Reproducible graphical and system acceptance evidence. |
| [.github](https://github.com/HorneroOS/.github) | Organization profile, contribution guidance and community health files. |

## Start here

- **New to HorneroOS?** Explore [the website](https://horneroos.com/) and
  [Getting Started](https://horneroos.com/docs/).
- **Choosing an edition?** Compare [Desktop, Studio and Gaming](https://horneroos.com/editions/).
- **Looking for themes or layouts?** Visit the [theme gallery](https://horneroos.com/themes/)
  and [layout guide](https://horneroos.com/layouts/). Desktop captures on
  the website predate Hornero Signal and show the previous appearance until
  Signal captures replace them.
- **Planning an installation?** Read the [installation repository](https://github.com/HorneroOS/installer)
  and verify its current maturity before using any media.
- **Following installer readiness?** Use the [public HorneroOS Installer project](https://github.com/orgs/HorneroOS/projects/1)
  for acceptance work and the transition to Panda Foss's custom official installer.
- **Looking for the roadmap?** Every issue lives in the [HorneroOS Roadmap](https://github.com/orgs/HorneroOS/projects/2);
  specialized boards: [Shell & Desktop](https://github.com/orgs/HorneroOS/projects/3),
  [Platform & Release](https://github.com/orgs/HorneroOS/projects/4),
  [Docs, Web & Governance](https://github.com/orgs/HorneroOS/projects/5).
- **Found a bug?** Pick a structured form at [new issue](https://github.com/HorneroOS/hornero/issues/new/choose). **An install problem?** Report it in the installer repo at [new install issue](https://github.com/HorneroOS/installer/issues/new/choose); include the ISO name, your firmware type and the step where it failed.
- **Want to help?** Read the [contribution guide](https://github.com/HorneroOS/.github/blob/main/CONTRIBUTING.md),
  find the owning repository above, then check its open issues and pull requests.

HorneroOS is developed in the open. Contributions, careful bug reports and
thoughtful product feedback are welcome.
