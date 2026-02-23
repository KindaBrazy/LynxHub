# LynxHub Shared Contracts (`src/common`)

`src/common` is the contract layer shared by:

- main process code (`src/main`)
- renderer code (`src/renderer`)
- preload code (`src/preload`)
- plugin/module API surfaces consumed by external packages

If something crosses process/runtime boundaries, it should usually be defined here first.

## Why this folder exists

This folder keeps cross-process behavior stable by centralizing:

- IPC channel names
- shared TypeScript models
- utility functions safe to reuse in multiple runtimes
- app-level constants sourced from `package.json`

Without this layer, main and renderer can drift and break each other silently.

## Directory map

| Path                      | Purpose                                                                             | Notes                                                        |
| ------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `consts/index.ts`         | App-level constants (name, version, links, page IDs, folder names).                 | Pulls from `package.json` and is consumed by both processes. |
| `consts/hotkeys.ts`       | Default hotkey definitions and metadata.                                            | Used by storage defaults and UI settings.                    |
| `consts/ipcChannels/*.ts` | Canonical IPC channel names grouped by domain.                                      | Must stay in sync with main handlers and renderer wrappers.  |
| `types/index.ts`          | Core shared types (`RepositoryInfo`, updates, notifications, tab data, etc.).       | General contracts across app features.                       |
| `types/ipc.ts`            | IPC payload/event types.                                                            | Keep channel payload types here, not inside handlers.        |
| `types/storage.ts`        | Full persistent storage schema (`AppStorageData`).                                  | Source of truth for storage structure.                       |
| `types/plugins/*`         | Module/extension API contracts.                                                     | Breaking changes here can break external plugins.            |
| `utils/*.ts`              | Runtime-safe helpers (formatting, URL, file name sanitizing, time, plugin helpers). | Avoid direct Electron dependencies here.                     |

## IPC contract model

Channel names are declared in `consts/ipcChannels/*` and then used in:

- main listeners and handlers in `src/main/ipc/*`
- renderer wrappers in `src/renderer/shared/ipc/*`

Current domain files:

- `application.ts`
- `browser.ts`
- `contextMenu.ts`
- `dialogsWindow.ts`
- `downloadManager.ts`
- `files.ts`
- `git.ts`
- `module.ts`
- `plugins.ts`
- `pty.ts`
- `shareScreen.ts`
- `statics.ts`
- `storage.ts`
- `toastWindow.ts`
- `user.ts`
- `utils.ts`

### Adding a new IPC method

1. Add/extend a channel in `src/common/consts/ipcChannels/<domain>.ts`.
2. Define or update payload/result types in `src/common/types/ipc.ts` (or another relevant shared type file).
3. Implement main-side listener/handler in `src/main/ipc`.
4. Expose renderer-side wrapper in `src/renderer/shared/ipc`.
5. Use the wrapper from UI code instead of raw `window.electron.ipcRenderer`.

## Shared plugin API surface

The plugin contract lives in `src/common/types/plugins`:

- `modules.ts` defines module card APIs (install flow, methods, renderer/main contracts)
- `extensions/*` defines extension renderer APIs, events, and injection points
- `index.ts` defines metadata/versioning compatibility models

If you change these files, treat it as public API work.

Recommended when changing plugin contracts:

1. Keep changes backward compatible when possible.
2. If breaking, bump API version fields in `package.json` (`moduleApiVersion`, `extensionApiVersion`).
3. Update both main and renderer implementations in the same PR.

## Runtime boundary rules

Code in `src/common` is imported by both Node/Electron and browser contexts.

Keep these rules:

- Do not depend on Electron modules here.
- Avoid Node-only APIs unless usage is guarded and safe for renderer bundles.
- Avoid direct DOM globals unless guarded.
- Prefer pure functions and serializable types.
- Keep side effects out of shared type/const modules.

## Contributor checklist

Before opening a PR that touches `src/common`:

1. Confirm the change is truly cross-process/shared.
2. Verify main and renderer compile against the updated contracts.
3. Run:

```bash
npm run typecheck
```

4. If IPC-related, manually test the full request/response flow.
5. If plugin contract-related, validate module/extension loading paths.

## Related docs

- main process guide: `src/main/README.md`
- renderer guide: `src/renderer/README.md`
- root project guide: `README.md`
