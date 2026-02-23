# LynxHub Main Process (`src/main`)

This folder is the Electron backend runtime for LynxHub. It owns:

- application lifecycle
- OS/native integrations
- window and child-window orchestration
- storage and migrations
- plugin/module/extension loading
- IPC handlers for renderer and preload calls

If a feature needs Electron APIs, Node-only APIs, or file-system control, it usually belongs here.

## Responsibilities at a glance

| Area | Main process ownership |
| --- | --- |
| App lifecycle | startup, activation, shutdown, relaunch |
| Windows | main window + loading + context menu + toast + share screen + link preview |
| IPC server | all `ipcMain` listeners/handlers and event fan-out |
| Storage | lowdb persistence, migrations, secure browser-data handling |
| Plugins | validate, install, sync, import module/extension runtimes |
| Native ops | PTY, filesystem, shell, tray, updater, desktop capture |
| Protocols | `lynxplugin://` and image-cache custom schemes |

## Startup flow (actual runtime sequence)

Main entry is `src/main/index.ts`.

1. `configureAppBeforeReady()` runs before `app.whenReady()`:
   - applies performance command-line switches from storage
   - optionally disables hardware acceleration
   - initializes Sentry when enabled
   - registers privileged schemes (`lynxplugin`, image cache)
2. Loading window class is created.
3. On `app.whenReady()`:
   - checks plugin migration flag from storage
   - if migration needed, runs `PluginMigrate` flow
   - otherwise starts loading window and continues initialization
4. `initializeLynxHub()`:
   - fixes environment path (`fix-path`)
   - ensures app data folders exist
   - completes deferred storage migrations and decrypt cache data
   - initializes managers via `classHolder.initializeManagers()`
   - checks statics requirements
   - registers custom protocols
   - initializes plugins/extensions (`pluginManager.initPlugins()`, `extensionManager.onAppReady()`)
   - registers all IPC listeners (`listenToIpcChannels()`)
   - starts main window
   - starts updater checks
5. On main window ready:
   - loading window closes
   - post-show setup applies taskbar/tray behavior and startup window state
   - share-screen manager is started

## Core architecture

### `managers/classHolder.ts` is the central runtime container

`ClassHolder` is a singleton dependency container with:

- eager services: `storageManager`, online status checker
- initialized services: `moduleManager`, `extensionManager`, `pluginManager`, `appManager`, `trayManager`, etc.
- readiness utility: `waitForClass()` for async-safe manager access

Use `waitForClass()` whenever initialization order is uncertain.

### Manager responsibilities

| Path | Role |
| --- | --- |
| `mainWindow/index.ts` | Main `BrowserWindow` creation, event wiring, URL loading, hotkey registration. |
| `managers/dataFolder.ts` | App data path strategy (portable vs installed), folder checks, data-dir switching. |
| `managers/updater.ts` | `electron-updater` integration and update event relay. |
| `managers/statics.ts` | Clones/pulls static metadata repository and serves typed content. |
| `managers/tray.ts` | Tray creation/update and taskbar/tray mode integration. |
| `managers/hotkeys.ts` | WebContents input listener and hotkey IPC events. |
| `managers/imageCache.ts` | Custom image cache scheme lifecycle. |

### Plugin stack

Plugin loading and lifecycle lives under `plugins/`:

- `plugins/index.ts` (`PluginManager`) validates folder structure, installs/uninstalls/syncs plugins
- `plugins/modules/index.ts` (`ModuleManager`) imports module main scripts and exposes module methods
- `plugins/extensions/index.ts` (`ExtensionManager`) imports extension main entry points and lifecycle callbacks
- plugin metadata/version compatibility is resolved via statics data

Migration path from older plugin layout is in `setup/migration.ts`.

### Storage stack

- `storage/index.ts` is low-level lowdb persistence + schema migrations
- `storage/storageOperations.ts` provides high-level domain operations and IPC notifications
- storage schema lives in `src/common/types/storage.ts`

### Child windows

`childWindows/` manages specialized windows:

- `loading.ts`
- `contextMenu.ts`
- `toast.ts`
- `shareScreen.ts`
- `linkPreview.ts`
- `browserDownloadManager.ts`

These windows are intentionally isolated and communicate through IPC channels.

## IPC architecture

Main-side IPC entrypoint: `ipc/index.ts`

This bootstraps domain listeners in order:

- storage and storage utilities
- application
- files
- git
- misc utilities
- PTY
- module APIs
- plugin APIs
- context menu/statics domains
- manager-owned channel listeners

Implementation pattern:

- channel constants: `src/common/consts/ipcChannels/*`
- main listener/handler: `src/main/ipc/*`
- renderer wrapper: `src/renderer/shared/ipc/*`

Do not invent ad-hoc string channels inside feature files.

## Folder map

| Folder | Purpose |
| --- | --- |
| `childWindows/` | Child-window classes and controllers. |
| `git/` | Git manager and listener integration. |
| `ipc/` | Main IPC listeners, wrappers, handlers, and domain methods. |
| `mainWindow/` | Main app window manager. |
| `managers/` | Core service managers and runtime orchestration. |
| `monitoring/` | Sentry, Patreon auth, token helpers. |
| `plugins/` | Plugin/module/extension lifecycle and compatibility logic. |
| `setup/` | One-time migration flows. |
| `storage/` | Persistence, schema defaults, migration functions, domain storage ops. |
| `utils/` | Main-process utility helpers. |

## Contributor workflows

### Add a new IPC feature

1. Add channel constant in `src/common/consts/ipcChannels/<domain>.ts`.
2. Add/update payload types in `src/common/types`.
3. Add main listener/handler in `src/main/ipc`.
4. Add renderer wrapper in `src/renderer/shared/ipc`.
5. Use wrapper from renderer UI code.

### Add a new manager

1. Create manager class under `src/main/managers`.
2. Add property + getter/setter to `ClassHolder`.
3. Initialize in `ClassHolder.initializeManagers()`.
4. If startup-critical, integrate in `src/main/index.ts` flow.

### Add a new child window

1. Create class under `src/main/childWindows`.
2. Load `*.html` via dev/prod URL pattern.
3. Wire lifecycle from main window or app lifecycle.
4. Add matching renderer entry in `src/renderer/childWindows`.
5. Register HTML input in `electron.vite.config.ts`.

## Operational notes and pitfalls

- Avoid assuming main window exists; use `classHolder.waitForClass('appManager')` when needed.
- Main process can restart window lifecycle on macOS activate; keep handlers idempotent.
- Plugin and statics operations must tolerate offline mode and missing Git.
- For portable mode, prefer helpers in `managers/dataFolder.ts` and `utils` for path conversion.
- Do not block startup with long synchronous operations in listeners.

## Validate changes

```bash
npm run typecheck
```

Recommended for main-heavy changes:

```bash
npm run dev
```

Then validate:

- app boot and shutdown
- IPC round-trips for modified domains
- plugin/module loading
- child window behavior impacted by your change

## Related docs

- shared contracts: `src/common/README.md`
- renderer architecture: `src/renderer/README.md`
- project overview: `README.md`
