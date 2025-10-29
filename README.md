<div align="center">

<br/>

<img height="120" alt="Application Icon" src="src/renderer/public/LynxHub.png">

# LynxHub

### Cross-platform, extensible terminal/browser for AI management

[![GitHub Release][github-release-shield]](https://github.com/KindaBrazy/LynxHub/releases)
[![GitHub Release Date][github-release-date-shield]](https://github.com/KindaBrazy/LynxHub/releases)
[![GitHub Downloads (all assets, all releases)][github-downloads-shield]](https://github.com/KindaBrazy/LynxHub/releases)

![LynxHub Dashboard](/readme/lynxhub_screenshot.png)

#### Open-source, cross-platform terminal and browser, designed for managing AI. Highly modular and extensible, it's the all-in-one environment for AI power users.

</div>

## 📦 Installation

1. **Install Prerequisites**

   [Git](https://git-scm.com/downloads) | [Powershell 7+ (Windows Only)](https://github.com/PowerShell/PowerShell/releases/latest)

2. **Download LynxHub**

   | Channel      | Version                                                             | Date       |
   |--------------|---------------------------------------------------------------------|------------|
   | Insider      | [**V3.3.0**](https://www.patreon.com/collection/1557749)            | 2025-10-24 |
   | Early Access | [**V3.3.0**](https://www.patreon.com/collection/714004)             | 2025-10-24 |
   | Public       | [**V3.2.0**](https://github.com/KindaBrazy/LynxHub/releases/latest) | 2025-09-29 |


3. **Install and Launch the Application**

> [!NOTE]
> **macOS Beta Release**
>
> The macOS version is currently in **beta**. I have limited access to physical macOS hardware for thorough testing, so
> issues are possible. Your feedback would be really helpful.

## 🗂️ Table of Contents

- ✨ [Feature Overview](#-feature-overview)
- 🧩 [Extensions](#-extensions)
- 📃 [Modules](#-extensions)
- 🔧 [Development](#-development)
- 🤝 [Contributing](#-contributing)
- ❤️‍🔥 [Support](#%EF%B8%8F-support)

## ✨ Feature Overview

Discover the core features that make LynxHub a powerful tool for your AI workflow:

> [!IMPORTANT]
> **LynxHub: Not a One-Click Installer**
>
> LynxHub is designed to be a comprehensive manager and helper with a user-friendly and flexible environment. It is
> **not** a one-click installer.
>
> While LynxHub offers installation support in most cases, it's best if you have prior knowledge of installing your
> preferred AI interface on your device. You can then integrate it with LynxHub. Alternatively, if you are already using
> an AI interface, you can simply locate and connect it.

🧩 **Extensible & Modular:** Build and expand LynxHub to fit your needs.

- **[Extensible Architecture:](https://github.com/KindaBrazy/LynxHub-Extension-Guide)** Add to LynxHub's core
  functionality.
- **[Modular Design:](https://github.com/KindaBrazy/LynxHub-Module-Guide)** Developers can create and share modules that
  add new AI WebUIs, complete with pre-set arguments, extensions, commands, etc.

🚀 **Manage Your AI Interfaces:** Handle your AI WebUIs easily from one place.

- **Install, Locate & Configure:** Set up new AI interfaces with options for specific branches, clone depth, and quick
  updates.
- **Advanced Git Control:** Switch branches, reset your repository, unshallow, view commit details, and stash changes
  directly from the interface card.
- **Extension Management:** Find, install, enable/disable, and batch-update AI extensions. Set auto-update preferences
  and update check frequency.

🔧 **Full Customization & Control:** Shape your AI environment to your exact needs.

- **Argument Manager:** Visually add, edit, and organize arguments (dropdowns, checkboxes, text, file/folder paths).
  Search and save presets for quick setup.
- **Custom Run Commands:** Define exactly how your AI interfaces launch.
- **Pre-Launch Automation:** Run terminal commands or open files/folders automatically before an AI interface starts.

🌐 **Integrated Workspace:** Work smarter with built-in tools.

- **Tabs for Multitasking:** Open multiple AI instances, terminals, or browsers at the same time, each in its own tab.
- **Built-in Terminal & Browser:** Switch quickly between terminal, browsing, and managing your AI. You can also open
  standalone terminal or browser windows.
- **Smart Detection:** Automatically finds and launches WebUIs URLs.
- **Markdown Viewer:** Read documentation and notes directly inside LynxHub.

💻 **Cross-Platform & Portable**

- Available for **X64**, **ARM64** (Windows, Linux, macOS) and as a **Portable** (Windows & Linux) letting you use
  LynxHub where you need it.

> [!TIP]
> 💡 **Get early access to LynxHub** features, extensions, and modules. Support development and unlock exclusive
> benefits by joining **[❤️‍🔥Patreon](#%EF%B8%8F-support)**.

## 🧩 Extensions

[**Python Toolkit**](https://github.com/KindaBrazy/LynxHub-Python-Toolkit): A powerful extension to streamline Python
environment, virtual environment, and package management .

[**Hardware Monitor**](https://github.com/KindaBrazy/LynxHub-Hardware-Monitor): A configurable extension for real-time
monitoring of CPU, GPU, and Memory usage, displayed conveniently in the status bar .

[**Custom Actions**](https://github.com/KindaBrazy/LynxHub-Custom-Actions): Create, customize, and manage custom cards
with powerful actions for personalized workflow shortcuts .

## 📃 Modules

### [WebUI Container Module](https://github.com/KindaBrazy/LynxHub-Module-Offline-Container)

## 🔧 Development

**Requirements**

- [Node.js LTS](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads)

**Quick Start**

```bash
git clone https://github.com/KindaBrazy/LynxHub && cd LynxHub
```

```bash
npm i --legacy-peer-deps && npm run dev
```

- **Hot Reload**: Auto-refresh on changes
- **Hotkeys**: `F12` (DevTools), `Ctrl+R` (Refresh)

**Build**

```bash
npm run build
```

Native modules compile automatically during installation.

## 🤝 Contributing

As a solo maintainer, I welcome and value all contributions to this project. Your participation helps improve the
application for everyone. I accept various contribution types:

**Core Contribution Areas**

- **Code Contributions**: Solve existing issues or propose new features via pull requests
- **Extension/Module Development**: Build custom extensions or modules to expand functionality
- **Feature Proposals**: Submit enhancement suggestions through issues tagged "enhancement"

All contributions help sustain this project. Thank you for supporting its growth.

## ❤️‍🔥 Support

Sustainable development relies on community backing. Consider supporting through Patreon to access exclusive benefits:

**[Join LynxHub Patreon for Exclusive Benefits!](https://www.patreon.com/LynxHub)**

[![Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3DLynxHub%26type%3Dpatrons&style=for-the-badge)](https://www.patreon.com/LynxHub)

**What's Included Across Tiers:**

Here's a breakdown of the benefits you can receive as a LynxHub Patreon supporter:

- 🏷️ **Discord Role:** Get an exclusive Discord role.
- 🚀 **Early Access to Updates:** Be among the first to receive updates for LynxHub Core, extensions, and modules.
- 🛠️ **Insider Builds:** Immediate access to every new feature and fix for LynxHub Core, extensions, and modules.
- 🎬 **Behind-the-Scenes Insights:** Get my plans for new LynxHub releases, what's next, and what's implemented.
- ⭐ **Name in GitHub README:** Your name will be featured in the GitHub README Credit section.
- 🌟 **Name in LynxHub Application Credits:** See your name in the LynxHub application credits.
- 🔧 **Priority Support:** Receive faster responses to your questions and issues for a smooth experience.

For one-time donations: [Patreon Shop](https://www.Patreon.com/LynxHub/Shop)

Every contribution directly supports ongoing development and future improvements.

---

<div align="center">

[![X](https://img.shields.io/badge/X-%23000000.svg?style=for-the-badge&logo=X&logoColor=white)](https://x.com/LynxHubAI)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white)](https://www.youtube.com/@LynxHubAI)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/LynxHubAI)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kindofbrazy@gmail.com)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/LynxHub)

[![LynxHub Discord](http://invidget.switchblade.xyz/e8rBzhtcnK)](https://discord.gg/e8rBzhtcnK)

</div>

---

<br/>

© 2025 LynxHub.

[github-release-shield]: https://img.shields.io/github/v/release/KindaBrazy/LynxHub?include_prereleases&style=flat&labelColor=%23212121&color=%2300A9FF&label=Version&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNCAyMmgtNGMtMy43NzEgMC01LjY1NyAwLTYuODI4LTEuMTcyQzIgMTkuNjU3IDIgMTcuNzcxIDIgMTR2LTRjMC0zLjc3MSAwLTUuNjU3IDEuMTcyLTYuODI4QzQuMzQzIDIgNi4yMzkgMiAxMC4wMyAyYy42MDYgMCAxLjA5MSAwIDEuNS4wMTdjLS4wMTMuMDgtLjAyLjE2MS0uMDIuMjQ0bC0uMDEgMi44MzRjMCAxLjA5NyAwIDIuMDY3LjEwNSAyLjg0OGMuMTE0Ljg0Ny4zNzUgMS42OTQgMS4wNjcgMi4zODZjLjY5LjY5IDEuNTM4Ljk1MiAyLjM4NSAxLjA2NmMuNzgxLjEwNSAxLjc1MS4xMDUgMi44NDguMTA1aDQuMDUyYy4wNDMuNTM0LjA0MyAxLjE5LjA0MyAyLjA2M1YxNGMwIDMuNzcxIDAgNS42NTctMS4xNzIgNi44MjhDMTkuNjU3IDIyIDE3Ljc3MSAyMiAxNCAyMiIgY2xpcC1ydWxlPSJldmVub2RkIiBvcGFjaXR5PSIwLjUiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEwLjU2IDE1LjQ5OGEuNzUuNzUgMCAxIDAtMS4xMi0uOTk2bC0yLjEwNyAyLjM3bC0uNzcyLS44N2EuNzUuNzUgMCAwIDAtMS4xMjIuOTk2bDEuMzM0IDEuNWEuNzUuNzUgMCAwIDAgMS4xMiAwem0uOTUtMTMuMjM4bC0uMDEgMi44MzVjMCAxLjA5NyAwIDIuMDY2LjEwNSAyLjg0OGMuMTE0Ljg0Ny4zNzUgMS42OTQgMS4wNjcgMi4zODVjLjY5LjY5MSAxLjUzOC45NTMgMi4zODUgMS4wNjdjLjc4MS4xMDUgMS43NTEuMTA1IDIuODQ4LjEwNWg0LjA1MmMuMDEzLjE1NS4wMjIuMzIxLjAyOC41SDIyYzAtLjI2OCAwLS40MDItLjAxLS41NmE1LjMyMiA1LjMyMiAwIDAgMC0uOTU4LTIuNjQxYy0uMDk0LS4xMjgtLjE1OC0uMjA0LS4yODUtLjM1N0MxOS45NTQgNy40OTQgMTguOTEgNi4zMTIgMTggNS41Yy0uODEtLjcyNC0xLjkyMS0xLjUxNS0yLjg5LTIuMTYxYy0uODMyLS41NTYtMS4yNDgtLjgzNC0xLjgxOS0xLjA0YTUuNDg4IDUuNDg4IDAgMCAwLS41MDYtLjE1NGMtLjM4NC0uMDk1LS43NTgtLjEyOC0xLjI4NS0uMTR6Ii8+PC9zdmc+

[github-release-date-shield]: https://img.shields.io/github/release-date-pre/KindaBrazy/LynxHub?style=flat&labelColor=%23212121&color=%2300A9FF&label=Date&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBkPSJNNi45NiAyYy40MTggMCAuNzU2LjMxLjc1Ni42OTJWNC4wOWMuNjctLjAxMiAxLjQyMi0uMDEyIDIuMjY4LS4wMTJoNC4wMzJjLjg0NiAwIDEuNTk3IDAgMi4yNjguMDEyVjIuNjkyYzAtLjM4Mi4zMzgtLjY5Mi43NTYtLjY5MnMuNzU2LjMxLjc1Ni42OTJWNC4xNWMxLjQ1LjEwNiAyLjQwMy4zNjggMy4xMDMgMS4wMDhjLjcuNjQxLjk4NSAxLjUxMyAxLjEwMSAyLjg0MnYxSDJWOGMuMTE2LTEuMzI5LjQwMS0yLjIgMS4xMDEtMi44NDJjLjctLjY0IDEuNjUyLS45MDIgMy4xMDMtMS4wMDhWMi42OTJjMC0uMzgyLjMzOS0uNjkyLjc1Ni0uNjkyIi8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMiAxNHYtMmMwLS44MzktLjAxMy0yLjMzNS0uMDI2LTNIMi4wMDZjLS4wMTMuNjY1IDAgMi4xNjEgMCAzdjJjMCAzLjc3MSAwIDUuNjU3IDEuMTcgNi44MjhDNC4zNDkgMjIgNi4yMzQgMjIgMTAuMDA0IDIyaDRjMy43NyAwIDUuNjU0IDAgNi44MjYtMS4xNzJDMjIgMTkuNjU3IDIyIDE3Ljc3MSAyMiAxNCIgb3BhY2l0eT0iMC41Ii8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xOCAxNi41YTEuNSAxLjUgMCAxIDEtMyAwYTEuNSAxLjUgMCAwIDEgMyAwIi8+PC9zdmc+

[github-downloads-shield]: https://img.shields.io/github/downloads/KindaBrazy/LynxHub/total?labelColor=%23212121&color=%2300A9FF&label=Downloads&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBkPSJNMjIgMTZ2LTFjMC0yLjgyOCAwLTQuMjQyLS44NzktNS4xMkMyMC4yNDIgOSAxOC44MjggOSAxNiA5SDhjLTIuODI5IDAtNC4yNDMgMC01LjEyMi44OEMyIDEwLjc1NyAyIDEyLjE3IDIgMTQuOTk3VjE2YzAgMi44MjkgMCA0LjI0My44NzkgNS4xMjJDMy43NTcgMjIgNS4xNzIgMjIgOCAyMmg4YzIuODI4IDAgNC4yNDMgMCA1LjEyMS0uODc4QzIyIDIwLjI0MiAyMiAxOC44MjkgMjIgMTYiIG9wYWNpdHk9IjAuNSIvPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiAxLjI1YS43NS43NSAwIDAgMC0uNzUuNzV2MTAuOTczbC0xLjY4LTEuOTYxYS43NS43NSAwIDEgMC0xLjE0Ljk3NmwzIDMuNWEuNzUuNzUgMCAwIDAgMS4xNCAwbDMtMy41YS43NS43NSAwIDEgMC0xLjE0LS45NzZsLTEuNjggMS45NlYyYS43NS43NSAwIDAgMC0uNzUtLjc1IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=
