<div align="center">

<br/>

<img height="120" alt="Application Icon" src="src/renderer/public/AppIcon%20Transparent.png">

# LynxHub

<h3>Your All-In-One AI Platform</h3>

[![GitHub Release][github-release-shield]](https://github.com/KindaBrazy/LynxHub/releases)
[![GitHub Release Date][github-release-date-shield]](https://github.com/KindaBrazy/LynxHub/releases)
[![GitHub Downloads (all assets, all releases)][github-downloads-shield]](https://github.com/KindaBrazy/LynxHub/releases)

![LynxHub Dashboard](/readme/screenshots/MainScreenshot.png)

<img src="https://discord.com/api/guilds/1179017720432443392/widget.png?style=banner2" alt="Discord Banner"/>

</div>

> [!IMPORTANT]
> **LynxHub: Not a One-Click Installer**
>
> LynxHub is designed to be a comprehensive manager and helper with a user-friendly and flexible environment. It is
> **not** a one-click installer.
>
> While LynxHub offers installation support in most cases, it's best if you have prior knowledge of installing your
> preferred AI interface on your device. You can then integrate it with LynxHub. Alternatively, if you are already using
> an AI interface, you can simply locate and connect it.

## 🔗 Download

Get started with LynxHub by downloading the latest version for your platform.

| Channel      | Version                                                                              | Date       |
|--------------|--------------------------------------------------------------------------------------|------------|
| Early Access | [**V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/tag/V2.3.0_Early-Access) | 2025-02-06 |
| Release      | [**V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/tag/V2.3.1)              | 2025-02-22 |

| Platform                         | x64                                                                                                              | ARM64                                                                                                            | Portable               |
|----------------------------------|------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|------------------------|
| **Windows 10/11** (.exe)         | [**📦 V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V2.3.1/LynxHub-V2.3.1-win_x64-Setup.exe) | 🔜 Coming soon(V2.4.0)                                                                                           | 🔜 Coming soon(V2.4.0) |
| **Debian, Ubuntu** (.deb)        | [**📦 V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V2.3.1/LynxHub-V2.3.1-linux_amd64.deb)   | [**📦 V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V2.3.1/LynxHub-V2.3.1-linux_arm64.deb)   | 🔜 Coming soon(V2.4.0) |
| **Red Hat, Fedora, SUSE** (.rpm) | [**📦 V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V2.3.1/LynxHub-V2.3.1-linux_x86_64.rpm)  | [**📦 V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V2.3.1/LynxHub-V2.3.1-linux_aarch64.rpm) | 🔜 Coming soon(V2.4.0) |
| **macOS (Beta)** - (.dmg)        | [**📦 V2.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V2.3.1/LynxHub-V2.3.1-mac.dmg)           | 🔜 Coming soon(V2.4.0)                                                                                           | ⏳ Coming later         |

> [!NOTE]
> **macOS Beta Release**
>
> The macOS version is currently in **beta**. I have limited access to physical macOS hardware for thorough testing, so
> issues are possible. Your feedback would be really helpful.

## 🗂️ Table of Contents

- ✨ [Feature Overview](#-feature-overview)
- 🧩 [Extensions](#-extensions)
- 📃 [Modules](#-extensions)
- 🖼️ [Screenshots](#%EF%B8%8F-screenshots)
- 📦 [Installation](#-installation)
- 🔧 [Development](#-development)
- 🤝 [Contributing](#-contributing)
- ❤️‍🔥 [Support](#%EF%B8%8F-support)

## ✨ Feature Overview

LynxHub offers a comprehensive suite of features designed to streamline your AI workflow and enhance your experience.
Here's what you can expect:

- [Extensible Architecture](https://github.com/KindaBrazy/LynxHub-Extension-Guide)
    - Enhance LynxHub's capabilities with custom extensions.
- [Modular Design](https://github.com/KindaBrazy/LynxHub-Module-Guide)
    - Fully modular architecture allowing third-party developers to create and publish custom modules
    - Modules can add new AI web interfaces (WebUIs) to the app, fully customizable by the developer
    - Developers can pre-define custom arguments, extensions, commands, and other configurations as part of the module,
      creating pre-configured WebUIs for users
- AI Interface Management
    - Install, config and update
    - Switch branches, shallow clone, unshallow, see latest commit details
    - Manage AI extensions with options for batch updates and auto-update settings
    - View available extensions and install them directly
- Arguments Manager
    - Available arguments list, add, remove, and edit various argument types (dropdowns, checkboxes, text input,
      folder/file selection - **relative, absolute**)
    - Search through arguments
    - Create and manage argument presets for different setups
- Custom Run Commands
    - Set and manage custom terminal commands for executing WebUI
- Pre-launch Actions
    - Automatically execute custom terminal commands before launching AI interfaces
    - Open specific files or folders as part of the pre-launch process
- Browser and Terminal Integration
    - Built-in terminal and web browser for seamless integration
    - Automatic detection and launch of relevant addresses (URLs, files)
    - Switch easily between terminal and browser modes
    - Terminal customization settings
- Markdown Viewer
    - Built-in Markdown viewer for easy reading of documentation and notes.
- AI Information Dashboard
    - View developer information, installation and update status
    - Access update tags, release notes, and disk usage statistics for each AI interface
- UI Customization
    - Customize the layout of cards for a flexible user interface
    - Dark and light themes available
    - Pin favorite AI interfaces to the home page for easy access

> [!TIP]
> 💡 **Get early access to LynxHub** features, extensions, and modules. Support development and unlock exclusive
> benefits by joining my [Patreon](https://www.patreon.com/LynxHub).

## 🧩 Extensions

### [Python Toolkit](https://github.com/KindaBrazy/LynxHub-Python-Toolkit)

<details>
<summary><kbd>Screenshot & Features</kbd></summary>

![Python Toolkit Screenshot](https://raw.githubusercontent.com/KindaBrazy/LynxHub-Python-Toolkit/refs/heads/compiled/resources/python.png)

**`🐍 Python Management`**

- **Auto-Detect Installed Pythons:** Automatically detects all installed Python versions, including those installed via
  Conda.
- **Install Python Versions:** Install new Python versions (official and Conda-based) directly from the extension.
- **Set System Default Python:** Easily set any installed Python as the system default.
- **Manage Installed Packages:** Manage packages installed in each Python environment.
- **View Python Details:** View detailed information about installed Pythons, including version, install path, installed
  packages count, and disk usage.

**`🌐 Virtual Environment`**

- **Locate Existing Venvs:** Locate and list existing virtual environments.
- **Create New Venv:** Create new virtual environments with selected Python versions (official or Conda).
- **Associate AI with Venv:** Associate AI tools with specific virtual environments, allowing multiple AIs to share the
  same environment.
- **View Venv Details:** View detailed information about virtual environments, including Python version, install path,
  installed packages count, disk usage, and associated AIs.
- **Manage Venv Packages:** Manage packages installed in virtual environments.

**`📦 Package Manager`**

- **Check for Updates:**
    - Check for updates for all installed packages.
    - Check for updates based on requirements files.
- **Update Manager:**
    - Interactively update packages.
    - Categorize and colorize updates based on update type (prerelease, major, minor, patch, others).
    - Filter updates by type and choose to update all or select packages.
- **Install Packages:**
    - Select and install multiple packages with version conditions.
    - Install packages from a requirements file.
    - View a preview of script before installation.
- **Manage Requirements:**
    - Manage requirements files and their associated packages.

**`📝 Requirements Manager`**

- **Select and Change Requirements File:** Easily switch between different requirements files.
- **Add, Remove, and Change Requirements:** Modify requirements in a user-friendly interface.

**`🤖 AI Integration`**

- **New Menu Item for Package and Requirement Management:** Direct access to package and requirement management from the
  AI menu.

**`🛠️ Tools Page Integration`**

- **New Card for Individual Toolkit:** Open and manage individual pythons from a dedicated card on the tools page.

</details>

## 📃 Modules

### [WebUI Container Module](https://github.com/KindaBrazy/LynxHub-Module-Offline-Container)

<details>
<summary><kbd>Available AI Interfaces</kbd></summary>

**`🖼️ Image Generation`**

| Developer                                                                                          | Project                 | GitHub                                                                     |
|----------------------------------------------------------------------------------------------------|-------------------------|----------------------------------------------------------------------------|
| <img height='20' src="https://avatars.githubusercontent.com/u/121283862?s=20&v=4"> ComfyAnonymous  | ComfyUI                 | [Link](https://github.com/comfyanonymous/ComfyUI)                          |
| <img height='20' src="https://avatars.githubusercontent.com/u/5392772?s=20&v=4"> Patientx          | ComfyUI Zluda           | [Link](https://github.com/patientx/ComfyUI-Zluda)                          |
| <img height='20' src="https://avatars.githubusercontent.com/u/20920490?s=20&v=4"> Automatic1111    | Stable Diffusion        | [Link](https://github.com/AUTOMATIC1111/stable-diffusion-webui)            |
| <img height='20' src="https://avatars.githubusercontent.com/u/39524005?s=20&v=4"> Lshqqytiger      | Stable Diffusion AMDGPU | [Link](https://github.com/lshqqytiger/stable-diffusion-webui-amdgpu)       |
| <img height='20' src="https://avatars.githubusercontent.com/u/19834515?s=20v=4"> Lllyasviel        | SD Forge                | [Link](https://github.com/lllyasviel/stable-diffusion-webui-forge)         |
| <img height='20' src="https://avatars.githubusercontent.com/u/39524005?s=20&v=4"> Lshqqytiger      | SD Forge AMDGPU         | [Link](https://github.com/lshqqytiger/stable-diffusion-webui-amdgpu-forge) |
| <img height='20' src="https://avatars.githubusercontent.com/u/57876960?s=20&v=4"> Vladmandic       | SD Next                 | [Link](https://github.com/vladmandic/automatic)                            |
| <img height='20' src="https://avatars.githubusercontent.com/u/43497670?s=20&v=4"> McMonkeyProjects | SwarmUI                 | [Link](https://github.com/mcmonkeyprojects/SwarmUI)                        |
| <img height='20' src="https://avatars.githubusercontent.com/u/7474674?s=20&v=4"> Bmaltais          | Kohya's GUI             | [Link](https://github.com/bmaltais/kohya_ss)                               |
| <img height='20' src="https://avatars.githubusercontent.com/u/124302297?s=20&v=4"> Anapnoe         | SD UI-UX                | [Link](https://github.com/anapnoe/stable-diffusion-webui-ux)               |
| <img height='20' src="https://avatars.githubusercontent.com/u/3390934?s=20&v=4"> Nerogar           | OneTrainer              | [Link](https://github.com/Nerogar/OneTrainer)                              |
| <img height='20' src="https://avatars.githubusercontent.com/u/113954515?s=20&v=4"> InvokeAI        | InvokeAI                | [Link](https://github.com/invoke-ai/InvokeAI)                              |

**`📝 Text Generation`**

| Developer                                                                                      | Project         | GitHub                                                     |
|------------------------------------------------------------------------------------------------|-----------------|------------------------------------------------------------|
| <img height='20' src="https://avatars.githubusercontent.com/u/112222186?s=20&v=4"> Oobabooga   | Text Generation | [Link](https://github.com/oobabooga/text-generation-webui) |
| <img height='20' src="https://avatars.githubusercontent.com/u/134869877?s=20&v=4"> SillyTavern | SillyTavern     | [Link](https://github.com/SillyTavern/SillyTavern)         |
| <img height='20' src="https://avatars.githubusercontent.com/u/158137808?s=20&v=4"> Open-WebUI  | Open WebUI      | [Link](https://github.com/open-webui/open-webui)           |
| <img height='20' src="https://avatars.githubusercontent.com/u/827993?s=20&v=4"> ParisNeo       | LoLLMs          | [Link](https://github.com/ParisNeo/lollms-webui)           |
| <img height='20' src="https://avatars.githubusercontent.com/u/128289781?s=20&v=4"> FlowiseAI   | Flowise         | [Link](https://github.com/FlowiseAI/Flowise)               |

**`🎵 Audio Generation`**

| Developer                                                                                 | Project          | GitHub                                                  |
|-------------------------------------------------------------------------------------------|------------------|---------------------------------------------------------|
| <img height='20' src="https://avatars.githubusercontent.com/u/6757283?s=20&v=4"> Rsxdalv  | Text to Speech   | [Link](https://github.com/rsxdalv/tts-generation-webui) |
| <img height='20' src="https://avatars.githubusercontent.com/u/36931363?s=20&v=4"> Gitmylo | Audio Generation | [Link](https://github.com/gitmylo/audio-webui)          |
| <img height='20' src="https://avatars.githubusercontent.com/u/35898566?s=20&v=4"> Erew123 | AllTalk TTS      | [Link](https://github.com/erew123/alltalk_tts)          |

</details>

## 🖼️ Screenshots

<div align="center">

![Terminal and browser screenshot](/readme/screenshots/Launching.png)

![Argument manager screenshot](/readme/screenshots/Arguments.png)

![Manage extensions screenshot](/readme/screenshots/Extensions.png)

![Customize launch screenshot](/readme/screenshots/CustomLaunch.png)

![Installation screenshot](/readme/screenshots/Installation.png)

![Update screenshot](/readme/screenshots/Update.png)

</div>

## 📦 Installation

1. **Install Prerequisites**
    - [Git](https://git-scm.com/downloads)
    - [Python](https://www.python.org/downloads) (required for AI interfaces; check "Add Python to PATH" during install)

2. **Download LynxHub**
    - Get the latest executable from the [Releases page](https://github.com/KindaBrazy/LynxHub/releases)
      or [Patreon (Early-Access)](https://www.patreon.com/LynxHub).

3. **Launch the Application**
    - Updates are automatically checked and prompted during use.

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

[![Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3DLynxHub%26type%3Dpatrons&style=for-the-badge)](https://www.patreon.com/LynxHub)

**Supporter Benefits**

- Early feature access
    - Early access to Lynxhub, extensions, modules, etc.
- Exclusive community recognition
    - Your name in GitHub Readme and Application.
- Development roadmap insights
- Priority technical support

For one-time donations: [Support via Patreon](https://www.Patreon.com/LynxHub/Shop)

Every contribution directly supports ongoing development and future improvements.

---

<div align="center">

[![X](https://img.shields.io/badge/X-%23000000.svg?style=for-the-badge&logo=X&logoColor=white)](https://x.com/LynxHubAI)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=YouTube&logoColor=white)](https://www.youtube.com/@LynxHubAI)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/LynxHubAI)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kindofbrazy@gmail.com)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/LynxHub)

</div>

---

<br/>

© 2025 LynxHub.

[github-release-shield]:https://img.shields.io/github/v/release/KindaBrazy/LynxHub?include_prereleases&style=flat&labelColor=%23212121&color=%2300A9FF&label=Version&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNCAyMmgtNGMtMy43NzEgMC01LjY1NyAwLTYuODI4LTEuMTcyQzIgMTkuNjU3IDIgMTcuNzcxIDIgMTR2LTRjMC0zLjc3MSAwLTUuNjU3IDEuMTcyLTYuODI4QzQuMzQzIDIgNi4yMzkgMiAxMC4wMyAyYy42MDYgMCAxLjA5MSAwIDEuNS4wMTdjLS4wMTMuMDgtLjAyLjE2MS0uMDIuMjQ0bC0uMDEgMi44MzRjMCAxLjA5NyAwIDIuMDY3LjEwNSAyLjg0OGMuMTE0Ljg0Ny4zNzUgMS42OTQgMS4wNjcgMi4zODZjLjY5LjY5IDEuNTM4Ljk1MiAyLjM4NSAxLjA2NmMuNzgxLjEwNSAxLjc1MS4xMDUgMi44NDguMTA1aDQuMDUyYy4wNDMuNTM0LjA0MyAxLjE5LjA0MyAyLjA2M1YxNGMwIDMuNzcxIDAgNS42NTctMS4xNzIgNi44MjhDMTkuNjU3IDIyIDE3Ljc3MSAyMiAxNCAyMiIgY2xpcC1ydWxlPSJldmVub2RkIiBvcGFjaXR5PSIwLjUiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEwLjU2IDE1LjQ5OGEuNzUuNzUgMCAxIDAtMS4xMi0uOTk2bC0yLjEwNyAyLjM3bC0uNzcyLS44N2EuNzUuNzUgMCAwIDAtMS4xMjIuOTk2bDEuMzM0IDEuNWEuNzUuNzUgMCAwIDAgMS4xMiAwem0uOTUtMTMuMjM4bC0uMDEgMi44MzVjMCAxLjA5NyAwIDIuMDY2LjEwNSAyLjg0OGMuMTE0Ljg0Ny4zNzUgMS42OTQgMS4wNjcgMi4zODVjLjY5LjY5MSAxLjUzOC45NTMgMi4zODUgMS4wNjdjLjc4MS4xMDUgMS43NTEuMTA1IDIuODQ4LjEwNWg0LjA1MmMuMDEzLjE1NS4wMjIuMzIxLjAyOC41SDIyYzAtLjI2OCAwLS40MDItLjAxLS41NmE1LjMyMiA1LjMyMiAwIDAgMC0uOTU4LTIuNjQxYy0uMDk0LS4xMjgtLjE1OC0uMjA0LS4yODUtLjM1N0MxOS45NTQgNy40OTQgMTguOTEgNi4zMTIgMTggNS41Yy0uODEtLjcyNC0xLjkyMS0xLjUxNS0yLjg5LTIuMTYxYy0uODMyLS41NTYtMS4yNDgtLjgzNC0xLjgxOS0xLjA0YTUuNDg4IDUuNDg4IDAgMCAwLS41MDYtLjE1NGMtLjM4NC0uMDk1LS43NTgtLjEyOC0xLjI4NS0uMTR6Ii8+PC9zdmc+

[github-release-date-shield]:https://img.shields.io/github/release-date-pre/KindaBrazy/LynxHub?style=flat&labelColor=%23212121&color=%2300A9FF&label=Date&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBkPSJNNi45NiAyYy40MTggMCAuNzU2LjMxLjc1Ni42OTJWNC4wOWMuNjctLjAxMiAxLjQyMi0uMDEyIDIuMjY4LS4wMTJoNC4wMzJjLjg0NiAwIDEuNTk3IDAgMi4yNjguMDEyVjIuNjkyYzAtLjM4Mi4zMzgtLjY5Mi43NTYtLjY5MnMuNzU2LjMxLjc1Ni42OTJWNC4xNWMxLjQ1LjEwNiAyLjQwMy4zNjggMy4xMDMgMS4wMDhjLjcuNjQxLjk4NSAxLjUxMyAxLjEwMSAyLjg0MnYxSDJWOGMuMTE2LTEuMzI5LjQwMS0yLjIgMS4xMDEtMi44NDJjLjctLjY0IDEuNjUyLS45MDIgMy4xMDMtMS4wMDhWMi42OTJjMC0uMzgyLjMzOS0uNjkyLjc1Ni0uNjkyIi8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMiAxNHYtMmMwLS44MzktLjAxMy0yLjMzNS0uMDI2LTNIMi4wMDZjLS4wMTMuNjY1IDAgMi4xNjEgMCAzdjJjMCAzLjc3MSAwIDUuNjU3IDEuMTcgNi44MjhDNC4zNDkgMjIgNi4yMzQgMjIgMTAuMDA0IDIyaDRjMy43NyAwIDUuNjU0IDAgNi44MjYtMS4xNzJDMjIgMTkuNjU3IDIyIDE3Ljc3MSAyMiAxNCIgb3BhY2l0eT0iMC41Ii8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xOCAxNi41YTEuNSAxLjUgMCAxIDEtMyAwYTEuNSAxLjUgMCAwIDEgMyAwIi8+PC9zdmc+

[github-downloads-shield]:https://img.shields.io/github/downloads/KindaBrazy/LynxHub/total?labelColor=%23212121&color=%2300A9FF&label=Downloads&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBkPSJNMjIgMTZ2LTFjMC0yLjgyOCAwLTQuMjQyLS44NzktNS4xMkMyMC4yNDIgOSAxOC44MjggOSAxNiA5SDhjLTIuODI5IDAtNC4yNDMgMC01LjEyMi44OEMyIDEwLjc1NyAyIDEyLjE3IDIgMTQuOTk3VjE2YzAgMi44MjkgMCA0LjI0My44NzkgNS4xMjJDMy43NTcgMjIgNS4xNzIgMjIgOCAyMmg4YzIuODI4IDAgNC4yNDMgMCA1LjEyMS0uODc4QzIyIDIwLjI0MiAyMiAxOC44MjkgMjIgMTYiIG9wYWNpdHk9IjAuNSIvPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiAxLjI1YS43NS43NSAwIDAgMC0uNzUuNzV2MTAuOTczbC0xLjY4LTEuOTYxYS43NS43NSAwIDEgMC0xLjE0Ljk3NmwzIDMuNWEuNzUuNzUgMCAwIDAgMS4xNCAwbDMtMy41YS43NS43NSAwIDEgMC0xLjE0LS45NzZsLTEuNjggMS45NlYyYS43NS43NSAwIDAgMC0uNzUtLjc1IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=