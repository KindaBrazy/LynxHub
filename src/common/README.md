# LynxHub Common Shared Code

This directory (`src/common`) contains source code that is **shared** between the **Electron Main Process** (`src/main`) and the **Renderer Process** (`src/renderer`).

Code in this directory must be platform-agnostic or safely handle environment differences, as it is imported in both Node.js (Main) and Browser (Renderer) environments.

## 📂 Directory Structure

- **`consts/`**: Application-wide constants.
  - **`ipcChannels/`**: Definitions of IPC channel names used for communication between Main and Renderer.
  - **`hotkeys.ts`**: Keyboard shortcut definitions.
- **`types/`**: TypeScript type definitions and interfaces.
  - **`plugins/`**: Types related to the plugin system (Extensions & Modules).
  - **`index.ts`**: Core application types (RepositoryInfo, AppUpdateInfo, NotificationData, etc.).
- **`utils/`**: Shared utility functions.
  - **`env.ts`**: Environment checks.
  - **`fileUtils.ts`**: Common file path and handling utilities.
  - **`formatting.ts`**: Text and data formatting helpers.

## 🚀 Key Components

### 1. IPC Channels (`consts/ipcChannels`)

Defines the contract for Inter-Process Communication. Both the Main process (which listens for these events) and the Renderer process (which sends them) import these constants to ensure type safety and consistency.

Example:
- `application.ts`: General app events (dark mode, window state).
- `git.ts`: Git-related operations.
- `plugins.ts`: Plugin management events.

### 2. Shared Types (`types/`)

Ensures that data structures passed between processes (e.g., `RepositoryInfo`, `NotificationData`) are consistent. If you change a type here, it updates for both the backend and frontend.

Key types:
- `RepositoryInfo`: Git branch and status info.
- `ModuleInfo` / `ExtensionInfo`: Plugin metadata.
- `AppUpdateInfo`: Auto-updater status.

### 3. Utilities (`utils/`)

Helper functions that don't rely on specific Electron Main or Renderer APIs, or that abstract them away.

- **`platform.ts`**: OS detection.
- **`time.ts`**: Date and time formatting.
- **`urlUtils.ts`**: URL validation and manipulation.

## ⚠️ Development Guidelines

1.  **No Node.js-only APIs**: Avoid importing modules like `fs` or `path` directly if the code will run in the browser, unless polyfilled or handled gracefully.
2.  **No DOM-only APIs**: Avoid accessing `window` or `document` directly without checking if the environment is the browser.
3.  **Type Safety**: Use this folder to define the "contract" between your frontend and backend.
