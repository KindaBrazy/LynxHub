<div align="center">

<br/>

<img height="120" alt="Application Icon" src="src/renderer/public/AppIcon%20Transparent.png">

# LynxHub

Seamlessly install, configure, launch, and manage your AI interfaces from a single, intuitive platform.

[![GitHub Release][github-release-shield]](https://github.com/KindaBrazy/LynxHub/releases)
[![GitHub Release Date][github-release-date-shield]](https://github.com/KindaBrazy/LynxHub/releases)
[![GitHub Downloads (all assets, all releases)][github-downloads-shield]](https://github.com/KindaBrazy/LynxHub/releases)

[![Discord][discord-shield]](https://discord.gg/e8rBzhtcnK)
[![GitHub Repo stars][github-repo-stars-shield]](https://github.com/KindaBrazy/LynxHub)

![LynxHub Dashboard](/readme/screenshots/MainScreenshot.png)

</div>

<div align="center">

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Ant-Design](https://img.shields.io/badge/-AntDesign-%230170FE?style=for-the-badge&logo=ant-design&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

</div>

<div align="center">

[![LynxHub Discord](http://invidget.switchblade.xyz/e8rBzhtcnK)](https://discord.gg/e8rBzhtcnK)

</div>

## 🔗 Download

| Channel      | Version                                                                              | Date       |
|--------------|--------------------------------------------------------------------------------------|------------|
| Early Access | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/tag/V1.3.1_Early-Access) | 2024-10-10 |
| Release      | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/tag/V1.3.1)              | 2024-10-24 |

| Platform                         | x64                                                                                                           | arm64                                                                                                         |
|----------------------------------|---------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Windows 10/11** (.exe)         | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V1.3.1/LynxHub-V1.3.1-win_x64-Setup.exe) | N/A                                                                                                           |
| **macOS** (.dmg)                 | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V1.3.1/LynxHub-V1.3.1-mac.dmg)           | N/A                                                                                                           |
| **Debian, Ubuntu** (.deb)        | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V1.3.1/LynxHub-V1.3.1-linux_amd64.deb)   | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V1.3.1/LynxHub-V1.3.1-linux_arm64.deb)   |
| **Red Hat, Fedora, SUSE** (.rpm) | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V1.3.1/LynxHub-V1.3.1-linux_x86_64.rpm)  | [**V1.3.1**](https://github.com/KindaBrazy/LynxHub/releases/download/V1.3.1/LynxHub-V1.3.1-linux_aarch64.rpm) |

> [!TIP]
> 🌟 **Exclusive Early Access**
>
> Join [Patreon](https://www.patreon.com/LynxHub) to gain **Early Access** to the **new features, bug
fixes, and compatibilities**
>
> For more details, check out [❤️‍🔥 Support](#-support) section.

## 🗂️ Table of Contents

- ✨ [Feature Overview](#-feature-overview)
- 📃 [Available Modules](#-available-modules)
- 🖼️ [Screenshots](#%EF%B8%8F-screenshots)
- 📦 [Installation](#-installation)
- 🔧 [Development](#-development)
- 🤝 [Contributing](#-contributing)
- ❤️‍🔥 [Support](#%EF%B8%8F-support)
- 💡 [Acknowledgement](#-acknowledgements)

## ✨ Feature Overview

LynxHub offers a comprehensive suite of features designed to streamline your AI workflow and enhance your experience.
Here's what you can expect:

- [Modular Design](https://github.com/KindaBrazy/LynxHub-Module-Guide)
    - Fully modular architecture allowing third-party developers to create and publish custom modules
    - Modules can add new AI web interfaces (WebUIs) to the app, fully customizable by the developer
    - Developers can pre-define custom arguments, extensions, commands, and other configurations as part of the module,
      creating pre-configured WebUIs for users
- AI Interface Management
    - Install, update, and auto-update
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
- AI Information Dashboard
    - View developer information, installation and update status
    - Access update tags, release notes, and disk usage statistics for each AI interface
- UI Customization
    - Customize the layout of cards for a flexible user interface
    - Dark and light themes available
    - Pin favorite AI interfaces to the home page for easy access

<div align="center">

**Stay tuned for exciting upcoming features!**

</div>

## 📃 [Available Modules](https://github.com/KindaBrazy/LynxHub-Module-Offline-Container)

### 🖼️ Image Generation

| Developer                                                                                          | Project                                            | GitHub                                                                     |
|----------------------------------------------------------------------------------------------------|----------------------------------------------------|----------------------------------------------------------------------------|
| <img height='20' src="https://avatars.githubusercontent.com/u/121283862?s=20&v=4"> ComfyAnonymous  | ComfyUI                                            | [Link](https://github.com/comfyanonymous/ComfyUI)                          |
| <img height='20' src="https://avatars.githubusercontent.com/u/20920490?s=20&v=4"> Automatic1111    | Stable Diffusion                                   | [Link](https://github.com/AUTOMATIC1111/stable-diffusion-webui)            |
| <img height='20' src="https://avatars.githubusercontent.com/u/39524005?s=20&v=4"> Lshqqytiger      | Stable Diffusion AMDGPU                            | [Link](https://github.com/lshqqytiger/stable-diffusion-webui-amdgpu)       |
| <img height='20' src="https://avatars.githubusercontent.com/u/19834515?s=20v=4"> Lllyasviel        | SD Forge                                           | [Link](https://github.com/lllyasviel/stable-diffusion-webui-forge)         |
| <img height='20' src="https://avatars.githubusercontent.com/u/39524005?s=20&v=4"> Lshqqytiger      | SD Forge AMDGPU                                    | [Link](https://github.com/lshqqytiger/stable-diffusion-webui-amdgpu-forge) |
| <img height='20' src="https://avatars.githubusercontent.com/u/57876960?s=20&v=4"> Vladmandic       | SD Next                                            | [Link](https://github.com/vladmandic/automatic)                            |
| <img height='20' src="https://avatars.githubusercontent.com/u/43497670?s=20&v=4"> McMonkeyProjects | SwarmUI                                            | [Link](https://github.com/mcmonkeyprojects/SwarmUI)                        |
| <img height='20' src="https://avatars.githubusercontent.com/u/7474674?s=20&v=4"> Bmaltais          | Kohya's GUI                                        | [Link](https://github.com/bmaltais/kohya_ss)                               |
| <img height='20' src="https://avatars.githubusercontent.com/u/124302297?s=20&v=4"> Anapnoe         | SD UI-UX                                           | [Link](https://github.com/anapnoe/stable-diffusion-webui-ux)               |
| <img height='20' src="https://avatars.githubusercontent.com/u/3390934?s=20&v=4"> Nerogar           | OneTrainer (Available in LynxHub V1.3.0 and above) | [Link](https://github.com/Nerogar/OneTrainer)                              |
| <img height='20' src="https://avatars.githubusercontent.com/u/113954515?s=20&v=4"> InvokeAI        | InvokeAI (Available in LynxHub V1.3.0 and above)   | [Link](https://github.com/invoke-ai/InvokeAI)                              |

### 📝 Text Generation

| Developer                                                                                      | Project         | GitHub                                                     |
|------------------------------------------------------------------------------------------------|-----------------|------------------------------------------------------------|
| <img height='20' src="https://avatars.githubusercontent.com/u/112222186?s=20&v=4"> Oobabooga   | Text Generation | [Link](https://github.com/oobabooga/text-generation-webui) |
| <img height='20' src="https://avatars.githubusercontent.com/u/134869877?s=20&v=4"> SillyTavern | SillyTavern     | [Link](https://github.com/SillyTavern/SillyTavern)         |

### 🎵 Audio Generation

| Developer                                                                                 | Project                                             | GitHub                                                  |
|-------------------------------------------------------------------------------------------|-----------------------------------------------------|---------------------------------------------------------|
| <img height='20' src="https://avatars.githubusercontent.com/u/6757283?s=20&v=4"> Rsxdalv  | Text to Speech                                      | [Link](https://github.com/rsxdalv/tts-generation-webui) |
| <img height='20' src="https://avatars.githubusercontent.com/u/36931363?s=20&v=4"> Gitmylo | Audio Generation                                    | [Link](https://github.com/gitmylo/audio-webui)          |
| <img height='20' src="https://avatars.githubusercontent.com/u/35898566?s=20&v=4"> Erew123 | AllTalk TTS (Available in LynxHub V1.3.0 and above) | [Link](https://github.com/erew123/alltalk_tts)          |

## 🖼️ Screenshots

<div align="center">

### Terminal & Browser

![Manage extensions screenshot](/readme/screenshots/Launching.png)

### Arguments Management

![Manage extensions screenshot](/readme/screenshots/Arguments.png)

### Launch Customization

![Manage extensions screenshot](/readme/screenshots/CustomLaunch.png)

### Extension Management

![Manage extensions screenshot](/readme/screenshots/Extensions.png)

<br/>

<details>
<summary><kbd>More Shots?</kbd></summary>

### Others

![Manage extensions screenshot](/readme/screenshots/Update.png)

![Manage extensions screenshot](/readme/screenshots/Settings.png)

![Manage extensions screenshot](/readme/screenshots/Others.png)

</details>

</div>

## 📦 Installation

Follow these steps to get LynxHub up and running on your system:

1. **[Install Git](https://git-scm.com/downloads)**
2. **[Install Python](https://www.python.org/downloads)** (Optional for the app, required for AI interfaces)  
   Recommended version: [Python 3.10.11](https://www.python.org/downloads/release/python-31011/).
    - During installation, make sure to check "Add Python to PATH"
3. **Install LynxHub**  
   Get the executable setup file from **[Releases page](https://github.com/KindaBrazy/LynxHub/releases)**.
4. **Launch the Application**
5. **Updating**
    - LynxHub will automatically check for updates
    - If an update is available, you'll be prompted to download and install it
6. **🎉 You're All Set!** Enjoy using the app!

## 🔧 Development

This section provides guidelines for setting up your development environment and working on LynxHub.

**Prerequisites**

- [NodeJS](https://nodejs.org/en/download) (LTS version recommended)
- [Git](https://git-scm.com/downloads)

**Setting Up the Development Environment**

1. Clone the repository:
   ```bash
   git clone https://github.com/KindaBrazy/LynxHub
   cd LynxHub
   ```
2. Install dependencies:
   ```bash
   npm i
   ```
3. Start the development environment:
   ```bash
   npm run dev
   ```

   This will launch the app in development mode with the following features:
    - **Hot Reload**: Changes in the **renderer process** will automatically refresh the app.
    - **Auto Restart**: Changes in the **main process** will automatically restart the app.

**Development Hotkeys**

- <kbd>F12</kbd>: Open DevTools
- <kbd>CTRL</kbd> + <kbd>R</kbd>: Refresh the renderer (while DevTools is focused)

**Native Modules**

Native modules are automatically detected and compiled after installation.(`postinstall`)

**Building and Packaging**

To package the app for distribution:

1. For Windows:
   ```bash
   npm run build:win
   ```

2. For other platforms:
   Modify the [BuilderConfig](./electron-builder.config.cjs) file to target different platforms, then run:
   ```bash
   npm run build
   ```

## 🤝 Contributing

As a solo developer, I'm thrilled by and deeply appreciate any contributions to this project! Your involvement, no
matter how big or small, plays a crucial role in improving and growing this application. All types of contributions are
welcome and valued!

**🌟 Ways to Contribute**

1. 💻 **Contributing Code**:
    - Feel free to tackle any open issues or implement new features.
2. 🧩 **Developing Modules**:
    - Interested in creating a module? Great! Check
      out [Module-Guide](https://github.com/KindaBrazy/LynxHub-Module-Guide) for guidelines.
    - This is an excellent way to extend the app's functionality.
3. 💡 **Suggesting Enhancements**:
    - Have an idea to make the app better? I love to hear it!
    - Open an issue with the tag "enhancement" and describe your proposal.

Remember, every contribution counts! Whether it's a typo fix or a major feature, your effort is deeply appreciated and
helps make this project better for everyone. Thank you for being a part of this journey!

## ❤️‍🔥 Support

Your support is crucial in keeping this project alive and thriving! If you find value in this app and want to contribute
to its growth, consider becoming a Patron.

[![Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3DLynxHub%26type%3Dpatrons&style=for-the-badge)](https://www.patreon.com/LynxHub)

By becoming a patron, you'll unlock a range of exclusive perks:

- 🚀 **Early Access**: Be the first to experience new features and updates before they're publicly released.
- 🏅 **Exclusive Discord Role**: Join our community with a special role that reflects your support level.
- 📢 **Behind-the-Scenes Updates**: Get regular insider information on current development efforts and future plans.
- 🎯 **Priority Support**: Receive faster responses to your questions and issues, ensuring a smooth experience.
- 👏 **Public Recognition**: Your name will be featured in our README and in-app credits as a valued supporter.

> [!NOTE]
> **💖 Prefer a one-time contribution?**
>
> [Click here to make a single donation and show your support!](https://www.Patreon.com/LynxHub/Shop)

Every patron, regardless of tier or one-time donation, plays a vital role in the app's continued improvement and
sustainability.

## 💎 Diamond Sponsors

<div align="center">

`No Sponsors Yet`

</div>

## 🏆 Platinum Sponsors

<div align="center">

`No Sponsors Yet`

</div>

## 💡 Acknowledgements

- **[Electron-Vite](https://github.com/alex8088/electron-vite)**: For providing an outstanding boilerplate that
  seamlessly integrates Electron and React, significantly accelerating our development process.
- **[NPM Packages](./package.json)**: For the myriad of libraries that have been instrumental in shaping and optimizing
  this project.
- **[AI Interface](https://github.com/KindaBrazy/LynxHub-Module-Offline-Container)**: To all the brilliant AI interface
  developers whose work has been integral to this project.
- **[Iconify](https://iconify.design/)**: For providing a wide array of beautiful open-source icons used throughout the
  application.

**Last but not least:**

- `You`: For using the app, providing feedback, and supporting its development. Your engagement and support
  are what drive this project forward.

<br/>

---

<br/>

[![gpl](https://ziadoua.github.io/m3-Markdown-Badges/badges/LicenceGPLv3/licencegplv31.svg)](./LICENSE.txt)

© 2024 LynxHub.

[github-release-shield]:https://img.shields.io/github/v/release/KindaBrazy/LynxHub?include_prereleases&style=flat&labelColor=%23212121&color=%2300A9FF&label=Version&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNCAyMmgtNGMtMy43NzEgMC01LjY1NyAwLTYuODI4LTEuMTcyQzIgMTkuNjU3IDIgMTcuNzcxIDIgMTR2LTRjMC0zLjc3MSAwLTUuNjU3IDEuMTcyLTYuODI4QzQuMzQzIDIgNi4yMzkgMiAxMC4wMyAyYy42MDYgMCAxLjA5MSAwIDEuNS4wMTdjLS4wMTMuMDgtLjAyLjE2MS0uMDIuMjQ0bC0uMDEgMi44MzRjMCAxLjA5NyAwIDIuMDY3LjEwNSAyLjg0OGMuMTE0Ljg0Ny4zNzUgMS42OTQgMS4wNjcgMi4zODZjLjY5LjY5IDEuNTM4Ljk1MiAyLjM4NSAxLjA2NmMuNzgxLjEwNSAxLjc1MS4xMDUgMi44NDguMTA1aDQuMDUyYy4wNDMuNTM0LjA0MyAxLjE5LjA0MyAyLjA2M1YxNGMwIDMuNzcxIDAgNS42NTctMS4xNzIgNi44MjhDMTkuNjU3IDIyIDE3Ljc3MSAyMiAxNCAyMiIgY2xpcC1ydWxlPSJldmVub2RkIiBvcGFjaXR5PSIwLjUiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEwLjU2IDE1LjQ5OGEuNzUuNzUgMCAxIDAtMS4xMi0uOTk2bC0yLjEwNyAyLjM3bC0uNzcyLS44N2EuNzUuNzUgMCAwIDAtMS4xMjIuOTk2bDEuMzM0IDEuNWEuNzUuNzUgMCAwIDAgMS4xMiAwem0uOTUtMTMuMjM4bC0uMDEgMi44MzVjMCAxLjA5NyAwIDIuMDY2LjEwNSAyLjg0OGMuMTE0Ljg0Ny4zNzUgMS42OTQgMS4wNjcgMi4zODVjLjY5LjY5MSAxLjUzOC45NTMgMi4zODUgMS4wNjdjLjc4MS4xMDUgMS43NTEuMTA1IDIuODQ4LjEwNWg0LjA1MmMuMDEzLjE1NS4wMjIuMzIxLjAyOC41SDIyYzAtLjI2OCAwLS40MDItLjAxLS41NmE1LjMyMiA1LjMyMiAwIDAgMC0uOTU4LTIuNjQxYy0uMDk0LS4xMjgtLjE1OC0uMjA0LS4yODUtLjM1N0MxOS45NTQgNy40OTQgMTguOTEgNi4zMTIgMTggNS41Yy0uODEtLjcyNC0xLjkyMS0xLjUxNS0yLjg5LTIuMTYxYy0uODMyLS41NTYtMS4yNDgtLjgzNC0xLjgxOS0xLjA0YTUuNDg4IDUuNDg4IDAgMCAwLS41MDYtLjE1NGMtLjM4NC0uMDk1LS43NTgtLjEyOC0xLjI4NS0uMTR6Ii8+PC9zdmc+

[github-release-date-shield]:https://img.shields.io/github/release-date-pre/KindaBrazy/LynxHub?style=flat&labelColor=%23212121&color=%2300A9FF&label=Date&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBkPSJNNi45NiAyYy40MTggMCAuNzU2LjMxLjc1Ni42OTJWNC4wOWMuNjctLjAxMiAxLjQyMi0uMDEyIDIuMjY4LS4wMTJoNC4wMzJjLjg0NiAwIDEuNTk3IDAgMi4yNjguMDEyVjIuNjkyYzAtLjM4Mi4zMzgtLjY5Mi43NTYtLjY5MnMuNzU2LjMxLjc1Ni42OTJWNC4xNWMxLjQ1LjEwNiAyLjQwMy4zNjggMy4xMDMgMS4wMDhjLjcuNjQxLjk4NSAxLjUxMyAxLjEwMSAyLjg0MnYxSDJWOGMuMTE2LTEuMzI5LjQwMS0yLjIgMS4xMDEtMi44NDJjLjctLjY0IDEuNjUyLS45MDIgMy4xMDMtMS4wMDhWMi42OTJjMC0uMzgyLjMzOS0uNjkyLjc1Ni0uNjkyIi8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMiAxNHYtMmMwLS44MzktLjAxMy0yLjMzNS0uMDI2LTNIMi4wMDZjLS4wMTMuNjY1IDAgMi4xNjEgMCAzdjJjMCAzLjc3MSAwIDUuNjU3IDEuMTcgNi44MjhDNC4zNDkgMjIgNi4yMzQgMjIgMTAuMDA0IDIyaDRjMy43NyAwIDUuNjU0IDAgNi44MjYtMS4xNzJDMjIgMTkuNjU3IDIyIDE3Ljc3MSAyMiAxNCIgb3BhY2l0eT0iMC41Ii8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xOCAxNi41YTEuNSAxLjUgMCAxIDEtMyAwYTEuNSAxLjUgMCAwIDEgMyAwIi8+PC9zdmc+

[github-downloads-shield]:https://img.shields.io/github/downloads/KindaBrazy/LynxHub/total?labelColor=%23212121&color=%2300A9FF&label=Downloads&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBkPSJNMjIgMTZ2LTFjMC0yLjgyOCAwLTQuMjQyLS44NzktNS4xMkMyMC4yNDIgOSAxOC44MjggOSAxNiA5SDhjLTIuODI5IDAtNC4yNDMgMC01LjEyMi44OEMyIDEwLjc1NyAyIDEyLjE3IDIgMTQuOTk3VjE2YzAgMi44MjkgMCA0LjI0My44NzkgNS4xMjJDMy43NTcgMjIgNS4xNzIgMjIgOCAyMmg4YzIuODI4IDAgNC4yNDMgMCA1LjEyMS0uODc4QzIyIDIwLjI0MiAyMiAxOC44MjkgMjIgMTYiIG9wYWNpdHk9IjAuNSIvPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiAxLjI1YS43NS43NSAwIDAgMC0uNzUuNzV2MTAuOTczbC0xLjY4LTEuOTYxYS43NS43NSAwIDEgMC0xLjE0Ljk3NmwzIDMuNWEuNzUuNzUgMCAwIDAgMS4xNCAwbDMtMy41YS43NS43NSAwIDEgMC0xLjE0LS45NzZsLTEuNjggMS45NlYyYS43NS43NSAwIDAgMC0uNzUtLjc1IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=

[discord-shield]:https://img.shields.io/discord/1179017720432443392?labelColor=%23212121&color=%23d500f9&label=Discord&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTI0IDB2MjRIMFYwek0xMi41OTMgMjMuMjU4bC0uMDExLjAwMmwtLjA3MS4wMzVsLS4wMi4wMDRsLS4wMTQtLjAwNGwtLjA3MS0uMDM1cS0uMDE2LS4wMDUtLjAyNC4wMDVsLS4wMDQuMDFsLS4wMTcuNDI4bC4wMDUuMDJsLjAxLjAxM2wuMTA0LjA3NGwuMDE1LjAwNGwuMDEyLS4wMDRsLjEwNC0uMDc0bC4wMTItLjAxNmwuMDA0LS4wMTdsLS4wMTctLjQyN3EtLjAwNC0uMDE2LS4wMTctLjAxOG0uMjY1LS4xMTNsLS4wMTMuMDAybC0uMTg1LjA5M2wtLjAxLjAxbC0uMDAzLjAxMWwuMDE4LjQzbC4wMDUuMDEybC4wMDguMDA3bC4yMDEuMDkzcS4wMTkuMDA1LjAyOS0uMDA4bC4wMDQtLjAxNGwtLjAzNC0uNjE0cS0uMDA1LS4wMTktLjAyLS4wMjJtLS43MTUuMDAyYS4wMi4wMiAwIDAgMC0uMDI3LjAwNmwtLjAwNi4wMTRsLS4wMzQuNjE0cS4wMDEuMDE4LjAxNy4wMjRsLjAxNS0uMDAybC4yMDEtLjA5M2wuMDEtLjAwOGwuMDA0LS4wMTFsLjAxNy0uNDNsLS4wMDMtLjAxMmwtLjAxLS4wMXoiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTE1LjAwMyA0Yy43NDQgMCAxLjUzLjI2IDIuMjUuNTQ3bC41MjcuMjE2YzEuMjYuNTI4IDEuOTY4IDEuNjM2IDIuNTE3IDIuODUzYy44OTEgMS45NzUgMS41MSA0LjYwOCAxLjcyNCA2LjYxYy4xMDIuOTUuMTI3IDEuOTA2LS4wNTYgMi41NDljLS4xOTcuNjg3LS44NjcgMS4xNzMtMS41MTggMS41NTVsLS4zMjIuMTgzbC0uMzM0LjE4NnEtLjI2LjE0NC0uNTI1LjI4NGwtLjUyMi4yN2wtLjcxNy4zNTdsLS41NzcuMjg0YTEgMSAwIDEgMS0uODk0LTEuNzg4bC43OS0uMzlsLS41OC0uNjA5Yy0xLjM5LjU3LTMuMDI3Ljg5My00Ljc2Ni44OTNzLTMuMzc2LS4zMjItNC43NjYtLjg5M2wtLjU4LjYwOGwuNzkzLjM5YTEgMSAwIDEgMS0uODk0IDEuNzlsLS41NDQtLjI3Yy0uNDAyLS4yLS44MDUtLjM5OC0xLjIwMy0uNjA3bC0uOTI4LS41MDVsLS4zMjEtLjE4M2MtLjY1MS0uMzgyLTEuMzIyLS44NjgtMS41MTgtMS41NTVjLS4xODQtLjY0My0uMTU4LTEuNTk4LS4wNTctMi41NWMuMjE0LTIuMDAxLjgzMy00LjYzNCAxLjcyNC02LjYwOWMuNTQ5LTEuMjE3IDEuMjU3LTIuMzI1IDIuNTE3LTIuODUzQzcuMDU5IDQuNDEzIDguMDcyIDQgOSA0Yy42MDMgMCAxLjA3Ny41NTUuOTkgMS4xNDdBMTQgMTQgMCAwIDEgMTIgNWMuNjkxIDAgMS4zNjYuMDUgMi4wMTQuMTQ4QTEuMDEyIDEuMDEyIDAgMCAxIDE1LjAwNCA0Wk04Ljc1IDEwLjVhMS43NSAxLjc1IDAgMSAwIDAgMy41YTEuNzUgMS43NSAwIDAgMCAwLTMuNW02LjUgMGExLjc1IDEuNzUgMCAxIDAgMCAzLjVhMS43NSAxLjc1IDAgMCAwIDAtMy41Ii8+PC9nPjwvc3ZnPg==

[github-repo-stars-shield]:https://img.shields.io/github/stars/KindaBrazy/LynxHub?style=flat&labelColor=%23212121&color=%23d500f9&label=Stars&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiAxNmE3IDcgMCAxIDAgMC0xNGE3IDcgMCAwIDAgMCAxNG0wLTEwYy0uMjg0IDAtLjQ3NC4zNC0uODU0IDEuMDIzbC0uMDk4LjE3NmMtLjEwOC4xOTQtLjE2Mi4yOS0uMjQ2LjM1NGMtLjA4NS4wNjQtLjE5LjA4OC0uNC4xMzVsLS4xOS4wNDRjLS43MzguMTY3LTEuMTA3LjI1LTEuMTk1LjUzMmMtLjA4OC4yODMuMTY0LjU3Ny42NjcgMS4xNjVsLjEzLjE1MmMuMTQzLjE2Ny4yMTUuMjUuMjQ3LjM1NGMuMDMyLjEwNC4wMjEuMjE1IDAgLjQzOGwtLjAyLjIwM2MtLjA3Ni43ODUtLjExNCAxLjE3OC4xMTUgMS4zNTJjLjIzLjE3NC41NzYuMDE1IDEuMjY3LS4zMDNsLjE3OC0uMDgyYy4xOTctLjA5LjI5NS0uMTM1LjM5OS0uMTM1Yy4xMDQgMCAuMjAyLjA0NS4zOTkuMTM1bC4xNzguMDgyYy42OTEuMzE5IDEuMDM3LjQ3NyAxLjI2Ny4zMDNjLjIzLS4xNzQuMTkxLS41NjcuMTE1LTEuMzUybC0uMDItLjIwM2MtLjAyMS0uMjIzLS4wMzItLjMzNCAwLS40MzhjLjAzMi0uMTAzLjEwNC0uMTg3LjI0Ny0uMzU0bC4xMy0uMTUyYy41MDMtLjU4OC43NTUtLjg4Mi42NjctMS4xNjVjLS4wODgtLjI4Mi0uNDU3LS4zNjUtMS4xOTUtLjUzMmwtLjE5LS4wNDRjLS4yMS0uMDQ3LS4zMTUtLjA3LS40LS4xMzVjLS4wODQtLjA2NC0uMTM4LS4xNi0uMjQ2LS4zNTRsLS4wOTgtLjE3NkMxMi40NzQgNi4zNCAxMi4yODQgNiAxMiA2IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTYuNzE0IDE3LjMyM0w3LjM1MSAxNUw4IDEzaDhsLjY0OSAybC42MzcgMi4zMjNjLjYyOCAyLjI5Mi45NDIgMy40MzguNTIzIDQuMDY1Yy0uMTQ3LjIyLS4zNDQuMzk2LS41NzMuNTEzYy0uNjUyLjMzMi0xLjY2LS4xOTMtMy42NzUtMS4yNDNjLS42Ny0uMzUtMS4wMDYtLjUyNC0xLjM2Mi0uNTYyYTEuODcgMS44NyAwIDAgMC0uMzk4IDBjLS4zNTYuMDM4LS42OTEuMjEzLTEuMzYyLjU2MmMtMi4wMTUgMS4wNS0zLjAyMyAxLjU3NS0zLjY3NSAxLjI0M2ExLjUyMSAxLjUyMSAwIDAgMS0uNTczLS41MTNjLS40Mi0uNjI3LS4xMDUtMS43NzMuNTIzLTQuMDY1IiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=
