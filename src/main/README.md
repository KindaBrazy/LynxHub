# LynxHub Main Process

This directory (`src/main`) contains the source code for the **Electron Main Process** of LynxHub. The main process is responsible for creating and managing application windows, handling system events, and interacting with the operating system.

## 🚀 Entry Point

The entry point for the main process is [`index.ts`](./index.ts). This file is responsible for:

1.  **Lifecycle Management**: Handling app startup, activation, and shutdown events.
2.  **Initialization**: Setting up logging, fixing environment paths (macOS), and initializing core components.
3.  **Migration**: Checking and running data migrations if necessary.
4.  **Window Creation**: creating the main application window via `AppManager`.

## 🏗️ Architecture & Core Components

The main process is structured around a central dependency injection container and a set of managers that handle specific domains of the application.

### 1. ClassHolder (Dependency Injection)

Located in [`managers/classHolder.ts`](./managers/classHolder.ts), the `ClassHolder` is a singleton that initializes and holds references to all major managers. It acts as the central hub for accessing services like `StorageManager`, `PluginManager`, `AppManager`, etc.

### 2. Managers

Managers encapsulate the logic for specific features. They are located in [`managers/`](./managers/). Key managers include:

- **`AppManager`** (`mainWindow/`): Manages the main browser window lifecycle.
- **`PluginManager`** (`plugins/`): Handles installation, loading, and updating of plugins (Extensions & Modules).
- **`StorageManager`** (`storage/`): Handles local file storage and data persistence.
- **`TrayManager`**: Manages the system tray icon and menu.
- **`BrowserDownloadManager`**: Manages file downloads.

### 3. IPC (Inter-Process Communication)

Communication between the Main process and the Renderer process is handled via IPC channels defined in [`ipc/`](./ipc/).

- **`index.ts`**: Registers all IPC listeners.
- **`methods/`**: Contains the actual implementation of IPC handlers.
- **`ipcWrapper.ts`**: Provides a type-safe wrapper for IPC calls.

### 4. Plugins System

The plugin system (`plugins/`) allows LynxHub to be extended.

- **`PluginManager`**: Orchestrates the loading and validation of plugins.
- **`ModuleManager`**: Handles "Modules" (core functionalities).
- **`ExtensionManager`**: Handles "Extensions" (add-ons).
- Plugins are loaded from the user's `Plugins` data directory and are git-based.

### 5. Child Windows

Secondary windows (like the loading screen, context menus, toast notifications) are managed in [`childWindows/`](./childWindows/).

## 🔄 How it Works (Startup Flow)

1.  **`index.ts`** starts.
2.  **`configureAppBeforeReady()`** sets up protocols and flags.
3.  **`app.whenReady()`** triggers.
4.  **Migration Check**: Checks if `plugin` storage needs migration.
    - If yes, runs `PluginMigrate`.
    - If no, calls `initializeLynxHub()`.
5.  **`initializeLynxHub()`**:
    - Checks/Creates app data directories.
    - Initializes all managers via `classHolder.initializeManagers()`.
    - Registers IPC listeners (`listenToIpcChannels()`).
    - Starts the main window via `appManager.startApp()`.

## 🛠️ Development Guide

### Adding a New IPC Channel

1.  Define the handler in a relevant file within `ipc/methods/` or create a new one.
2.  Register the listener in `ipc/index.ts` or a specific IPC loader (e.g., `ipc/application.ts`).
3.  Ensure types are shared with the renderer (usually in `src/common`).

### Adding a New Manager

1.  Create the manager class in `managers/`.
2.  Add it to `ClassHolder` in `managers/classHolder.ts`.
3.  Initialize it in `ClassHolder.initializeManagers()`.

## 📂 Directory Structure

- `childWindows/`: Logic for secondary windows.
- `git/`: Git operation handlers.
- `ipc/`: IPC listeners and handlers.
- `mainWindow/`: Main window configuration and management.
- `managers/`: Core logic and state management.
- `monitoring/`: Sentry and authentication monitoring.
- `plugins/`: Plugin system logic.
- `setup/`: Migration and setup scripts.
- `storage/`: File system storage logic.
- `utils/`: General utility functions.
